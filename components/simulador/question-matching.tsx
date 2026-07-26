"use client";

import { Bookmark } from "lucide-react";
import type { SimQuestion } from "@/lib/exam/loader";

interface Props {
  question: SimQuestion;
  availableLetters: string[]; // ["A", "B", "C", ..., "H"]
  answerLetter: string;
  isBookmarked: boolean;
  onChange: (letter: string) => void;
  onToggleBookmark: () => void;
}

/**
 * Renderizador Multiple Matching (Part 2 de B1).
 *
 * Cada pregunta representa UNA persona con su descripción, y el alumno
 * elige una letra (A-H) del listado de opciones.
 *
 * Las 8 opciones A-H se muestran en el contexto compartido de la Part
 * (columna izquierda), NO aquí. Aquí solo la persona actual + selector.
 */
export function QuestionMatching({
  question,
  availableLetters,
  answerLetter,
  isBookmarked,
  onChange,
  onToggleBookmark,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded border border-rule bg-white p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-navy text-white text-sm font-semibold">
              {question.question_number}
            </span>
            <p className="text-base text-ink leading-relaxed mt-0.5">
              {question.stem}
            </p>
          </div>
          <button
            onClick={onToggleBookmark}
            className={`flex items-center justify-center h-9 w-9 rounded transition-colors flex-shrink-0 ${
              isBookmarked
                ? "bg-saffron/15 text-saffron hover:bg-saffron/25"
                : "text-muted hover:text-ink hover:bg-paper"
            }`}
            title={isBookmarked ? "Desmarcar" : "Marcar para revisar"}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-saffron" : ""}`}
            />
          </button>
        </div>

        {/* Botones de letras */}
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider text-muted font-medium mb-3">
            Choose the correct answer:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableLetters.map((letter) => {
              const isSelected = answerLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => onChange(letter)}
                  className={`h-11 w-11 rounded border-2 font-semibold text-base transition-all ${
                    isSelected
                      ? "border-navy bg-navy text-white"
                      : "border-rule bg-white text-ink hover:border-navy/40"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
