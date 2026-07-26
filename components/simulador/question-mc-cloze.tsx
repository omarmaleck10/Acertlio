"use client";

import { Bookmark } from "lucide-react";
import type { SimQuestion } from "@/lib/exam/loader";

interface Props {
  question: SimQuestion;
  selectedOptionId: string | null;
  isBookmarked: boolean;
  onSelect: (optionId: string) => void;
  onToggleBookmark: () => void;
}

/**
 * Renderizador de Multiple Choice Cloze (Part 5 de B1).
 *
 * Cada pregunta representa las opciones A/B/C/D de UN hueco del texto.
 * El texto completo con todos los huecos se muestra en el contexto de
 * la Part (base_text del settings).
 *
 * Layout: opciones apiladas verticalmente, cada una es una tarjeta
 * seleccionable como el MC normal, pero con label "Gap X" arriba.
 */
export function QuestionMultipleChoiceCloze({
  question,
  selectedOptionId,
  isBookmarked,
  onSelect,
  onToggleBookmark,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
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
                Choose the word that best fits this gap in the text.
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

        {/* Opciones — mismo diseño que MC normal */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = opt.id === selectedOptionId;
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`w-full text-left flex items-center gap-3 rounded border-2 px-4 py-3 transition-all ${
                  isSelected
                    ? "border-navy bg-navy/5"
                    : "border-rule bg-white hover:border-navy/40"
                }`}
              >
                <span
                  className={`flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-sm font-semibold border-2 transition-colors ${
                    isSelected
                      ? "border-navy bg-navy text-white"
                      : "border-rule text-muted"
                  }`}
                >
                  {opt.letter}
                </span>
                <span
                  className={`text-base leading-relaxed font-medium ${
                    isSelected ? "text-ink" : "text-ink"
                  }`}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
