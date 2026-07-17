"use client";

import type { LoadedQuestion } from "@/lib/exams/loader";

interface Props {
  question: LoadedQuestion;
  currentValue: string;
  onChange: (value: string) => void;
}

/**
 * Renderer para Open Cloze (una palabra por gap) y Word Formation.
 * Un solo input de texto centrado con el número de pregunta.
 */
export function OpenClozeRenderer({ question, currentValue, onChange }: Props) {
  return (
    <div className="space-y-4">
      {question.stem && (
        <p className="text-xs text-muted italic">{question.stem}</p>
      )}

      <div className="flex items-center gap-3">
        <span className="font-mono text-lg font-semibold text-navy shrink-0">
          {question.question_number}
        </span>
        <input
          type="text"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tu respuesta"
          autoComplete="off"
          spellCheck="false"
          className="flex-1 max-w-md h-11 rounded border-2 border-rule bg-white px-4 text-[15px] font-mono uppercase focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
        />
      </div>

      <p className="text-xs text-muted pl-8">
        Escribe una palabra. Se ignoran las mayúsculas.
      </p>
    </div>
  );
}
