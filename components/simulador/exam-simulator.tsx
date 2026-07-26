"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExamHeader } from "./exam-header";
import { ExamFooter } from "./exam-footer";
import { QuestionMultipleChoice } from "./question-mc";
import { QuestionPlaceholder } from "./question-placeholder";
import { QuestionNavigator } from "./question-navigator";
import { MobileWarning } from "./mobile-warning";
import type { SimulatorData } from "@/lib/exam/loader";
import {
  saveAnswerAction,
  syncTimerAction,
  toggleBookmarkAction,
  pausePaperAction,
  expirePaperAction,
} from "@/app/alumno/examenes/actions";

const SYNC_INTERVAL_MS = 30_000; // sincronizar timer con BD cada 30s
const SAVE_DEBOUNCE_MS = 400; // debounce guardado de respuestas

interface Props {
  data: SimulatorData;
}

export function ExamSimulator({ data }: Props) {
  const router = useRouter();

  // ─── Estado principal ───────────────────────────────────────
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Respuestas (question_id → selected_option_id)
  const [answers, setAnswers] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    data.saved_answers.forEach((a) => {
      if (a.selected_option_id) m.set(a.question_id, a.selected_option_id);
    });
    return m;
  });

  const [bookmarks, setBookmarks] = useState<Set<string>>(
    () => new Set(data.bookmarked_question_ids)
  );

  const [timerHidden, setTimerHidden] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  const secondsLeftRef = useRef(data.time_remaining_seconds);


  // ─── Efectos: online/offline ────────────────────────────────
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const onOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };
    const onOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      // Ocultar el toast a los 4 segundos
      setTimeout(() => setShowOfflineToast(false), 4000);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);


  // ─── Sincronización periódica del timer con la BD ───────────
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isOnline) return;
      syncTimerAction({
        paperAttemptId: data.paper_attempt_id,
        timeRemainingSeconds: secondsLeftRef.current,
      }).catch(() => {
        /* silencioso: reintenta al siguiente ciclo */
      });
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [data.paper_attempt_id, isOnline]);


  // ─── Pausar al cerrar navegador / navegar fuera ─────────────
  useEffect(() => {
    const onBeforeUnload = () => {
      // sendBeacon para petición no bloqueante al cerrar
      const body = JSON.stringify({
        paperAttemptId: data.paper_attempt_id,
        timeRemainingSeconds: secondsLeftRef.current,
      });
      // Fallback: llamada síncrona a la action
      // (no podemos hacer sendBeacon a una server action fácil, así que
      //  el pausePaperAction se dispara en el useEffect de cleanup abajo)
      void pausePaperAction({
        paperAttemptId: data.paper_attempt_id,
        timeRemainingSeconds: secondsLeftRef.current,
      });
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      // Al desmontar (navegación interna con router), pausar
      void pausePaperAction({
        paperAttemptId: data.paper_attempt_id,
        timeRemainingSeconds: secondsLeftRef.current,
      });
    };
  }, [data.paper_attempt_id]);


  // ─── Callbacks del timer ────────────────────────────────────
  const handleTick = useCallback((secondsLeft: number) => {
    secondsLeftRef.current = secondsLeft;
  }, []);

  const handleExpire = useCallback(async () => {
    const res = await expirePaperAction({
      paperAttemptId: data.paper_attempt_id,
    });
    // Decisión 7 = A: redirigir inmediatamente a las tarjetas
    router.push(res.redirectTo ?? `/alumno/examenes/${data.exam_id}`);
  }, [data.paper_attempt_id, data.exam_id, router]);


  // ─── Guardar respuesta (debounced) ──────────────────────────
  const saveTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const scheduleSave = useCallback(
    (questionId: string, selectedOptionId: string | null) => {
      const existing = saveTimeoutRef.current.get(questionId);
      if (existing) clearTimeout(existing);
      const to = setTimeout(() => {
        saveAnswerAction({
          paperAttemptId: data.paper_attempt_id,
          questionId,
          selectedOptionId,
        }).catch(() => {
          /* silencioso: se guardará al siguiente cambio */
        });
        saveTimeoutRef.current.delete(questionId);
      }, SAVE_DEBOUNCE_MS);
      saveTimeoutRef.current.set(questionId, to);
    },
    [data.paper_attempt_id]
  );

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, optionId);
      return next;
    });
    scheduleSave(questionId, optionId);
  };


  // ─── Bookmark ───────────────────────────────────────────────
  const handleToggleBookmark = (questionId: string) => {
    const wasBookmarked = bookmarks.has(questionId);
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
    // Fire and forget
    toggleBookmarkAction({
      paperAttemptId: data.paper_attempt_id,
      questionId,
      bookmarked: !wasBookmarked,
    }).catch(() => {
      /* silencioso */
    });
  };


  // ─── Navegación ─────────────────────────────────────────────
  const totalQuestions = data.parts.reduce(
    (n, p) => n + p.questions.length,
    0
  );

  const currentPart = data.parts[currentPartIndex];
  const currentQuestion = currentPart?.questions[currentQuestionIndex];

  const goToPrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      return;
    }
    if (currentPartIndex > 0) {
      const newPart = currentPartIndex - 1;
      const newQ = data.parts[newPart].questions.length - 1;
      setCurrentPartIndex(newPart);
      setCurrentQuestionIndex(Math.max(0, newQ));
    }
  }, [currentPartIndex, currentQuestionIndex, data.parts]);

  const goToNext = useCallback(() => {
    if (currentQuestionIndex < (currentPart?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }
    if (currentPartIndex < data.parts.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
      setCurrentQuestionIndex(0);
    }
  }, [currentPartIndex, currentQuestionIndex, currentPart, data.parts]);

  const jumpTo = useCallback((partIndex: number, questionIndex: number) => {
    setCurrentPartIndex(partIndex);
    setCurrentQuestionIndex(questionIndex);
  }, []);


  // ─── Navegación con teclado ─────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // No interferir si el foco está en un input/textarea
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (navigatorOpen) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goToPrev, goToNext, navigatorOpen]);


  // ─── Cálculos derivados ─────────────────────────────────────
  const answeredQuestionIds = new Set(answers.keys());

  const canGoPrev = currentPartIndex > 0 || currentQuestionIndex > 0;
  const canGoNext =
    currentPartIndex < data.parts.length - 1 ||
    currentQuestionIndex < (currentPart?.questions.length ?? 0) - 1;


  // ─── Render ─────────────────────────────────────────────────
  return (
    <>
      <MobileWarning examId={data.exam_id} />

      <div className="hidden md:flex flex-col min-h-screen bg-paper">
        <ExamHeader
          studentName={data.student_name}
          examTitle={data.exam_title}
          paperTitle={data.paper_title}
          timeRemainingSeconds={data.time_remaining_seconds}
          isOnline={isOnline}
          timerHidden={timerHidden}
          onToggleTimer={() => setTimerHidden((v) => !v)}
          onOpenNotes={() => {
            // Placeholder para Fase 6C.2 (notas del alumno)
            alert("Las notas del alumno estarán en la siguiente fase.");
          }}
          onOpenHelp={() => {
            // Muestra instrucciones de la Part actual
            const inst =
              currentPart?.instructions ?? "Sin instrucciones para esta Part.";
            alert(inst);
          }}
          onTick={handleTick}
          onExpire={handleExpire}
        />

        {/* Instrucciones de la Part actual */}
        {currentPart && (
          <div className="fixed top-[54px] inset-x-0 z-30 bg-white border-b border-rule">
            <div className="px-4 md:px-6 py-3 max-w-5xl mx-auto">
              <p className="text-xs uppercase tracking-wider text-navy font-medium">
                Part {currentPart.part_number}
                {currentPart.title ? ` — ${currentPart.title}` : ""}
              </p>
              {currentPart.instructions && (
                <p className="text-xs text-muted mt-1 line-clamp-2">
                  {currentPart.instructions}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-1 pt-[130px] pb-[80px] px-4 md:px-6 overflow-y-auto">
          <div className="py-8">
            {currentQuestion ? (
              currentQuestion.question_type === "multiple_choice" ? (
                <QuestionMultipleChoice
                  question={currentQuestion}
                  selectedOptionId={answers.get(currentQuestion.id) ?? null}
                  isBookmarked={bookmarks.has(currentQuestion.id)}
                  onSelect={(optId) =>
                    handleSelectOption(currentQuestion.id, optId)
                  }
                  onToggleBookmark={() =>
                    handleToggleBookmark(currentQuestion.id)
                  }
                />
              ) : (
                <QuestionPlaceholder
                  question={currentQuestion}
                  isBookmarked={bookmarks.has(currentQuestion.id)}
                  onToggleBookmark={() =>
                    handleToggleBookmark(currentQuestion.id)
                  }
                />
              )
            ) : (
              <p className="text-center text-muted">
                No hay preguntas en esta parte.
              </p>
            )}
          </div>
        </main>

        <ExamFooter
          parts={data.parts}
          currentPartIndex={currentPartIndex}
          currentQuestionIndex={currentQuestionIndex}
          answeredQuestionIds={answeredQuestionIds}
          bookmarkedQuestionIds={bookmarks}
          onJumpToQuestion={jumpTo}
          onOpenNavigator={() => setNavigatorOpen(true)}
          onPrev={goToPrev}
          onNext={goToNext}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
        />

        <QuestionNavigator
          open={navigatorOpen}
          onClose={() => setNavigatorOpen(false)}
          parts={data.parts}
          answeredQuestionIds={answeredQuestionIds}
          bookmarkedQuestionIds={bookmarks}
          onJump={jumpTo}
        />

        {/* Toast offline */}
        {showOfflineToast && (
          <div className="fixed bottom-24 right-6 z-50 rounded bg-error text-white px-4 py-3 shadow-lg text-sm max-w-sm">
            <p className="font-medium">Sin conexión</p>
            <p className="text-xs opacity-90 mt-0.5">
              Tus respuestas se guardarán cuando vuelva la conexión.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
