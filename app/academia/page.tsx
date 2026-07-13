import Link from "next/link";
import {
  Ticket,
  Users,
  GraduationCap,
  Mail,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

export default async function AcademiaResumenPage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user?.profile.academy_id) return null;

  // Cargar datos en paralelo — todos filtrados por RLS
  const [
    { data: academy },
    { count: totalLicenses },
    { count: usedLicenses },
    { count: totalTeachers },
    { count: totalStudents },
    { count: pendingInvites },
    { data: recentStudents },
  ] = await Promise.all([
    supabase
      .from("academies")
      .select("name, plan, total_seats, city, cif")
      .eq("id", user.profile.academy_id)
      .single(),
    supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .not("student_id", "is", null),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "teacher")
      .eq("is_active", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", true),
    supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .is("accepted_at", null),
    supabase
      .from("profiles")
      .select("id, full_name, email, current_level, created_at")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const total = totalLicenses ?? 0;
  const used = usedLicenses ?? 0;
  const free = total - used;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;

  const PLAN_LABELS: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    business: "Business",
    enterprise: "Enterprise",
  };

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Panel academia</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          {academy?.name ?? "Tu academia"}
        </h1>
        <p className="text-sm text-muted mt-2">
          Plan {PLAN_LABELS[academy?.plan ?? "starter"]} · {total} plazas
          contratadas
          {academy?.city ? ` · ${academy.city}` : ""}
        </p>
      </header>

      {/* Cards de resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={<Ticket className="h-4 w-4" />}
          label="Plazas ocupadas"
          value={`${used}/${total}`}
          hint={`${free} libre${free === 1 ? "" : "s"} · ${pct}% ocupación`}
          href="/academia/licencias"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Profesores"
          value={String(totalTeachers ?? 0)}
          hint="Activos en la academia"
          href="/academia/profesores"
        />
        <StatCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="Alumnos"
          value={String(totalStudents ?? 0)}
          hint="Alumnos con licencia asignada"
          href="/academia/alumnos"
        />
        <StatCard
          icon={<Mail className="h-4 w-4" />}
          label="Invitaciones"
          value={String(pendingInvites ?? 0)}
          hint="Pendientes de aceptar"
          href="/academia/alumnos"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimos alumnos */}
        <section className="rounded border border-rule bg-white">
          <header className="px-5 py-3 border-b border-rule flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Últimos alumnos</h2>
            <Link
              href="/academia/alumnos"
              className="text-xs text-navy hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          {recentStudents && recentStudents.length > 0 ? (
            <ul className="divide-y divide-rule">
              {recentStudents.map((s) => (
                <li key={s.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ink font-medium">
                      {s.full_name ?? "Sin nombre"}
                    </p>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      {s.email}
                    </p>
                  </div>
                  {s.current_level && (
                    <span className="text-xs font-mono px-2 py-1 rounded bg-navy-50 text-navy">
                      {s.current_level}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center">
              <GraduationCap className="h-8 w-8 text-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted">
                Aún no hay alumnos. Empieza por invitar a los primeros desde{" "}
                <Link
                  href="/academia/alumnos"
                  className="text-navy hover:underline"
                >
                  Alumnos
                </Link>
                .
              </p>
            </div>
          )}
        </section>

        {/* Guía rápida de primeros pasos */}
        <section className="rounded border border-rule bg-white">
          <header className="px-5 py-3 border-b border-rule">
            <h2 className="text-sm font-medium text-ink">Primeros pasos</h2>
          </header>
          <ol className="px-5 py-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-mono text-xs text-muted mt-0.5">01</span>
              <div className="flex-1">
                <p className="text-ink">
                  <Link
                    href="/academia/configuracion"
                    className="hover:underline"
                  >
                    Completa los datos de la academia
                  </Link>
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {academy?.cif
                    ? "CIF configurado ✓"
                    : "Faltan CIF y dirección"}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-muted mt-0.5">02</span>
              <div className="flex-1">
                <p className="text-ink">
                  <Link
                    href="/academia/profesores"
                    className="hover:underline"
                  >
                    Invita a tus profesores
                  </Link>
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {(totalTeachers ?? 0) > 0
                    ? `${totalTeachers} profesor${(totalTeachers ?? 0) === 1 ? "" : "es"} activo${(totalTeachers ?? 0) === 1 ? "" : "s"} ✓`
                    : "Aún no hay profesores en la academia"}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-muted mt-0.5">03</span>
              <div className="flex-1">
                <p className="text-ink">
                  <Link href="/academia/alumnos" className="hover:underline">
                    Da de alta alumnos
                  </Link>
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {(totalStudents ?? 0) > 0
                    ? `${totalStudents} alumno${(totalStudents ?? 0) === 1 ? "" : "s"} activo${(totalStudents ?? 0) === 1 ? "" : "s"} ✓`
                    : "Cada alumno ocupa una plaza concurrente"}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-muted mt-0.5">04</span>
              <div className="flex-1">
                <p className="text-ink flex items-center gap-2">
                  Asignar simulacros{" "}
                  <span className="text-xs font-mono text-saffron">
                    Próximamente
                  </span>
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Estamos preparando el catálogo de mocks B1, B2 y C1
                </p>
              </div>
            </li>
          </ol>
        </section>
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
