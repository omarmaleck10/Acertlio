import { StickyNote, Bookmark } from "lucide-react";
import type { ResultData } from "@/lib/exam/result-loader";

interface Props {
  data: ResultData;
  onJumpToPart: (partIndex: number) => void;
}

interface BookmarkedItem {
  questionNumber: number;
  partIndex: number;
  partNumber: number;
  status: string;
}

export function ResultSidebar({ data, onJumpToPart }: Props) {
  // Recopilar bookmarks con info de estado
  const bookmarkedItems: BookmarkedItem[] = [];
  data.parts.forEach((part, pIdx) => {
    part.questions.forEach((q) => {
      if (q.is_bookmarked) {
        bookmarkedItems.push({
          questionNumber: q.question_number,
          partIndex: pIdx,
          partNumber: part.part_number,
          status: q.status,
        });
      }
    });
  });

  const hasNotes = data.notes_content.trim().length > 0;
  const hasBookmarks = bookmarkedItems.length > 0;

  if (!hasNotes && !hasBookmarks) return null;

  return (
    <aside className="space-y-5">
      {/* Bookmarks */}
      {hasBookmarks && (
        <div className="rounded-lg border border-rule bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="h-4 w-4 text-saffron fill-saffron" />
            <h3 className="text-sm font-semibold text-ink">
              Preguntas que marcaste
            </h3>
            <span className="text-xs text-muted">
              ({bookmarkedItems.length})
            </span>
          </div>
          <p className="text-xs text-muted mb-3 leading-relaxed">
            Durante el examen marcaste estas preguntas para revisar.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {bookmarkedItems.map((b) => {
              const bgColor =
                b.status === "correct"
                  ? "bg-ok/15 text-ok"
                  : b.status === "incorrect"
                  ? "bg-error/15 text-error"
                  : b.status === "pending"
                  ? "bg-saffron/15 text-saffron"
                  : "bg-paper text-muted";
              return (
                <button
                  key={`${b.partIndex}-${b.questionNumber}`}
                  onClick={() => onJumpToPart(b.partIndex)}
                  className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold hover:opacity-80 transition-opacity ${bgColor}`}
                  title={`Part ${b.partNumber} · Q${b.questionNumber}`}
                >
                  Q{b.questionNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {hasNotes && (
        <div className="rounded-lg border border-rule bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="h-4 w-4 text-saffron" />
            <h3 className="text-sm font-semibold text-ink">
              Tus notas del examen
            </h3>
          </div>
          <div className="rounded bg-paper border border-rule p-3 max-h-64 overflow-y-auto">
            <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap font-mono">
              {data.notes_content}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
