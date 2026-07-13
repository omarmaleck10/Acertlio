import Link from "next/link";
import { BookOpenCheck, History, BarChart3, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

export default async function AlumnoResumenPage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  // Nombre de la academia
  const { data: academy } = user.profile.academy_id
    ? await supabase
        .from("academies")
        .select("name")
        .eq("id", user.profile.academy_id)
        .single()
    : { data: null };

  // Su profesor (si le han asignado)
  const { data: teacherRel } = await supabase
    .from("teacher_students")
    .select("teacher_id")
    .eq("student_id", user.id)
    .maybeSingle();

  const { data: teacher } = teacherRel
    ? await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", teacherRel.teacher_id)
        .single()
    : { data: null };

  return (
    <div className="px-8 py-8 max-w-4xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Panel alumno</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Hola, {user.profile.full_name?.split(" ")[0] ?? "alumno"}
        </h1>
        <p className="text-sm text-muted mt-2">
          {academy?.name ? `${academy.name} · ` : ""}
          Nivel de preparación:{" "}
          <span className="text-navy font-medium">
            {user.profile.current_level ?? "Sin asignar"}
          </span>
        </p>
      </header>

      {/* Card grande CTA */}
      <section className="rounded border border-rule bg-white p-8 mb-8 flex items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-saffron mb-2">
            Próximo simulacro
          </p>
          <h2 className="text-xl font-semibold text-ink mb-1">
            Aún no tienes simulacros asignados
          </h2>
          <p className="text-sm text-muted">
            Cuando tu profesor te asigne un mock, aparecerá aquí.
          </p>
        </div>
        <button
          disabled
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-navy/40 text-white text-sm font-medium rounded cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          Empezar
        </button>
      </section>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard
          icon={<BookOpenCheck className="h-4 w-4" />}
          label="Simulacros"
          value="0"
          hint="Asignados y pendientes"
          href="/alumno/simulacros"
        />
        <StatCard
          icon={<History className="h-4 w-4" />}
          label="Historial"
          value="0"
          hint="Intentos completados"
          href="/alumno/historial"
        />
        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Puntuación"
          value="—"
          hint="Sin datos aún"
          href="/alumno/progreso"
        />
      </div>

      {/* Info profesor y academia */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded border border-rule bg-white p-5">
          <h3 className="text-xs uppercase tracking-wider text-muted mb-3">
            Tu profesor
          </h3>
          {teacher ? (
            <>
              <p className="text-sm text-ink font-medium">
                {teacher.full_name ?? "Sin nombre"}
              </p>
              <p className="text-xs text-muted font-mono mt-1">
                {teacher.email}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Aún no tienes profesor asignado. Tu academia te lo asignará pronto.
            </p>
          )}
        </section>
        <section className="rounded border border-rule bg-white p-5">
          <h3 className="text-xs uppercase tracking-wider text-muted mb-3">
            Cómo funciona
          </h3>
          <ul className="space-y-2 text-sm text-ink">
            <li>1. Tu profesor te asigna un simulacro</li>
            <li>2. Lo haces en el tiempo real del examen</li>
            <li>3. Recibes tu puntuación Cambridge estimada</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-rule">
        <Link
          href="/alumno/examen"
          className="text-sm text-muted hover:text-navy inline-flex items-center gap-2"
        >
          <Play className="h-3.5 w-3.5" />
          Ver una demo del simulador →
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded border border-rule bg-white p-4 hover:border-navy/40 transition-colors block"
    >
      <div className="flex items-center gap-2 text-muted mb-2">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-ink font-mono tabular-nums">
        {value}
      </p>
      <p className="text-xs text-muted mt-1">{hint}</p>
    </Link>
  );
}
