"use client";

import type { LoadedQuestion } from "@/lib/exams/loader";

interface Props {
  question: LoadedQuestion;
  currentValue: string | null; // option_id seleccionado
  onChange: (optionId: string | null) => void;
  showNotice?: boolean;
}

/**
 * Renderer para preguntas Multiple Choice.
 *
 * Cambridge digital real: opciones apiladas verticalmente, radio grande, texto claro.
 * Si tiene notice_text en context, lo renderiza como un bloque previo (Part 1 A2).
 * Si es sub-pregunta de un texto largo (Part 3 A2, Part 5 C1), el texto va aparte.
 */
export function MultipleChoiceRenderer({
  question,
  currentValue,
  onChange,
  showNotice = true,
}: Props) {
  const noticeText =
    (question.context as { notice_text?: string })?.notice_text ?? null;

  return (
    <div className="space-y-5">
      {/* Notice / message si aplica */}
      {showNotice && noticeText && (
        <div className="rounded border-2 border-navy/20 bg-white px-5 py-4 font-serif sim-text whitespace-pre-wrap">
          {noticeText}
        </div>
      )}

      {/* Enunciado */}
      <p className="sim-text font-medium">
        <span className="font-mono text-navy mr-2">
          {question.question_number}.
        </span>
        {question.stem}
      </p>

      {/* Opciones */}
      <div className="space-y-2 pl-6">
        {question.options.map((opt) => {
          const isSelected = currentValue === opt.id;
          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 rounded-md border-2 p-3 cursor-pointer transition-colors ${
                isSelected
                  ? "border-navy bg-navy-50"
                  : "border-rule bg-white hover:border-navy/40 hover:bg-paper"
              }`}
            >
              <input
                type="radio"
                name={`q_${question.id}`}
                value={opt.id}
                checked={isSelected}
                onChange={() => onChange(opt.id)}
                className="mt-0.5 shrink-0"
              />
              <span className="font-mono font-medium text-navy w-5 shrink-0">
                {opt.letter}
              </span>
              <span className="sim-text">
                {opt.text}
              </span>
            </label>
          );
        })}
      </div>

      {/* Botón para deseleccionar */}
      {currentValue && (
        <div className="pl-6">
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted hover:text-ink underline"
          >
            Borrar respuesta
          </button>
        </div>
      )}
    </div>
  );
}
