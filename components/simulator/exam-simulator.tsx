"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, AlertTriangle, Menu, X, Clock } from "lucide-react";
import type { LoadedExamForAttempt, LoadedPart, LoadedQuestion } from "@/lib/exams/loader";
import { saveAnswersAction, submitAttemptAction } from "@/app/alumno/examen/actions";
import { MultipleChoiceRenderer } from "./question-renderers/multiple-choice-renderer";
import { OpenClozeRenderer } from "./question-renderers/open-cloze-renderer";
import { MultipleMatchingRenderer } from "./question-renderers/multiple-matching-renderer";
import { WritingTaskRenderer } from "./question-renderers/writing-task-renderer";

// ─── Tipos ──────────────────────────────────────────────────────────
interface AnswerState {
  answerText: string | null;
  selectedOptionId: string | null;
}

interface Props {
  loaded: LoadedExamForAttempt;
}

const AUTOSAVE_INTERVAL_MS = 15_000;

/**
 * Formatea segundos a HH:MM:SS o MM:SS
 */
function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function ExamSimulator({ loaded }: Props) {
  const router = useRouter();

  // ─── Estado global de respuestas ─────────────────────────────────
  // key = question_id, value = { answerText, selectedOptionId }
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(() => {
    const initial = new Map<string, AnswerState>();
    for (const part of loaded.parts) {
      for (const q of part.questions) {
        if (q.current_answer) {
          initial.set(q.id, {
            answerText: q.current_answer.answer_text,
            selectedOptionId: q.current_answer.selected_option_id,
          });
        }
      }
    }
    return initial;
  });

  // Set de IDs con cambios pendientes de guardar
  const dirtyRef = useRef<Set<string>>(new Set());

  // ─── Navegación entre partes / preguntas ─────────────────────────
  const [activePartIndex, setActivePartIndex] = useState(0);
  const activePart: LoadedPart | undefined = loaded.parts[activePartIndex];
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // ─── Timer ────────────────────────────────────────────────────────
  const totalTimeSec = loaded.exam.total_time_minutes * 60;
  const [remainingSec, setRemainingSec] = useState(() => {
    const spent = loaded.attempt.time_spent_seconds ?? 0;
    return Math.max(0, totalTimeSec - spent);
  });
  const [showTimer, setShowTimer] = useState(true);
  const [timeSpentSec, setTimeSpentSec] = useState(loaded.attempt.time_spent_seconds ?? 0);

  // ─── Estado de UI ────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // ─── Handler de cambio de respuesta ──────────────────────────────
  const updateAnswer = useCallback(
    (questionId: string, next: Partial<AnswerState>) => {
      setAnswers((prev) => {
        const current = prev.get(questionId) ?? {
          answerText: null,
          selectedOptionId: null,
        };
        const merged = { ...current, ...next };
        const map = new Map(prev);
        map.set(questionId, merged);
        return map;
      });
      dirtyRef.current.add(questionId);
    },
    []
  );

  // ─── Autosave: pushea respuestas dirty cada 15s ──────────────────
  const doSave = useCallback(async () => {
    if (dirtyRef.current.size === 0) return;
    const dirty = Array.from(dirtyRef.current);
    dirtyRef.current.clear();

    const payload = dirty.map((qid) => {
      const a = answers.get(qid);
      return {
        questionId: qid,
        answerText: a?.answerText ?? null,
        selectedOptionId: a?.selectedOptionId ?? null,
      };
    });

    const fd = new FormData();
    fd.append("attemptId", loaded.attempt.id);
    fd.append("answers", JSON.stringify(payload));
    fd.append("time_spent_seconds", String(timeSpentSec));

    try {
      await saveAnswersAction(fd);
    } catch (e) {
      // Si falla, volvemos a marcar como dirty
      dirty.forEach((id) => dirtyRef.current.add(id));
      console.error("Autosave failed:", e);
    }
  }, [answers, loaded.attempt.id, timeSpentSec]);

  useEffect(() => {
    const interval = setInterval(doSave, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [doSave]);

  // Save al cambiar de pregunta o parte
  useEffect(() => {
    doSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartIndex, activeQuestionIndex]);

  // Save al descargar página / cambiar de pestaña
  useEffect(() => {
    const handler = () => {
      // Usamos sendBeacon-like approach via un fetch síncrono (best effort)
      if (dirtyRef.current.size > 0) {
        doSave();
      }
    };
    window.addEventListener("beforeunload", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handler();
    });
    return () => window.removeEventListener("beforeunload", handler);
  }, [doSave]);

  // ─── Timer tick ──────────────────────────────────────────────────
  useEffect(() => {
    if (autoSubmitted || submitting) return;
    const tick = setInterval(() => {
      setRemainingSec((r) => Math.max(0, r - 1));
      setTimeSpentSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [autoSubmitted, submitting]);

  // Autoenvío al llegar a 0
  useEffect(() => {
    if (remainingSec === 0 && !autoSubmitted && !submitting) {
      setAutoSubmitted(true);
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSec]);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitting) return;
      setSubmitting(true);
      // Guardar respuestas pendientes primero
      await doSave();
      const fd = new FormData();
      fd.append("attemptId", loaded.attempt.id);
      try {
        await submitAttemptAction({ error: null }, fd);
      } catch (e) {
        // submit hace redirect, esto casi nunca se ejecuta
        console.error("Submit failed:", e);
        setSubmitting(false);
        alert(
          auto
            ? "Se agotó el tiempo pero no se pudo enviar automáticamente. Prueba a enviarlo manualmente."
            : "No se pudo enviar el examen. Prueba de nuevo."
        );
      }
    },
    [doSave, loaded.attempt.id, submitting]
  );

  // ─── Estadísticas de progreso ────────────────────────────────────
  const stats = useMemo(() => {
    let answered = 0;
    let total = 0;
    for (const part of loaded.parts) {
      for (const q of part.questions) {
        total++;
        const a = answers.get(q.id);
        if (
          a &&
          (a.selectedOptionId != null || (a.answerText && a.answerText.trim()))
        ) {
          answered++;
        }
      }
    }
    return { answered, total };
  }, [answers, loaded.parts]);

  const isTimeWarning = remainingSec < 300; // últimos 5 min
  const isTimeCritical = remainingSec < 60;

  if (!activePart) {
    return <div className="p-8">No hay partes en este examen.</div>;
  }

  const activeQuestion = activePart.questions[activeQuestionIndex];
  const settings = activePart.settings;
  const readingText = (settings.reading_text as string) ?? null;
  const baseText = (settings.base_text as string) ?? null;
  const matchingOptions =
    (settings.matching_options as Array<{ letter: string; text: string }>) ?? [];

  // Total de preguntas antes de esta parte (para la numeración global)
  let questionOffset = 0;
  for (let i = 0; i < activePartIndex; i++) {
    questionOffset += loaded.parts[i].questions.length;
  }

  return (
    <div className="flex flex-col h-screen bg-paper">
      {/* Header estilo Cambridge Digital */}
      <header className="bg-white border-b-2 border-navy px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-navy text-lg tracking-tight">
            Acertl<span className="border-b-2 border-saffron pb-0.5">i</span>o
          </span>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs text-muted uppercase tracking-wider">
              Candidate
            </span>
            <span className="text-sm font-mono text-ink">
              {loaded.student.full_name}
            </span>
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs text-muted uppercase tracking-wider">
              Exam
            </span>
            <span className="text-sm font-mono text-ink">
              {loaded.exam.title}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4">
          {showTimer ? (
            <div
              className={`px-4 py-2 rounded font-mono text-lg font-bold tabular-nums ${
                isTimeCritical
                  ? "bg-bad text-white animate-pulse"
                  : isTimeWarning
                  ? "bg-saffron text-white"
                  : "bg-navy text-white"
              }`}
            >
              {formatTime(remainingSec)}
            </div>
          ) : (
            <button
              onClick={() => setShowTimer(true)}
              className="px-4 py-2 rounded bg-navy-50 text-navy text-sm inline-flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Mostrar tiempo
            </button>
          )}
          {showTimer && (
            <button
              onClick={() => setShowTimer(false)}
              className="text-xs text-muted hover:text-ink"
              title="Ocultar el reloj"
            >
              Ocultar
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-paper lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5 text-ink" />
          </button>
        </div>
      </header>

      {/* Aviso de tiempo si <5min */}
      {isTimeWarning && !isTimeCritical && (
        <div className="bg-saffron/10 border-b border-saffron/30 px-6 py-2 text-sm text-ink flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-saffron shrink-0" />
          <span>Quedan menos de 5 minutos. El examen se enviará automáticamente cuando llegue a 0.</span>
        </div>
      )}

      {/* Barra de partes */}
      <nav className="bg-white border-b border-rule px-6 py-2 flex items-center gap-1 overflow-x-auto shrink-0">
        {loaded.parts.map((p, i) => {
          const isActive = i === activePartIndex;
          return (
            <button
              key={p.id}
              onClick={() => {
                setActivePartIndex(i);
                setActiveQuestionIndex(0);
              }}
              className={`shrink-0 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive
                  ? "bg-navy text-white"
                  : "text-muted hover:text-ink hover:bg-paper"
              }`}
            >
              Part {p.part_number}
            </button>
          );
        })}
      </nav>

      {/* Main + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Área principal: contenido de la parte + pregunta activa */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
            {/* Header de la parte */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">
                Part {activePart.part_number} — {activePart.skill.replace("_", " ")}
              </p>
              <h1 className="text-2xl font-semibold text-ink mt-1">
                {activePart.title}
              </h1>
              {activePart.instructions && (
                <p className="mt-3 text-sm text-ink bg-navy-50/50 border-l-3 border-navy px-4 py-2 rounded-r">
                  {activePart.instructions}
                </p>
              )}
            </div>

            {/* Texto de lectura si aplica (Part 3 A2, Part 5 C1) */}
            {readingText && (
              <div className="rounded border border-rule bg-white p-6">
                <p className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap font-serif">
                  {readingText}
                </p>
              </div>
            )}

            {/* Texto con gaps si aplica (cloze parts) */}
            {baseText && (
              <div className="rounded border border-rule bg-white p-6">
                <p className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap font-serif">
                  {baseText}
                </p>
              </div>
            )}

            {/* Opciones de matching si aplica (Part 2 A2) */}
            {matchingOptions.length > 0 && (
              <details open className="rounded border border-rule bg-white p-4">
                <summary className="cursor-pointer text-sm font-medium text-navy mb-2">
                  Textos (A–{matchingOptions[matchingOptions.length - 1].letter})
                </summary>
                <ul className="mt-3 space-y-3 text-[14px] leading-relaxed">
                  {matchingOptions.map((opt) => (
                    <li key={opt.letter} className="flex gap-3">
                      <span className="font-mono font-semibold text-navy shrink-0 w-6">
                        {opt.letter}
                      </span>
                      <span className="text-ink">{opt.text}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Pregunta activa */}
            <div className="rounded-lg border border-rule bg-white p-6">
              {activeQuestion ? (
                <QuestionRenderer
                  question={activeQuestion}
                  answer={answers.get(activeQuestion.id) ?? { answerText: null, selectedOptionId: null }}
                  matchingOptions={matchingOptions}
                  onUpdate={(next) => updateAnswer(activeQuestion.id, next)}
                />
              ) : (
                <p className="text-sm text-muted">No hay pregunta activa.</p>
              )}
            </div>

            {/* Navegación previous/next */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => {
                  if (activeQuestionIndex > 0) {
                    setActiveQuestionIndex(activeQuestionIndex - 1);
                  } else if (activePartIndex > 0) {
                    const prevPart = loaded.parts[activePartIndex - 1];
                    setActivePartIndex(activePartIndex - 1);
                    setActiveQuestionIndex(prevPart.questions.length - 1);
                  }
                }}
                disabled={activePartIndex === 0 && activeQuestionIndex === 0}
                className="px-4 py-2 rounded border-2 border-rule text-sm font-medium hover:border-navy disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <span className="text-xs text-muted">
                Pregunta {activeQuestionIndex + 1} de {activePart.questions.length} en esta parte
              </span>

              {activeQuestionIndex < activePart.questions.length - 1 ||
              activePartIndex < loaded.parts.length - 1 ? (
                <button
                  onClick={() => {
                    if (activeQuestionIndex < activePart.questions.length - 1) {
                      setActiveQuestionIndex(activeQuestionIndex + 1);
                    } else if (activePartIndex < loaded.parts.length - 1) {
                      setActivePartIndex(activePartIndex + 1);
                      setActiveQuestionIndex(0);
                    }
                  }}
                  className="px-4 py-2 rounded bg-navy text-white text-sm font-medium hover:bg-navy-600"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-4 py-2 rounded bg-saffron text-white text-sm font-medium hover:bg-saffron/90 inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Enviar examen
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar de navegación */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0 fixed lg:static right-0 top-0 h-full lg:h-auto w-72 bg-white border-l border-rule shrink-0 overflow-y-auto transition-transform z-40`}
        >
          <div className="p-4 border-b border-rule flex items-center justify-between lg:justify-start gap-2">
            <h3 className="text-sm font-medium text-ink">
              Progreso · {stats.answered}/{stats.total}
            </h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-paper rounded"
            >
              <X className="h-4 w-4 text-muted" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {loaded.parts.map((part, pIdx) => (
              <div key={part.id}>
                <p className="text-xs uppercase tracking-wider text-muted mb-2">
                  Part {part.part_number}
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {part.questions.map((q, qIdx) => {
                    const a = answers.get(q.id);
                    const isAnswered =
                      a &&
                      (a.selectedOptionId != null ||
                        (a.answerText && a.answerText.trim()));
                    const isCurrent =
                      pIdx === activePartIndex && qIdx === activeQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setActivePartIndex(pIdx);
                          setActiveQuestionIndex(qIdx);
                          setSidebarOpen(false);
                        }}
                        className={`h-8 text-xs font-mono font-medium rounded transition-colors ${
                          isCurrent
                            ? "bg-navy text-white ring-2 ring-navy/40 ring-offset-1"
                            : isAnswered
                            ? "bg-ok/20 text-ok border border-ok/40"
                            : "bg-paper text-muted border border-rule hover:border-navy/40"
                        }`}
                        aria-label={`Pregunta ${q.question_number}`}
                      >
                        {q.question_number}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full mt-4 px-4 py-3 rounded bg-saffron text-white text-sm font-medium hover:bg-saffron/90 inline-flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar examen
            </button>
          </div>
        </aside>
      </div>

      {/* Modal de confirmación de envío */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-ink mb-2">
              ¿Enviar el examen?
            </h2>
            <p className="text-sm text-muted mb-4">
              Has respondido <strong className="text-ink">{stats.answered} de {stats.total}</strong> preguntas.
              {stats.answered < stats.total && (
                <>
                  {" "}
                  Quedan{" "}
                  <strong className="text-saffron">
                    {stats.total - stats.answered} sin responder
                  </strong>.
                </>
              )}{" "}
              Una vez enviado no podrás modificar tus respuestas.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                disabled={submitting}
                className="px-4 py-2 rounded border-2 border-rule text-sm font-medium hover:border-navy"
              >
                Seguir contestando
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="px-4 py-2 rounded bg-saffron text-white text-sm font-medium hover:bg-saffron/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Sí, enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para móvil cuando sidebar abierto */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Selector de renderer según tipo ────────────────────────────────
function QuestionRenderer({
  question,
  answer,
  matchingOptions,
  onUpdate,
}: {
  question: LoadedQuestion;
  answer: AnswerState;
  matchingOptions: Array<{ letter: string; text: string }>;
  onUpdate: (next: Partial<AnswerState>) => void;
}) {
  switch (question.question_type) {
    case "multiple_choice":
    case "multiple_choice_cloze":
      return (
        <MultipleChoiceRenderer
          question={question}
          currentValue={answer.selectedOptionId}
          onChange={(optionId) =>
            onUpdate({ selectedOptionId: optionId, answerText: null })
          }
        />
      );
    case "open_cloze":
    case "word_formation":
    case "key_word_transformation":
      return (
        <OpenClozeRenderer
          question={question}
          currentValue={answer.answerText ?? ""}
          onChange={(value) => onUpdate({ answerText: value, selectedOptionId: null })}
        />
      );
    case "multiple_matching":
    case "cross_text_multiple_matching":
      return (
        <MultipleMatchingRenderer
          question={question}
          matchingOptions={matchingOptions}
          currentValue={answer.answerText ?? ""}
          onChange={(letter) =>
            onUpdate({ answerText: letter, selectedOptionId: null })
          }
        />
      );
    case "writing_task":
      return (
        <WritingTaskRenderer
          question={question}
          currentValue={answer.answerText ?? ""}
          onChange={(value) => onUpdate({ answerText: value, selectedOptionId: null })}
        />
      );
    default:
      return (
        <p className="text-sm text-bad">
          Tipo de pregunta no soportado todavía: {question.question_type}
        </p>
      );
  }
}
