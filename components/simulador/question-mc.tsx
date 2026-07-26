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

export function QuestionMultipleChoice({
  question,
  selectedOptionId,
  isBookmarked,
  onSelect,
  onToggleBookmark,
}: Props) {
  const noticeText =
    typeof question.context?.notice_text === "string"
      ? (question.context.notice_text as string)
      : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Notice text (para Part 1 con signs y messages) */}
      {noticeText && (
        <div className="rounded border border-rule bg-white p-5 mb-6 relative">
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap italic">
            {noticeText}
          </p>
        </div>
      )}

      {/* Pregunta */}
      <div className="mb-6">
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
            title={isBookmarked ? "Desmarcar pregunta" : "Marcar para revisar"}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-saffron" : ""}`}
            />
          </button>
        </div>

        {/* Opciones */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = opt.id === selectedOptionId;
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`w-full text-left flex items-start gap-3 rounded border-2 p-4 transition-all ${
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
                  className={`text-sm leading-relaxed mt-0.5 ${
                    isSelected ? "text-ink font-medium" : "text-ink"
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
