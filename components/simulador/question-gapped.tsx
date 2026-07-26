"use client";

import { Bookmark } from "lucide-react";
import type { SimQuestion } from "@/lib/exam/loader";

interface Props {
  question: SimQuestion;
  availableLetters: string[]; // ["A", "B", ..., "H"]
  answerLetter: string;
  isBookmarked: boolean;
  onChange: (letter: string) => void;
  onToggleBookmark: () => void;
}

/**
 * Renderizador Gapped Text (Part 4 de B1).
 *
 * Cada pregunta representa UN hueco del texto (16, 17, 18, 19, 20),
 * y el alumno elige qué frase (letra A-H) va en ese hueco.
 *
 * El texto con huecos y las 8 frases se muestran en el contexto
 * compartido de la Part (columna izquierda), NO aquí.
 */
export function QuestionGapped({
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
            <div>
              <p className="text-base text-ink leading-relaxed font-medium">
                Gap {question.question_number}
              </p>
              <p className="text-sm text-muted mt-1">
                Choose the sentence that best fits this gap.
              </p>
            </div>
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

        <p className="text-xs text-muted mt-4 italic leading-relaxed">
          Remember: there are 8 sentences (A–H) and only 5 gaps, so 3 sentences
          will not be used.
        </p>
      </div>
    </div>
  );
}
