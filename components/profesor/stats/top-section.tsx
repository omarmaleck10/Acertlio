import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import type { StudentRow } from "@/lib/stats/teacher";

interface Props {
  students: StudentRow[];
}

export function TopSection({ students }: Props) {
  if (students.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium mb-4 uppercase tracking-wider flex items-center gap-2 text-ok">
        <Trophy className="h-4 w-4" />
        Destacan
        <span className="text-xs font-normal text-muted">
          · top {students.length}
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {students.map((s, i) => (
          <Link
            key={s.student_id}
            href={`/profesor/alumnos/${s.student_id}`}
            className="rounded-lg border border-ok/30 bg-white p-4 hover:bg-ok/5 transition-colors group flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-2xl" aria-hidden>
                {medals[i] ?? "•"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">
                  {s.full_name}
                </p>
                <p className="text-xs text-muted truncate">
                  {s.level ? `${s.level} · ` : ""}
                  {s.mocks_completed}{" "}
                  {s.mocks_completed === 1 ? "mock" : "mocks"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg font-bold tabular-nums text-ok">
                {s.average_score_pct}%
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-ink" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
