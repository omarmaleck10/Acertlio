"use client";

import { Bookmark } from "lucide-react";
import type { SimQuestion } from "@/lib/exam/loader";

interface Props {
  question: SimQuestion;
  answerText: string;
  isBookmarked: boolean;
  onChange: (text: string) => void;
  onToggleBookmark: () => void;
}

/**
 * Renderizador de Open Cloze (Part 6 de B1).
 *
 * Cada pregunta representa UN hueco individual del texto largo.
 * El alumno ve el número del hueco y un input pequeño donde escribe
 * la palabra que falta.
 *
 * El texto largo con TODOS los huecos se muestra en el header/contexto
 * de la Part (base_text del settings), no aquí. Aquí solo mostramos el
 * hueco individual.
 */
export function QuestionOpenCloze({
  question,
  answerText,
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
            <div className="min-w-0 flex-1">
              <p className="text-base text-ink leading-relaxed font-medium">
                Gap {question.question_number}
              </p>
              <p className="text-sm text-muted mt-1">
                Write ONE word that best fits this gap.
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

        {/* Input pequeño en línea */}
        <div className="flex items-center gap-3 mt-6">
          <label className="text-sm text-muted flex-shrink-0">
            Your answer:
          </label>
          <input
            type="text"
            value={answerText}
            onChange={(e) => onChange(e.target.value)}
            className="w-32 rounded border-2 border-rule px-3 py-1.5 text-base text-ink font-medium focus:outline-none focus:border-navy transition-colors"
            placeholder="…"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Consejo */}
        <p className="text-xs text-muted mt-4 italic leading-relaxed">
          Tip: normally one word. Contractions like{" "}
          <code className="bg-paper px-1 rounded">don&apos;t</code> count as one
          word.
        </p>
      </div>
    </div>
  );
}
