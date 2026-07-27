import { TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
import type { StudentComparison } from "@/lib/stats/comparison";

interface Props {
  comparison: StudentComparison;
  studentLevel: string | null;
}

export function ComparisonCard({ comparison, studentLevel }: Props) {
  const {
    student_avg_pct,
    class_avg_pct,
    diff_pct,
    class_size_with_data,
    student_rank,
  } = comparison;

  if (student_avg_pct === null) {
    return null; // Sin datos → no mostramos
  }

  const above = diff_pct !== null && diff_pct > 2;
  const below = diff_pct !== null && diff_pct < -2;
  const near = diff_pct !== null && Math.abs(diff_pct) <= 2;

  const arrowIcon = above ? (
    <TrendingUp className="h-4 w-4" />
  ) : below ? (
    <TrendingDown className="h-4 w-4" />
  ) : (
    <Minus className="h-4 w-4" />
  );

  const arrowColor = above
    ? "text-ok"
    : below
    ? "text-error"
    : "text-navy";

  const label = above
    ? "Por encima de la media"
    : below
    ? "Por debajo de la media"
    : "En la media";

  const scope = studentLevel ? `del nivel ${studentLevel}` : "de la academia";

  return (
    <div className="rounded-lg border border-navy/30 bg-navy/5 p-5 mb-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-navy font-medium mb-3">
        <Users className="h-3.5 w-3.5" />
        Comparativa {scope}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Nota alumno */}
        <div>
          <p className="text-xs text-muted mb-1">Este alumno</p>
          <p className="text-2xl font-bold text-ink tabular-nums">
            {student_avg_pct}%
          </p>
        </div>

        {/* Media clase */}
        <div>
          <p className="text-xs text-muted mb-1">
            Media clase ({class_size_with_data})
          </p>
          <p className="text-2xl font-bold text-ink tabular-nums">
            {class_avg_pct !== null ? `${class_avg_pct}%` : "—"}
          </p>
        </div>

        {/* Diferencia */}
        <div>
          <p className="text-xs text-muted mb-1">Diferencia</p>
          <div className={`flex items-center gap-1.5 ${arrowColor}`}>
            {arrowIcon}
            <p className="text-2xl font-bold tabular-nums">
              {diff_pct !== null && diff_pct > 0 ? "+" : ""}
              {diff_pct ?? 0}%
            </p>
          </div>
        </div>
      </div>

      <p className={`text-xs mt-4 ${arrowColor}`}>
        <strong>{label}</strong>
        {student_rank && class_size_with_data > 1 ? (
          <span className="text-muted font-normal">
            {" · "}
            Posición {student_rank} de {class_size_with_data}
          </span>
        ) : null}
        {near ? (
          <span className="text-muted font-normal">
            {" · "}
            La diferencia es pequeña
          </span>
        ) : null}
      </p>
    </div>
  );
}
