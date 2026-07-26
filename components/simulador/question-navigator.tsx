"use client";

import { X, Bookmark, CircleAlert } from "lucide-react";
import type { SimPart } from "@/lib/exam/loader";

interface Props {
  open: boolean;
  onClose: () => void;
  parts: SimPart[];
  answeredQuestionIds: Set<string>;
  bookmarkedQuestionIds: Set<string>;
  onJump: (partIndex: number, questionIndex: number) => void;
}

export function QuestionNavigator({
  open,
  onClose,
  parts,
  answeredQuestionIds,
  bookmarkedQuestionIds,
  onJump,
}: Props) {
  if (!open) return null;

  // Preguntas marcadas
  const bookmarked: Array<{
    partIndex: number;
    questionIndex: number;
    partNumber: number;
    questionNumber: number;
  }> = [];
  const unanswered: Array<{
    partIndex: number;
    questionIndex: number;
    partNumber: number;
    questionNumber: number;
  }> = [];

  parts.forEach((part, pIdx) => {
    part.questions.forEach((q, qIdx) => {
      const info = {
        partIndex: pIdx,
        questionIndex: qIdx,
        partNumber: part.part_number,
        questionNumber: q.question_number,
      };
      if (bookmarkedQuestionIds.has(q.id)) bookmarked.push(info);
      if (!answeredQuestionIds.has(q.id)) unanswered.push(info);
    });
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-start justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-rule px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Navegador</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preguntas marcadas */}
        <section className="px-6 py-5 border-b border-rule">
          <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-saffron fill-saffron" />
            Preguntas marcadas
            <span className="text-muted text-xs font-normal">
              ({bookmarked.length})
            </span>
          </h3>
          {bookmarked.length === 0 ? (
            <p className="text-sm text-muted italic">
              No has marcado ninguna pregunta.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {bookmarked.map((b) => (
                <button
                  key={`${b.partIndex}-${b.questionIndex}`}
                  onClick={() => {
                    onJump(b.partIndex, b.questionIndex);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-saffron text-white text-sm font-medium hover:bg-saffron/90 transition-colors"
                >
                  Q{b.questionNumber}
                  <span className="text-[10px] opacity-80">
                    · Part {b.partNumber}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Preguntas sin respuesta */}
        <section className="px-6 py-5">
          <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
            <CircleAlert className="h-4 w-4 text-muted" />
            Sin responder
            <span className="text-muted text-xs font-normal">
              ({unanswered.length})
            </span>
          </h3>
          {unanswered.length === 0 ? (
            <p className="text-sm text-ok italic">
              Has respondido a todas las preguntas.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unanswered.map((b) => (
                <button
                  key={`${b.partIndex}-${b.questionIndex}`}
                  onClick={() => {
                    onJump(b.partIndex, b.questionIndex);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-rule text-ink text-sm font-medium hover:border-navy transition-colors"
                >
                  Q{b.questionNumber}
                  <span className="text-[10px] text-muted">
                    · Part {b.partNumber}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
