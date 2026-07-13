import Link from "next/link";
import {
  Building2,
  Users,
  GraduationCap,
  Mail,
  ArrowRight,
  Ticket,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminResumenPage() {
  // Superadmin: bypasseamos RLS para tener contadores globales
  const admin = createAdminClient();

  const [
    { count: totalAcademies },
    { count: activeAcademies },
    { count: totalTeachers },
    { count: totalStudents },
    { count: totalLicenses },
    { count: usedLicenses },
    { count: pendingInvites },
    { data: recentAcademies },
  ] = await Promise.all([
    admin.from("academies").select("*", { count: "exact", head: true }),
    admin
      .from("academies")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "teacher")
      .eq("is_active", true),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", true),
    admin.from("licenses").select("*", { count: "exact", head: true }).eq("is_active", true),
    admin
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .not("student_id", "is", null),
    admin
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .is("accepted_at", null),
    admin
      .from("academies")
      .select("id, name, plan, city, created_at, total_seats, status")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Superadmin</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Panorama de Acertlio
        </h1>
        <p className="text-sm text-muted mt-2">
          Vista global de la plataforma. Todo lo que veas aquí es real.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Academias"
          value={String(totalAcademies ?? 0)}
          hint={`${activeAcademies ?? 0} activas`}
          href="/admin/academias"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Profesores"
          value={String(totalTeachers ?? 0)}
          hint="Total en la plataforma"
          href="/admin/usuarios"
        />
        <StatCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="Alumnos"
          value={String(totalStudents ?? 0)}
          hint="Total en la plataforma"
          href="/admin/usuarios"
        />
        <StatCard
          icon={<Ticket className="h-4 w-4" />}
          label="Plazas usadas"
          value={`${usedLicenses ?? 0}/${totalLicenses ?? 0}`}
          hint={`${(totalLicenses ?? 0) - (usedLicenses ?? 0)} libres`}
          href="/admin/academias"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimas academias */}
        <section className="rounded border border-rule bg-white">
          <header className="px-5 py-3 border-b border-rule flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Últimas academias</h2>
            <Link
              href="/admin/academias"
              className="text-xs text-navy hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          {recentAcademies && recentAcademies.length > 0 ? (
            <ul className="divide-y divide-rule">
              {recentAcademies.map((a) => (
                <li key={a.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ink font-medium">{a.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {a.plan} · {a.total_seats} plazas
                      {a.city ? ` · ${a.city}` : ""}
                    </p>
                  </div>
                  <span
                    className={
                      a.status === "active"
                        ? "text-xs font-medium px-2 py-1 rounded bg-ok/10 text-ok"
                        : "text-xs font-medium px-2 py-1 rounded bg-muted/10 text-muted"
                    }
                  >
                    {a.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-sm text-muted text-center">
              Aún no hay academias registradas.
            </p>
          )}
        </section>

        {/* Actividad reciente */}
        <section className="rounded border border-rule bg-white p-5">
          <h2 className="text-sm font-medium text-ink mb-4">Panel de control</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between py-1">
              <span className="text-muted">Invitaciones pendientes</span>
              <span className="text-ink font-mono">{pendingInvites ?? 0}</span>
            </li>
            <li className="flex items-center justify-between py-1">
              <span className="text-muted">Simulacros publicados</span>
              <span className="text-ink font-mono">0</span>
            </li>
            <li className="flex items-center justify-between py-1">
              <span className="text-muted">Intentos totales</span>
              <span className="text-ink font-mono">0</span>
            </li>
          </ul>
          <div className="mt-6 pt-4 border-t border-rule">
            <p className="text-xs text-muted">
              Envía un email de prueba desde{" "}
              <Link href="/api/test-email?to=acertlio.app@gmail.com" className="text-navy hover:underline font-mono">
                /api/test-email
              </Link>
            </p>
          </div>
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
