"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExamHeader } from "./exam-header";
import { ExamFooter } from "./exam-footer";
import { QuestionMultipleChoice } from "./question-mc";
import { QuestionOpenCloze } from "./question-open-cloze";
import { QuestionMultipleChoiceCloze } from "./question-mc-cloze";
import { QuestionMatching } from "./question-matching";
import { QuestionGapped } from "./question-gapped";
import { QuestionWriting } from "./question-writing";
import { QuestionPlaceholder } from "./question-placeholder";
import { QuestionNavigator } from "./question-navigator";
import { NotesPanel } from "./notes-panel";
import { MobileWarning } from "./mobile-warning";
import type { SimulatorData } from "@/lib/exam/loader";
import {
  saveAnswerAction,
  syncTimerAction,
  toggleBookmarkAction,
  pausePaperAction,
  expirePaperAction,
  saveNotesAction,
} from "@/app/alumno/examenes/actions";

const SYNC_INTERVAL_MS = 30_000;
const SAVE_DEBOUNCE_MS = 400;
const TEXT_SAVE_DEBOUNCE_MS = 700;

interface Props {
  data: SimulatorData;
}

export function ExamSimulator({ data }: Props) {
  const router = useRouter();

  // ─── Estado ─────────────────────────────────────────────────
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedOptions, setSelectedOptions] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    data.saved_answers.forEach((a) => {
      if (a.selected_option_id) m.set(a.question_id, a.selected_option_id);
    });
    return m;
  });

  const [answerTexts, setAnswerTexts] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    data.saved_answers.forEach((a) => {
      if (a.answer_text) m.set(a.question_id, a.answer_text);
    });
    return m;
  });

  const [bookmarks, setBookmarks] = useState<Set<string>>(
    () => new Set(data.bookmarked_question_ids)
  );

  const [timerHidden, setTimerHidden] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesContent, setNotesContent] = useState(data.notes_content);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  const secondsLeftRef = useRef(data.time_remaining_seconds);


  // ─── Online/offline ─────────────────────────────────────────
  useEffect(() => {
    if (typeof navigator !== "undefined") setIsOnline(navigator.onLine);
    const onOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };
    const onOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      setTimeout(() => setShowOfflineToast(false), 4000);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);


  // ─── Sync timer ─────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isOnline) return;
      syncTimerAction({
        paperAttemptId: data.paper_attempt_id,
        timeRemainingSeconds: secondsLeftRef.current,
      }).catch(() => {});
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [data.paper_attempt_id, isOnline]);


  // ─── Pausar al cerrar / navegar fuera ───────────────────────
  useEffect(() => {
    const onBeforeUnload = () => {
      void pausePaperAction({
        paperAttemptId: data.paper_attempt_id,
        timeRemainingSeconds: secondsLeftRef.current,
      });
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
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
    router.push(res.redirectTo ?? `/alumno/examenes/${data.exam_id}`);
  }, [data.paper_attempt_id, data.exam_id, router]);


  // ─── Autosave (option) ──────────────────────────────────────
  const saveTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const scheduleSaveOption = useCallback(
    (questionId: string, selectedOptionId: string | null) => {
      const existing = saveTimeoutRef.current.get(questionId);
      if (existing) clearTimeout(existing);
      const to = setTimeout(() => {
        saveAnswerAction({
          paperAttemptId: data.paper_attempt_id,
          questionId,
          selectedOptionId,
        }).catch(() => {});
        saveTimeoutRef.current.delete(questionId);
      }, SAVE_DEBOUNCE_MS);
      saveTimeoutRef.current.set(questionId, to);
    },
    [data.paper_attempt_id]
  );

  const scheduleSaveText = useCallback(
    (questionId: string, text: string) => {
      const existing = saveTimeoutRef.current.get(questionId);
      if (existing) clearTimeout(existing);
      const to = setTimeout(() => {
        saveAnswerAction({
          paperAttemptId: data.paper_attempt_id,
          questionId,
          answerText: text,
        }).catch(() => {});
        saveTimeoutRef.current.delete(questionId);
      }, TEXT_SAVE_DEBOUNCE_MS);
      saveTimeoutRef.current.set(questionId, to);
    },
    [data.paper_attempt_id]
  );

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      next.set(questionId, optionId);
      return next;
    });
    scheduleSaveOption(questionId, optionId);
  };

  const handleChangeText = (questionId: string, text: string) => {
    setAnswerTexts((prev) => {
      const next = new Map(prev);
      next.set(questionId, text);
      return next;
    });
    scheduleSaveText(questionId, text);
  };


  // ─── Bookmarks ──────────────────────────────────────────────
  const handleToggleBookmark = (questionId: string) => {
    const wasBookmarked = bookmarks.has(questionId);
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
    toggleBookmarkAction({
      paperAttemptId: data.paper_attempt_id,
      questionId,
      bookmarked: !wasBookmarked,
    }).catch(() => {});
  };


  // ─── Notas ──────────────────────────────────────────────────
  const handleSaveNotes = useCallback(
    async (content: string) => {
      setNotesContent(content);
      await saveNotesAction({
        paperAttemptId: data.paper_attempt_id,
        content,
      });
    },
    [data.paper_attempt_id]
  );


  // ─── Navegación ─────────────────────────────────────────────
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


  // ─── Teclado ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (navigatorOpen || notesOpen) return;
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
  }, [goToPrev, goToNext, navigatorOpen, notesOpen]);


  // ─── Cálculos derivados ─────────────────────────────────────
  const answeredQuestionIds = new Set<string>();
  selectedOptions.forEach((_, k) => answeredQuestionIds.add(k));
  answerTexts.forEach((v, k) => {
    if (v.trim().length > 0) answeredQuestionIds.add(k);
  });

  const canGoPrev = currentPartIndex > 0 || currentQuestionIndex > 0;
  const canGoNext =
    currentPartIndex < data.parts.length - 1 ||
    currentQuestionIndex < (currentPart?.questions.length ?? 0) - 1;


  // ─── Contexto de la Part ────────────────────────────────────
  const partBaseText =
    currentPart?.settings && typeof currentPart.settings === "object"
      ? ((currentPart.settings as Record<string, unknown>).base_text as
          | string
          | undefined)
      : undefined;

  const partReadingText =
    currentPart?.settings && typeof currentPart.settings === "object"
      ? ((currentPart.settings as Record<string, unknown>).reading_text as
          | string
          | undefined)
      : undefined;

  const partMatchingOptions =
    currentPart?.settings && typeof currentPart.settings === "object"
      ? ((currentPart.settings as Record<string, unknown>).matching_options as
          | Array<{ letter: string; text: string }>
          | undefined)
      : undefined;

  const partContextText = partReadingText ?? partBaseText;
  const hasTextContext = Boolean(partContextText) || Boolean(partMatchingOptions);
  const availableLetters = partMatchingOptions?.map((o) => o.letter) ?? [];


  // ─── Render de la pregunta ──────────────────────────────────
  function renderQuestion() {
    if (!currentQuestion) {
      return (
        <p className="text-center text-muted">
          No hay preguntas en esta parte.
        </p>
      );
    }

    const isBookmarked = bookmarks.has(currentQuestion.id);

    switch (currentQuestion.question_type) {
      case "multiple_choice":
        return (
          <QuestionMultipleChoice
            question={currentQuestion}
            selectedOptionId={selectedOptions.get(currentQuestion.id) ?? null}
            isBookmarked={isBookmarked}
            onSelect={(optId) => handleSelectOption(currentQuestion.id, optId)}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
          />
        );

      case "multiple_choice_cloze":
        return (
          <QuestionMultipleChoiceCloze
            question={currentQuestion}
            selectedOptionId={selectedOptions.get(currentQuestion.id) ?? null}
            isBookmarked={isBookmarked}
            onSelect={(optId) => handleSelectOption(currentQuestion.id, optId)}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
          />
        );

      case "open_cloze":
        return (
          <QuestionOpenCloze
            question={currentQuestion}
            answerText={answerTexts.get(currentQuestion.id) ?? ""}
            isBookmarked={isBookmarked}
            onChange={(t) => handleChangeText(currentQuestion.id, t)}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
          />
        );

      case "multiple_matching":
        return (
          <QuestionMatching
            question={currentQuestion}
            availableLetters={availableLetters}
            answerLetter={answerTexts.get(currentQuestion.id) ?? ""}
            isBookmarked={isBookmarked}
            onChange={(letter) => handleChangeText(currentQuestion.id, letter)}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
          />
        );

      case "gapped_text":
        return (
          <QuestionGapped
            question={currentQuestion}
            availableLetters={availableLetters}
            answerLetter={answerTexts.get(currentQuestion.id) ?? ""}
            isBookmarked={isBookmarked}
            onChange={(letter) => handleChangeText(currentQuestion.id, letter)}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
          />
        );

      case "writing_task":
        return (
          <QuestionWriting
            question={currentQuestion}
            answerText={answerTexts.get(currentQuestion.id) ?? ""}
            isBookmarked={isBookmarked}
            onChange={(t) => handleChangeText(currentQuestion.id, t)}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
          />
        );

      default:
        return (
          <QuestionPlaceholder
            question={currentQuestion}
            isBookmarked={isBookmarked}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
          />
        );
    }
  }


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
          onOpenNotes={() => setNotesOpen(true)}
          onOpenHelp={() => {
            const inst =
              currentPart?.instructions ?? "Sin instrucciones para esta Part.";
            alert(inst);
          }}
          onTick={handleTick}
          onExpire={handleExpire}
        />

        {/* Cinta de instrucciones */}
        {currentPart && (
          <div className="fixed top-[54px] inset-x-0 z-30 bg-white border-b border-rule">
            <div className="px-4 md:px-6 py-3 max-w-6xl mx-auto">
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

        {/* Contenido */}
        <main className="flex-1 pt-[130px] pb-[80px] px-4 md:px-6 overflow-y-auto">
          {hasTextContext ? (
            <div className="max-w-6xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda: texto compartido + opciones A-H */}
              <div className="lg:sticky lg:top-[145px] lg:self-start">
                <div className="rounded border border-rule bg-white p-6 max-h-[calc(100vh-220px)] overflow-y-auto space-y-5">
                  {partContextText && (
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                      {partContextText}
                    </p>
                  )}
                  {partMatchingOptions && partMatchingOptions.length > 0 && (
                    <div className={partContextText ? "pt-5 border-t border-rule" : ""}>
                      <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3">
                        Options
                      </p>
                      <div className="space-y-3">
                        {partMatchingOptions.map((opt) => (
                          <div key={opt.letter} className="flex gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded bg-navy text-white text-sm font-semibold">
                              {opt.letter}
                            </span>
                            <p className="text-sm text-ink leading-relaxed flex-1">
                              {opt.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna derecha: pregunta actual */}
              <div>{renderQuestion()}</div>
            </div>
          ) : (
            <div className="py-8">{renderQuestion()}</div>
          )}
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

        <NotesPanel
          open={notesOpen}
          initialContent={notesContent}
          onClose={() => setNotesOpen(false)}
          onSave={handleSaveNotes}
        />

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
