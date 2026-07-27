import Link from "next/link";
import { AlertCircle, TrendingDown, Clock, ArrowRight } from "lucide-react";
import type { StudentRow } from "@/lib/stats/teacher";
import { formatLastActivity } from "@/lib/stats/teacher";

interface Props {
  lowScore: StudentRow[];
  inactive: StudentRow[];
}

export function AttentionSection({ lowScore, inactive }: Props) {
  if (lowScore.length === 0 && inactive.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium mb-4 uppercase tracking-wider flex items-center gap-2 text-error">
        <AlertCircle className="h-4 w-4" />
        Necesitan atención
        <span className="text-xs font-normal text-muted">
          ({lowScore.length + inactive.length})
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bajo rendimiento */}
        {lowScore.length > 0 && (
          <div className="rounded-lg border border-error/30 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-rule bg-error/5">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-error" />
                <p className="text-sm font-medium text-ink">
                  Bajo rendimiento
                </p>
                <span className="text-xs text-muted">
                  · nota media &lt; 50%
                </span>
              </div>
            </div>
            <div className="divide-y divide-rule">
              {lowScore.map((s) => (
                <StudentRowItem key={s.student_id} student={s} showScore />
              ))}
            </div>
          </div>
        )}

        {/* Inactivos */}
        {inactive.length > 0 && (
          <div className="rounded-lg border border-saffron/30 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-rule bg-saffron/5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-saffron" />
                <p className="text-sm font-medium text-ink">Inactivos</p>
                <span className="text-xs text-muted">· &gt; 14 días</span>
              </div>
            </div>
            <div className="divide-y divide-rule">
              {inactive.map((s) => (
                <StudentRowItem key={s.student_id} student={s} showInactive />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


function StudentRowItem({
  student,
  showScore,
  showInactive,
}: {
  student: StudentRow;
  showScore?: boolean;
  showInactive?: boolean;
}) {
  return (
    <Link
      href={`/profesor/alumnos/${student.student_id}`}
      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-paper transition-colors group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">
          {student.full_name}
        </p>
        <p className="text-xs text-muted truncate">
          {student.level ? `${student.level} · ` : ""}
          {student.email}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {showScore && student.average_score_pct !== null && (
          <span className="text-sm font-bold tabular-nums text-error">
            {student.average_score_pct}%
          </span>
        )}
        {showInactive && (
          <span className="text-xs text-muted whitespace-nowrap">
            {formatLastActivity(student.last_activity_at)}
          </span>
        )}
        <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-ink" />
      </div>
    </Link>
  );
}
