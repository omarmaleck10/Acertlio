import Link from "next/link";
import { Users, ClipboardCheck, FileText, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

export default async function ProfesorResumenPage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  // Alumnos asignados (via teacher_students)
  const { data: assignments } = await supabase
    .from("teacher_students")
    .select("student_id")
    .eq("teacher_id", user.id);

  const studentIds = (assignments ?? []).map((a) => a.student_id);

  const { data: students } = studentIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, current_level, created_at")
        .in("id", studentIds)
        .eq("is_active", true)
        .order("full_name", { ascending: true })
        .limit(6)
    : { data: [] };

  const totalStudents = studentIds.length;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Panel profesor</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Hola, {user.profile.full_name?.split(" ")[0] ?? "profe"}
        </h1>
        <p className="text-sm text-muted mt-2">
          {totalStudents > 0
            ? `Tienes ${totalStudents} alumno${totalStudents === 1 ? "" : "s"} asignado${totalStudents === 1 ? "" : "s"}.`
            : "Aún no tienes alumnos asignados."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Alumnos"
          value={String(totalStudents)}
          hint="Asignados a ti"
          href="/profesor/alumnos"
        />
        <StatCard
          icon={<ClipboardCheck className="h-4 w-4" />}
          label="Simulacros"
          value="0"
          hint="Próximamente"
          href="/profesor/simulacros"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Writings"
          value="0"
          hint="Pendientes de corregir"
          href="/profesor/writing"
        />
      </div>

      <section className="rounded border border-rule bg-white">
        <header className="px-5 py-3 border-b border-rule flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Tus alumnos</h2>
          {totalStudents > 6 && (
            <Link
              href="/profesor/alumnos"
              className="text-xs text-navy hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </header>
        {students && students.length > 0 ? (
          <ul className="divide-y divide-rule">
            {students.map((s) => (
              <li
                key={s.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-ink font-medium">
                    {s.full_name ?? "Sin nombre"}
                  </p>
                  <p className="text-xs text-muted font-mono">{s.email}</p>
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
          <div className="px-5 py-12 text-center">
            <Users className="h-8 w-8 text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted mb-1">
              Aún no tienes alumnos asignados.
            </p>
            <p className="text-xs text-muted">
              Pide a tu academia que te asigne alumnos desde su panel.
            </p>
          </div>
        )}
      </section>
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
