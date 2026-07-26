"use client";

import { Bookmark, ChevronLeft, ChevronRight, List } from "lucide-react";
import type { SimPart } from "@/lib/exam/loader";

interface Props {
  parts: SimPart[];
  currentPartIndex: number;
  currentQuestionIndex: number;
  answeredQuestionIds: Set<string>;
  bookmarkedQuestionIds: Set<string>;
  onJumpToQuestion: (partIndex: number, questionIndex: number) => void;
  onOpenNavigator: () => void;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function ExamFooter({
  parts,
  currentPartIndex,
  currentQuestionIndex,
  answeredQuestionIds,
  bookmarkedQuestionIds,
  onJumpToQuestion,
  onOpenNavigator,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: Props) {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-rule">
      <div className="flex items-stretch">
        {/* Parts + preguntas: scroll horizontal en móvil */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-stretch min-w-fit">
            {parts.map((part, pIdx) => {
              const isCurrentPart = pIdx === currentPartIndex;
              const answered = part.questions.filter((q) =>
                answeredQuestionIds.has(q.id)
              ).length;
              const total = part.questions.length;

              return (
                <div
                  key={part.id}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 border-r border-rule ${
                    isCurrentPart ? "bg-navy/5" : ""
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <p className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrentPart ? "text-navy" : "text-ink"
                    }`}>
                      Part {part.part_number}
                    </p>
                    <p className="text-[10px] text-muted whitespace-nowrap tabular-nums">
                      {answered} of {total}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {part.questions.map((q, qIdx) => {
                      const isCurrent =
                        pIdx === currentPartIndex &&
                        qIdx === currentQuestionIndex;
                      const isAnswered = answeredQuestionIds.has(q.id);
                      const isBookmarked = bookmarkedQuestionIds.has(q.id);

                      let baseClasses =
                        "relative flex items-center justify-center text-xs font-medium tabular-nums transition-colors flex-shrink-0";
                      let sizeClasses = "h-6 w-6 rounded";
                      let colorClasses = "";

                      if (isAnswered && !isBookmarked) {
                        colorClasses = "bg-navy text-white hover:bg-navy/90";
                      } else if (isBookmarked) {
                        colorClasses = "bg-saffron text-white hover:bg-saffron/90";
                      } else {
                        colorClasses =
                          "bg-white text-ink border border-rule hover:border-navy";
                      }

                      const currentRing = isCurrent
                        ? "ring-2 ring-saffron ring-offset-1"
                        : "";

                      return (
                        <button
                          key={q.id}
                          onClick={() => onJumpToQuestion(pIdx, qIdx)}
                          className={`${baseClasses} ${sizeClasses} ${colorClasses} ${currentRing}`}
                          title={`Pregunta ${q.question_number}${
                            isBookmarked ? " (marcada)" : ""
                          }${isAnswered ? " · respondida" : ""}`}
                        >
                          {q.question_number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controles derecha: navegador + prev/next */}
        <div className="flex items-center gap-1 border-l border-rule px-2 md:px-3 flex-shrink-0 bg-white">
          <button
            onClick={onOpenNavigator}
            className="flex items-center justify-center h-9 w-9 rounded hover:bg-paper transition-colors text-muted hover:text-ink"
            title="Ver preguntas marcadas"
          >
            <List className="h-4 w-4" />
          </button>

          <div className="hidden md:block h-6 w-px bg-rule mx-1" />

          <button
            onClick={onPrev}
            disabled={!canGoPrev}
            className="flex items-center justify-center h-9 w-9 rounded hover:bg-paper transition-colors text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
            title="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center justify-center h-9 w-9 rounded bg-navy text-white hover:bg-navy/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
