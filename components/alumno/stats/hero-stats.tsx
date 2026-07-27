import { TrendingUp, CheckCircle2, Trophy } from "lucide-react";
import type { HeroStats } from "@/lib/stats/student";

interface Props {
  hero: HeroStats;
}

function scoreColor(pct: number | null): string {
  if (pct === null) return "text-muted";
  if (pct >= 60) return "text-ok";
  if (pct >= 40) return "text-saffron";
  return "text-error";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "—";
  }
}

export function HeroStatsSection({ hero }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Nota media */}
      <div className="rounded-lg border border-rule bg-white p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted font-medium mb-3">
          <TrendingUp className="h-3.5 w-3.5 text-navy" />
          Nota media
        </div>
        {hero.average_score_pct !== null ? (
          <>
            <p
              className={`text-4xl font-bold tabular-nums ${scoreColor(
                hero.average_score_pct
              )}`}
            >
              {hero.average_score_pct}
              <span className="text-xl text-muted font-normal">%</span>
            </p>
            <p className="text-xs text-muted mt-1">
              Media de {hero.mocks_completed}{" "}
              {hero.mocks_completed === 1 ? "mock" : "mocks"} completados
            </p>
          </>
        ) : (
          <div>
            <p className="text-4xl font-bold text-muted">—</p>
            <p className="text-xs text-muted mt-1">
              Sin mocks completos todavía
            </p>
          </div>
        )}
      </div>

      {/* Mocks hechos */}
      <div className="rounded-lg border border-rule bg-white p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted font-medium mb-3">
          <CheckCircle2 className="h-3.5 w-3.5 text-navy" />
          Mocks completos
        </div>
        <p className="text-4xl font-bold text-ink tabular-nums">
          {hero.mocks_completed}
        </p>
        <p className="text-xs text-muted mt-1">
          {hero.mocks_completed === 0
            ? "Empieza tu primer mock cuando quieras"
            : hero.mocks_completed === 1
            ? "Sigue así, cada mock cuenta"
            : "Vas cogiendo ritmo"}
        </p>
      </div>

      {/* Última nota */}
      <div className="rounded-lg border border-rule bg-white p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted font-medium mb-3">
          <Trophy className="h-3.5 w-3.5 text-navy" />
          Última nota
        </div>
        {hero.last_score_pct !== null ? (
          <>
            <p
              className={`text-4xl font-bold tabular-nums ${scoreColor(
                hero.last_score_pct
              )}`}
            >
              {hero.last_score_pct}
              <span className="text-xl text-muted font-normal">%</span>
            </p>
            <p className="text-xs text-muted mt-1 truncate">
              {hero.last_mock_title} · {formatDate(hero.last_mock_date)}
            </p>
          </>
        ) : (
          <div>
            <p className="text-4xl font-bold text-muted">—</p>
            <p className="text-xs text-muted mt-1">Aún no hay resultados</p>
          </div>
        )}
      </div>
    </div>
  );
}
