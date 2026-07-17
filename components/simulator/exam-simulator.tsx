"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Send,
  Loader2,
  AlertTriangle,
  Clock,
  Maximize2,
  Minimize2,
  Settings2,
} from "lucide-react";
import type {
  LoadedExamForAttempt,
  LoadedPart,
  LoadedQuestion,
} from "@/lib/exams/loader";
import { saveAnswersAction, submitAttemptAction } from "@/app/alumno/examen/actions";
import { MultipleChoiceRenderer } from "./question-renderers/multiple-choice-renderer";
import { OpenClozeRenderer } from "./question-renderers/open-cloze-renderer";
import { MultipleMatchingRenderer } from "./question-renderers/multiple-matching-renderer";
import { WritingTaskRenderer } from "./question-renderers/writing-task-renderer";
import {
  AccessibilityPanel,
  type FontSize,
  type ColorTheme,
} from "./accessibility-panel";

// ─── Tipos ──────────────────────────────────────────────────────────
interface AnswerState {
  answerText: string | null;
  selectedOptionId: string | null;
}

interface Props {
  loaded: LoadedExamForAttempt;
}

const AUTOSAVE_INTERVAL_MS = 15_000;
const STORAGE_KEY_FONT = "acertlio.simulator.fontSize";
const STORAGE_KEY_THEME = "acertlio.simulator.colorTheme";

function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// ─── Mapa de estilos por preferencia ─────────────────────────────────
const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: "sim-fs-sm",
  base: "sim-fs-base",
  lg: "sim-fs-lg",
  xl: "sim-fs-xl",
};

const THEME_STYLES: Record<
  ColorTheme,
  { bg: string; text: string; panelBg: string; panelBorder: string }
> = {
  paper: {
    bg: "bg-paper",
    text: "text-ink",
    panelBg: "bg-white",
    panelBorder: "border-rule",
  },
  sepia: {
    bg: "bg-[#F4EAD5]",
    text: "text-[#3E2C1C]",
    panelBg: "bg-[#FBF5E6]",
    panelBorder: "border-[#D4C4A0]",
  },
  "high-contrast": {
    bg: "bg-white",
    text: "text-black",
    panelBg: "bg-white",
    panelBorder: "border-black",
  },
  dark: {
    bg: "bg-[#1A1A1A]",
    text: "text-[#F5F5F5]",
    panelBg: "bg-[#2A2A2A]",
    panelBorder: "border-[#3A3A3A]",
  },
};

export function ExamSimulator({ loaded }: Props) {
  // ─── Preferencias visuales (persistidas en localStorage) ──────────
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("paper");
  const [showAccessibility, setShowAccessibility] = useState(false);

  // Cargar preferencias al montar
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem(STORAGE_KEY_FONT) as FontSize | null;
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ColorTheme | null;
      if (savedFont && ["sm", "base", "lg", "xl"].includes(savedFont)) {
        setFontSize(savedFont);
      }
      if (
        savedTheme &&
        ["paper", "sepia", "high-contrast", "dark"].includes(savedTheme)
      ) {
        setColorTheme(savedTheme);
      }
    } catch {
      // localStorage no disponible, ignoramos
    }
  }, []);

  const handleFontSizeChange = useCallback((size: FontSize) => {
    setFontSize(size);
    try {
      localStorage.setItem(STORAGE_KEY_FONT, size);
    } catch {}
  }, []);

  const handleColorThemeChange = useCallback((theme: ColorTheme) => {
    setColorTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
  }, []);

  // ─── Fullscreen ──────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.error("Fullscreen error:", e);
    }
  }, []);

  // ─── Estado global de respuestas ─────────────────────────────────
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

  const dirtyRef = useRef<Set<string>>(new Set());

  // ─── Navegación ──────────────────────────────────────────────────
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
  const [timeSpentSec, setTimeSpentSec] = useState(
    loaded.attempt.time_spent_seconds ?? 0
  );

  // ─── UI ──────────────────────────────────────────────────────────
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

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

  // ─── Autosave ────────────────────────────────────────────────────
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
      dirty.forEach((id) => dirtyRef.current.add(id));
      console.error("Autosave failed:", e);
    }
  }, [answers, loaded.attempt.id, timeSpentSec]);

  useEffect(() => {
    const interval = setInterval(doSave, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [doSave]);

  useEffect(() => {
    doSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartIndex, activeQuestionIndex]);

  useEffect(() => {
    const handler = () => {
      if (dirtyRef.current.size > 0) doSave();
    };
    window.addEventListener("beforeunload", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handler();
    });
    return () => window.removeEventListener("beforeunload", handler);
  }, [doSave]);

  // ─── Timer tick + autoenvío en 0 ─────────────────────────────────
  useEffect(() => {
    if (autoSubmitted || submitting) return;
    const tick = setInterval(() => {
      setRemainingSec((r) => Math.max(0, r - 1));
      setTimeSpentSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [autoSubmitted, submitting]);

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
      await doSave();
      const fd = new FormData();
      fd.append("attemptId", loaded.attempt.id);
      try {
        await submitAttemptAction({ error: null }, fd);
      } catch (e) {
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

  // ─── Progreso ─────────────────────────────────────────────────────
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

  const isTimeWarning = remainingSec < 300;
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

  const theme = THEME_STYLES[colorTheme];
  const fontClass = FONT_SIZE_CLASSES[fontSize];

  return (
    <div
      className={`sim-root ${fontClass} flex flex-col h-screen ${theme.bg} ${theme.text}`}
      data-theme={colorTheme}
    >
      {/* Header estilo Cambridge Digital */}
      <header
        className={`${theme.panelBg} border-b-2 border-navy px-6 py-3 flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-6">
          <span className="font-semibold text-navy text-lg tracking-tight">
            Acertl<span className="border-b-2 border-saffron pb-0.5">i</span>o
          </span>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs text-muted uppercase tracking-wider">
              Candidate
            </span>
            <span className="text-sm font-mono">{loaded.student.full_name}</span>
          </div>
          <div className="hidden lg:flex flex-col leading-tight">
            <span className="text-xs text-muted uppercase tracking-wider">
              Exam
            </span>
            <span className="text-sm font-mono">{loaded.exam.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Timer */}
          {showTimer ? (
            <div className="flex items-center gap-1.5">
              <div
                className={`px-3 py-1.5 rounded font-mono text-base md:text-lg font-bold tabular-nums ${
                  isTimeCritical
                    ? "bg-bad text-white animate-pulse"
                    : isTimeWarning
                    ? "bg-saffron text-white"
                    : "bg-navy text-white"
                }`}
              >
                {formatTime(remainingSec)}
              </div>
              <button
                onClick={() => setShowTimer(false)}
                className="text-xs text-muted hover:text-ink hidden md:block"
                title="Ocultar el reloj"
              >
                Ocultar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTimer(true)}
              className="px-3 py-1.5 rounded bg-navy-50 text-navy text-sm inline-flex items-center gap-1.5"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline">Mostrar tiempo</span>
            </button>
          )}

          {/* Botón Ajustes accesibilidad */}
          <button
            onClick={() => setShowAccessibility(true)}
            className={`p-2 rounded border-2 ${theme.panelBorder} hover:border-navy`}
            aria-label="Ajustes de pantalla"
            title="Tamaño de letra y color de fondo"
          >
            <Settings2 className="h-4 w-4" />
          </button>

          {/* Botón Pantalla completa */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded border-2 ${theme.panelBorder} hover:border-navy`}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Aviso de tiempo */}
      {isTimeWarning && !isTimeCritical && (
        <div className="bg-saffron/10 border-b border-saffron/30 px-6 py-2 text-sm flex items-center gap-2 shrink-0">
          <AlertTriangle className="h-4 w-4 text-saffron shrink-0" />
          <span>
            Quedan menos de 5 minutos. El examen se enviará automáticamente cuando llegue a 0.
          </span>
        </div>
      )}

      {/* Barra de partes */}
      <nav
        className={`${theme.panelBg} border-b ${theme.panelBorder} px-6 py-2 flex items-center gap-1 overflow-x-auto shrink-0`}
      >
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

      {/* Área principal — SIN sidebar derecho ya, el rail está abajo */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              Part {activePart.part_number} — {activePart.skill.replace("_", " ")}
            </p>
            <h1 className="sim-h1 font-semibold mt-1">{activePart.title}</h1>
            {activePart.instructions && (
              <p className="mt-3 sim-instructions bg-navy-50/50 border-l-3 border-navy px-4 py-2 rounded-r">
                {activePart.instructions}
              </p>
            )}
          </div>

          {readingText && (
            <div className={`rounded border ${theme.panelBorder} ${theme.panelBg} p-6`}>
              <p className="sim-text leading-relaxed whitespace-pre-wrap font-serif">
                {readingText}
              </p>
            </div>
          )}

          {baseText && (
            <div className={`rounded border ${theme.panelBorder} ${theme.panelBg} p-6`}>
              <p className="sim-text leading-relaxed whitespace-pre-wrap font-serif">
                {baseText}
              </p>
            </div>
          )}

          {matchingOptions.length > 0 && (
            <details open className={`rounded border ${theme.panelBorder} ${theme.panelBg} p-4`}>
              <summary className="cursor-pointer text-sm font-medium text-navy mb-2">
                Textos (A–{matchingOptions[matchingOptions.length - 1].letter})
              </summary>
              <ul className="mt-3 space-y-3 sim-text leading-relaxed">
                {matchingOptions.map((opt) => (
                  <li key={opt.letter} className="flex gap-3">
                    <span className="font-mono font-semibold text-navy shrink-0 w-6">
                      {opt.letter}
                    </span>
                    <span>{opt.text}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className={`rounded-lg border ${theme.panelBorder} ${theme.panelBg} p-6`}>
            {activeQuestion ? (
              <QuestionRenderer
                question={activeQuestion}
                answer={
                  answers.get(activeQuestion.id) ?? {
                    answerText: null,
                    selectedOptionId: null,
                  }
                }
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
              className={`px-4 py-2 rounded border-2 ${theme.panelBorder} text-sm font-medium hover:border-navy disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              ← Anterior
            </button>

            <span className="text-xs text-muted hidden sm:inline">
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

      {/* ─── RAIL DE PROGRESO INFERIOR ──────────────────────────── */}
      <footer
        className={`${theme.panelBg} border-t-2 border-navy shrink-0`}
      >
        <div className="px-4 py-2 flex items-center gap-3 overflow-hidden">
          {/* Contador */}
          <div className="shrink-0 hidden md:flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-muted">
              Progreso
            </span>
            <span className="text-xs font-mono font-semibold">
              {stats.answered}/{stats.total}
            </span>
          </div>

          {/* Rail horizontal con TODAS las preguntas de todas las partes */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center gap-1 py-1">
              {loaded.parts.map((part, pIdx) => (
                <div key={part.id} className="flex items-center gap-1 shrink-0">
                  {pIdx > 0 && (
                    <div className={`w-px h-6 ${theme.panelBorder.replace("border-", "bg-")} mx-1`} />
                  )}
                  <span className="text-[10px] font-mono text-muted mr-1 shrink-0">
                    P{part.part_number}
                  </span>
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
                        }}
                        className={`shrink-0 w-7 h-7 text-[11px] font-mono font-medium rounded transition-colors ${
                          isCurrent
                            ? "bg-navy text-white ring-2 ring-navy/40 ring-offset-1"
                            : isAnswered
                            ? "bg-ok/20 text-ok border border-ok/40"
                            : "bg-paper text-muted border border-rule hover:border-navy/40"
                        }`}
                        aria-label={`Ir a la pregunta ${q.question_number}`}
                      >
                        {q.question_number}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Botón enviar en el rail */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="shrink-0 h-8 px-3 rounded bg-saffron text-white text-xs font-medium hover:bg-saffron/90 inline-flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </footer>

      {/* Panel de accesibilidad */}
      <AccessibilityPanel
        open={showAccessibility}
        onClose={() => setShowAccessibility(false)}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        colorTheme={colorTheme}
        onColorThemeChange={handleColorThemeChange}
      />

      {/* Modal de confirmación de envío */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.panelBg} rounded-lg max-w-md w-full p-6 border ${theme.panelBorder}`}>
            <h2 className="text-lg font-semibold mb-2">¿Enviar el examen?</h2>
            <p className="text-sm text-muted mb-4">
              Has respondido{" "}
              <strong className={theme.text}>
                {stats.answered} de {stats.total}
              </strong>{" "}
              preguntas.
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
                className={`px-4 py-2 rounded border-2 ${theme.panelBorder} text-sm font-medium hover:border-navy`}
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
