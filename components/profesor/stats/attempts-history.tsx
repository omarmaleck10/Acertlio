import Link from "next/link";
import { History, ArrowRight } from "lucide-react";
import type { MockScorePoint } from "@/lib/stats/student";

interface Props {
  attempts: MockScorePoint[];
}

function scoreColor(pct: number): string {
  if (pct >= 60) return "text-ok";
  if (pct >= 40) return "text-saffron";
  return "text-error";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function StudentAttemptsHistory({ attempts }: Props) {
  if (attempts.length === 0) return null;

  // Orden inverso: más reciente primero
  const ordered = [...attempts].reverse();

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium text-ink mb-4 uppercase tracking-wider flex items-center gap-2">
        <History className="h-4 w-4 text-saffron" />
        Historial de mocks completados
        <span className="text-xs font-normal text-muted">
          ({ordered.length})
        </span>
      </h2>

      <div className="rounded-lg border border-rule bg-white overflow-hidden">
        <div className="divide-y divide-rule">
          {ordered.map((a) => (
            <Link
              key={a.attempt_id}
              href={`/profesor/simulacros/${a.attempt_id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-paper transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink font-medium">{a.exam_title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {a.mock_number !== null ? `Mock ${a.mock_number} · ` : ""}
                  Completado el {formatDate(a.completed_at)}
                </p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {a.reading_pct !== null && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted">R&W</p>
                    <p
                      className={`text-sm font-semibold tabular-nums ${scoreColor(
                        a.reading_pct
                      )}`}
                    >
                      {Math.round(a.reading_pct)}%
                    </p>
                  </div>
                )}
                {a.writing_pct !== null && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted">Writing</p>
                    <p
                      className={`text-sm font-semibold tabular-nums ${scoreColor(
                        a.writing_pct
                      )}`}
                    >
                      {Math.round(a.writing_pct)}%
                    </p>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-xs text-muted">Global</p>
                  <p
                    className={`text-lg font-bold tabular-nums ${scoreColor(
                      a.overall_pct
                    )}`}
                  >
                    {a.overall_pct}%
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-ink" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
