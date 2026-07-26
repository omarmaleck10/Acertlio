import Link from "next/link";
import { Plus, ClipboardList, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadTeacherAssignments } from "@/lib/assignments/status";
import { AssignmentCard } from "@/components/profesor/assignment-card";

interface Props {
  searchParams: { created?: string };
}

export default async function AsignacionesPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { profile } = user;
  if (!profile.academy_id) {
    return (
      <div className="px-6 md:px-8 py-8">
        <p className="text-sm text-muted">
          Tu cuenta no está asociada a una academia.
        </p>
      </div>
    );
  }

  const isAdmin = profile.role === "academy_admin";
  const assignments = await loadTeacherAssignments(
    user.id,
    profile.academy_id,
    !isAdmin // los profesores solo ven las suyas; admin ve todas
  );

  const createdCount = Number(searchParams.created ?? 0);

  // Agrupar por estado
  const active = assignments.filter(
    (a) => a.status === "pending" || a.status === "in_progress"
  );
  const overdue = assignments.filter((a) => a.status === "overdue");
  const completed = assignments.filter((a) => a.status === "completed");
  const cancelled = assignments.filter((a) => a.status === "cancelled");

  return (
    <div className="px-6 md:px-8 py-8 max-w-5xl">
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            Asignaciones
          </p>
          <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
            Simulacros asignados
          </h1>
          <p className="text-sm text-muted mt-2">
            Aquí ves los simulacros que has asignado a tus alumnos.
            {isAdmin && " Como admin, ves las asignaciones de toda la academia."}
          </p>
        </div>
        <Link
          href="/profesor/asignaciones/nueva"
          className="inline-flex items-center gap-2 rounded bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nueva asignación
        </Link>
      </header>

      {/* Toast si acabamos de crear */}
      {createdCount > 0 && (
        <div className="mb-6 rounded border border-ok/40 bg-ok/10 p-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-ok" />
          <p className="text-sm text-ink">
            {createdCount === 1
              ? "1 asignación creada. El alumno ha recibido un email."
              : `${createdCount} asignaciones creadas. Los alumnos han recibido un email.`}
          </p>
        </div>
      )}

      {/* Vacío */}
      {assignments.length === 0 && (
        <div className="rounded-lg border border-rule bg-white p-12 text-center">
          <ClipboardList className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-ink mb-1">
            No has asignado ningún simulacro todavía
          </p>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">
            Asigna un simulacro a uno o varios alumnos para que aparezcan en su
            dashboard. Recibirán un email de aviso.
          </p>
          <Link
            href="/profesor/asignaciones/nueva"
            className="inline-flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear la primera asignación
          </Link>
        </div>
      )}

      {/* Secciones */}
      {overdue.length > 0 && (
        <Section
          title="Vencidos sin completar"
          subtitle="Estos alumnos no terminaron a tiempo"
          count={overdue.length}
          tone="error"
        >
          {overdue.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </Section>
      )}

      {active.length > 0 && (
        <Section
          title="Activos"
          subtitle="Pendientes o en progreso"
          count={active.length}
        >
          {active.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </Section>
      )}

      {completed.length > 0 && (
        <Section
          title="Completados"
          subtitle="Ya terminados por el alumno"
          count={completed.length}
        >
          {completed.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </Section>
      )}

      {cancelled.length > 0 && (
        <Section title="Cancelados" count={cancelled.length}>
          {cancelled.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </Section>
      )}
    </div>
  );
}


function Section({
  title,
  subtitle,
  count,
  tone,
  children,
}: {
  title: string;
  subtitle?: string;
  count: number;
  tone?: "error";
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2
          className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${
            tone === "error" ? "text-error" : "text-ink"
          }`}
        >
          {title}
          <span className="text-xs font-normal text-muted">({count})</span>
        </h2>
        {subtitle && (
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
