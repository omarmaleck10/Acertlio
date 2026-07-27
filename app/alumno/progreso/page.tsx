import { redirect } from "next/navigation";
import { BookOpenCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadStudentStats } from "@/lib/stats/student";
import { HeroStatsSection } from "@/components/alumno/stats/hero-stats";
import { EvolutionChart } from "@/components/alumno/stats/evolution-chart";
import { PartBreakdown } from "@/components/alumno/stats/part-breakdown";
import { TimeStatsSection } from "@/components/alumno/stats/time-stats";

export default async function AlumnoProgresoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const level = ((user.profile as unknown as Record<string, unknown>)
    .current_level ?? (user.profile as unknown as Record<string, unknown>).level) as
    | string
    | null
    | undefined;

  const stats = await loadStudentStats(user.id, level ?? null);

  const hasAnyData = stats.hero.mocks_completed > 0;

  return (
    <div className="px-6 md:px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          Tu progreso
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          ¿Cómo vas?
        </h1>
        <p className="text-sm text-muted mt-2">
          {hasAnyData ? (
            <>
              Análisis de todos tus mocks completados
              {level ? (
                <>
                  {" "}
                  del nivel{" "}
                  <strong className="text-navy">{level}</strong>
                </>
              ) : null}
              .
            </>
          ) : (
            "Completa tu primer mock para empezar a ver tu progreso."
          )}
        </p>
      </header>

      {!hasAnyData ? (
        <div className="rounded-lg border border-rule bg-white p-10 text-center">
          <BookOpenCheck className="h-12 w-12 text-muted mx-auto mb-4 opacity-40" />
          <p className="text-base font-medium text-ink mb-2">
            Aún no hay estadísticas
          </p>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            Cuando completes un mock (todos sus papers), tu nota aparecerá
            aquí junto con la evolución, aciertos por Part y tiempo empleado.
          </p>
        </div>
      ) : (
        <>
          <HeroStatsSection hero={stats.hero} />
          <EvolutionChart points={stats.evolution} />
          <PartBreakdown parts={stats.parts} />
          <TimeStatsSection times={stats.times} />
        </>
      )}
    </div>
  );
}
