"use client";

import { CheckCircle2, Clock } from "lucide-react";
import type { ResultPart } from "@/lib/exam/result-loader";

interface Props {
  parts: ResultPart[];
  activePartIndex: number;
  onChange: (index: number) => void;
}

export function ResultPartTabs({ parts, activePartIndex, onChange }: Props) {
  return (
    <div className="mb-6 -mx-1 overflow-x-auto">
      <div className="flex gap-2 px-1 min-w-fit">
        {parts.map((part, idx) => {
          const isActive = idx === activePartIndex;
          const isWriting = part.questions.every(
            (q) => q.question_type === "writing_task"
          );
          const total = part.total_count;
          const correct = part.correct_count;
          const pct = total > 0 ? Math.round((correct / total) * 100) : null;

          return (
            <button
              key={part.id}
              onClick={() => onChange(idx)}
              className={`flex-shrink-0 rounded-lg border-2 transition-all px-4 py-3 text-left min-w-[140px] ${
                isActive
                  ? "border-navy bg-navy/5"
                  : "border-rule bg-white hover:border-navy/40"
              }`}
            >
              <p
                className={`text-xs uppercase tracking-wider font-semibold ${
                  isActive ? "text-navy" : "text-muted"
                }`}
              >
                Part {part.part_number}
              </p>
              {part.title && (
                <p className="text-xs text-muted mt-0.5 truncate max-w-[160px]">
                  {part.title.split(" — ")[0]}
                </p>
              )}
              <div className="mt-2 flex items-center gap-1.5">
                {isWriting ? (
                  <>
                    <Clock className="h-3 w-3 text-saffron" />
                    <span className="text-xs font-semibold text-saffron">
                      Writing
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        pct != null && pct >= 70
                          ? "text-ok"
                          : pct != null && pct >= 50
                          ? "text-saffron"
                          : "text-error"
                      }`}
                    />
                    <span className="text-sm font-semibold text-ink tabular-nums">
                      {correct}/{total}
                    </span>
                    <span className="text-xs text-muted">
                      ({pct ?? 0}%)
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
