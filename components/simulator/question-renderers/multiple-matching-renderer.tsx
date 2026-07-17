"use client";

import type { LoadedQuestion } from "@/lib/exams/loader";

interface MatchingOption {
  letter: string;
  text: string;
}

interface Props {
  question: LoadedQuestion;
  matchingOptions: MatchingOption[];
  currentValue: string;
  onChange: (letter: string) => void;
}

/**
 * Renderer para Multiple Matching.
 * El alumno lee la descripción de la persona (stem) y selecciona qué texto
 * de los A-H se le adapta.
 */
export function MultipleMatchingRenderer({
  question,
  matchingOptions,
  currentValue,
  onChange,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Descripción de la persona / pregunta */}
      <div className="rounded border-2 border-rule bg-white px-5 py-4">
        <p className="text-[15px] leading-relaxed text-ink">
          <span className="font-mono font-semibold text-navy mr-2">
            {question.question_number}.
          </span>
          {question.stem}
        </p>
      </div>

      {/* Botones de letra A-H */}
      <div className="flex flex-wrap gap-2">
        {matchingOptions.map((opt) => {
          const isSelected = currentValue === opt.letter;
          return (
            <button
              key={opt.letter}
              type="button"
              onClick={() => onChange(isSelected ? "" : opt.letter)}
              className={`w-11 h-11 rounded font-mono font-semibold text-lg border-2 transition-colors ${
                isSelected
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy border-rule hover:border-navy/40 hover:bg-paper"
              }`}
              aria-label={`Seleccionar opción ${opt.letter}`}
              aria-pressed={isSelected}
            >
              {opt.letter}
            </button>
          );
        })}
      </div>

      {currentValue && (
        <p className="text-xs text-muted">
          Respuesta: <span className="font-mono font-semibold text-navy">{currentValue}</span>
          {" · "}
          <button
            type="button"
            onClick={() => onChange("")}
            className="underline hover:text-ink"
          >
            Borrar
          </button>
        </p>
      )}
    </div>
  );
}
