"use client";

import { Bookmark, Info } from "lucide-react";
import type { SimQuestion } from "@/lib/exam/loader";

interface Props {
  question: SimQuestion;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

/**
 * Renderizador placeholder para tipos de pregunta que aún no están
 * implementados en el simulador (matching, gapped_text, cloze,
 * writing_task, etc). Se implementarán en Fase 6C.2.
 */
export function QuestionPlaceholder({
  question,
  isBookmarked,
  onToggleBookmark,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded border border-saffron/30 bg-saffron/5 p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-saffron/10 flex items-center justify-center">
            <Info className="h-4 w-4 text-saffron" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">
              Pregunta {question.question_number}
            </p>
            <p className="text-xs uppercase tracking-wider text-saffron mt-0.5 font-medium">
              {question.question_type}
            </p>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Este tipo de pregunta se implementará en la siguiente fase del
              simulador (Fase 6C.2). Por ahora puedes navegar por las Parts,
              usar el timer y guardar respuestas de las preguntas de opción
              múltiple.
            </p>
            {question.stem && (
              <p className="text-sm text-ink mt-4 italic border-l-2 border-saffron/30 pl-3">
                {question.stem}
              </p>
            )}
          </div>
          <button
            onClick={onToggleBookmark}
            className={`flex items-center justify-center h-9 w-9 rounded transition-colors flex-shrink-0 ${
              isBookmarked
                ? "bg-saffron/15 text-saffron"
                : "text-muted hover:text-ink hover:bg-white"
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-saffron" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
