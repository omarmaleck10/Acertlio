import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  GraduationCap,
  Ticket,
  Mail,
  ArrowRight,
  BookOpenCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

export default async function AcademiaHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const admin = createAdminClient();

  // Nombre y datos de la academia (usa admin porque los academy_admin recién
  // creados pueden tener problemas con RLS en el primer render — es más robusto)
  const { data: academy } = await admin
    .from("academies")
    .select("name, plan, total_seats, status, created_at")
    .eq("id", user.profile.academy_id!)
    .maybeSingle();

  // Contadores
  const [
    { count: teacherCount },
    { count: studentCount },
    { count: pendingInvitations },
    { count: usedLicenses },
    { data: recentStudents },
    { data: recentInvitations },
  ] = await Promise.all([
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
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .not("student_id", "is", null)
      .eq("is_active", true),
    supabase
      .from("profiles")
      .select("id, full_name, email, current_level, created_at")
      .eq("role", "student")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("invitations")
      .select("email, role, created_at")
      .is("accepted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const total = academy?.total_seats ?? 0;
  const used = usedLicenses ?? 0;
  const free = total - used;
  const usagePct = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Panel academia</p>
          <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
            {academy?.name ?? "Tu academia"}
          </h1>
          <p className="text-sm text-muted mt-2">
            Plan{" "}
            <span className="text-navy font-medium">
              {PLAN_LABELS[academy?.plan ?? "starter"]}
            </span>{" "}
            · {total} plazas contratadas
          </p>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={<Ticket className="h-4 w-4" />}
          label="Plazas ocupadas"
          value={`${used}/${total}`}
          hint={`${free} libre${free === 1 ? "" : "s"} · ${usagePct}%`}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Profesores"
          value={teacherCount ?? 0}
          hint="activos"
        />
        <StatCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="Alumnos"
          value={studentCount ?? 0}
          hint="activos"
        />
        <StatCard
          icon={<Mail className="h-4 w-4" />}
          label="Invitaciones"
          value={pendingInvitations ?? 0}
          hint="pendientes"
        />
      </div>

      {/* Dos columnas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimos alumnos */}
        <section className="rounded border border-rule bg-white">
          <header className="px-5 py-3 border-b border-rule flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Últimos alumnos</h2>
            <Link
              href="/academia/alumnos"
              className="text-xs text-navy hover:underline inline-flex items-center gap-1"
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
            <div className="px-5 py-8 text-center">
              <GraduationCap className="h-8 w-8 text-muted/40 mx-auto mb-2" />
              <p className="text-sm text-muted mb-3">Aún no hay alumnos.</p>
              <Link
                href="/academia/alumnos"
                className="text-sm text-navy hover:underline"
              >
                Invitar al primero
              </Link>
            </div>
          )}
        </section>

        {/* Invitaciones pendientes */}
        <section className="rounded border border-rule bg-white">
          <header className="px-5 py-3 border-b border-rule flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Invitaciones pendientes</h2>
          </header>
          {recentInvitations && recentInvitations.length > 0 ? (
            <ul className="divide-y divide-rule">
              {recentInvitations.map((inv, i) => (
                <li
                  key={`${inv.email}-${i}`}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-ink font-mono">{inv.email}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {inv.role === "teacher" ? "Profesor" : "Alumno"} · Enviada{" "}
                      {new Date(inv.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <span className="text-xs text-saffron font-medium">Pendiente</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <BookOpenCheck className="h-8 w-8 text-muted/40 mx-auto mb-2" />
              <p className="text-sm text-muted">No hay invitaciones pendientes.</p>
            </div>
          )}
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded border border-rule bg-white p-5">
      <div className="flex items-center gap-2 text-muted mb-2">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-mono text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}
