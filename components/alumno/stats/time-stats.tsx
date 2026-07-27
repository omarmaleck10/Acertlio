import { Clock } from "lucide-react";
import type { TimeStat } from "@/lib/stats/student";
import { formatSecondsToMinSec } from "@/lib/stats/student";

interface Props {
  times: TimeStat[];
}

function usageMessage(pct: number): { label: string; color: string } {
  if (pct >= 95)
    return {
      label: "Justo",
      color: "text-error",
    };
  if (pct >= 75)
    return {
      label: "Buen ritmo",
      color: "text-ok",
    };
  if (pct >= 50)
    return {
      label: "Con margen",
      color: "text-navy",
    };
  return {
    label: "Muy rápido",
    color: "text-saffron",
  };
}

export function TimeStatsSection({ times }: Props) {
  if (times.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium text-ink mb-4 uppercase tracking-wider flex items-center gap-2">
        <Clock className="h-4 w-4 text-saffron" />
        Tiempo empleado
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {times.map((t) => {
          const usage = usageMessage(t.usage_pct);
          return (
            <div
              key={t.paper_code}
              className="rounded-lg border border-rule bg-white p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {t.paper_title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Media de {t.attempts_count}{" "}
                    {t.attempts_count === 1 ? "intento" : "intentos"}
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold ${usage.color}`}
                >
                  {usage.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-2xl font-bold text-ink tabular-nums">
                  {formatSecondsToMinSec(t.avg_time_seconds)}
                </p>
                <p className="text-xs text-muted">
                  de {formatSecondsToMinSec(t.max_time_seconds)} ({t.usage_pct}%)
                </p>
              </div>

              {/* Barra */}
              <div className="w-full h-2 rounded-full bg-paper overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    t.usage_pct >= 95
                      ? "bg-error"
                      : t.usage_pct >= 75
                      ? "bg-ok"
                      : t.usage_pct >= 50
                      ? "bg-navy"
                      : "bg-saffron"
                  }`}
                  style={{ width: `${Math.min(100, t.usage_pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted mt-3 leading-relaxed">
        Vas <strong>Muy rápido</strong> (menos del 50%) → puede que no estés
        revisando. <strong>Justo</strong> (95%+) → cuidado el día del examen.{" "}
        <strong>Buen ritmo</strong> (75-95%) → estás en el rango ideal.
      </p>
    </section>
  );
}
