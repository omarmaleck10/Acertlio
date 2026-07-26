import Link from "next/link";
import {
  BookOpenCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  CalendarX,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loadStudentAssignments,
  formatDueDate,
  statusColorClass,
} from "@/lib/assignments/status";

export default async function AlumnoResumenPage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: academy } = user.profile.academy_id
    ? await supabase
        .from("academies")
        .select("name")
        .eq("id", user.profile.academy_id)
        .single()
    : { data: null };

  const level = (user.profile as unknown as Record<string, unknown>).level as
    | string
    | null
    | undefined;

  const isAcademyStudent = Boolean(user.profile.academy_id);

  // Alumnos de academia: SOLO ven asignaciones
  // Alumnos individuales: verían mocks de su nivel (Bloque A siguiente sesión)
  const assignments = await loadStudentAssignments(user.id);

  // Separar por estado
  const active = assignments.filter(
    (a) =>
      a.status === "pending" ||
      a.status === "in_progress" ||
      a.status === "overdue"
  );
  const completed = assignments
    .filter((a) => a.status === "completed")
    .slice(0, 3); // solo los 3 más recientes

  return (
    <div className="px-6 md:px-8 py-8 max-w-4xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          {academy?.name ?? "Acertlio"} · Alumno
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          Hola, {user.profile.full_name?.split(" ")[0] ?? "alumno"}
        </h1>
        <p className="text-sm text-muted mt-2">
          {level ? (
            <>
              Preparación para el nivel{" "}
              <strong className="text-navy">{level}</strong>.
            </>
          ) : (
            "Aquí tienes tus simulacros asignados."
          )}
        </p>
      </header>

      {/* Estado principal */}
      {isAcademyStudent ? (
        active.length === 0 && completed.length === 0 ? (
          <EmptyStateAcademyStudent />
        ) : (
          <>
            {active.length > 0 && (
              <section className="mb-10">
                <h2 className="text-sm font-medium text-ink mb-4 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-saffron" />
                  Simulacros asignados
                  <span className="text-xs font-normal text-muted">
                    ({active.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {active.map((a) => (
                    <AssignmentRow key={a.id} assignment={a} />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section className="mb-10">
                <h2 className="text-sm font-medium text-ink mb-4 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok" />
                  Completados recientemente
                </h2>
                <div className="space-y-3">
                  {completed.map((a) => (
                    <AssignmentRow key={a.id} assignment={a} />
                  ))}
                </div>
              </section>
            )}
          </>
        )
      ) : (
        // Placeholder para alumnos individuales — Bloque A viene después
        <div className="rounded-lg border border-saffron/30 bg-saffron/5 p-6">
          <p className="text-sm font-medium text-ink mb-1">
            El plan individual estará disponible próximamente
          </p>
          <p className="text-sm text-muted">
            Estamos preparándolo. Mientras tanto, si perteneces a una academia,
            tu profesor te asignará simulacros aquí.
          </p>
        </div>
      )}
    </div>
  );
}


// ─── Empty state para alumnos de academia sin asignaciones ────────────
function EmptyStateAcademyStudent() {
  return (
    <div className="rounded-lg border border-rule bg-white p-10 text-center">
      <BookOpenCheck className="h-12 w-12 text-muted mx-auto mb-4 opacity-40" />
      <p className="text-base font-medium text-ink mb-2">
        Tu profesor te asignará simulacros aquí
      </p>
      <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
        Cuando tu profesor te asigne un simulacro, aparecerá aquí con la fecha
        límite y podrás empezarlo cuando quieras.
      </p>
    </div>
  );
}


// ─── Fila de asignación en el dashboard ───────────────────────────────
function AssignmentRow({
  assignment,
}: {
  assignment: Awaited<ReturnType<typeof loadStudentAssignments>>[number];
}) {
  const c = statusColorClass(assignment.status);
  const dueLabel = formatDueDate(assignment.due_date);
  const isOverdue = assignment.status === "overdue";
  const isCompleted = assignment.status === "completed";
  const isInProgress = assignment.status === "in_progress";

  const cardBorder = isOverdue
    ? "border-error/50 hover:border-error"
    : isInProgress
    ? "border-saffron/50 hover:border-saffron"
    : isCompleted
    ? "border-ok/30"
    : "border-rule hover:border-navy";

  const linkHref = `/alumno/examenes/${assignment.exam_id}`;

  const cta = isCompleted
    ? "Ver resultado"
    : isInProgress
    ? "Continuar"
    : "Empezar";

  const ctaColor = isCompleted
    ? "text-ok"
    : isInProgress
    ? "text-saffron"
    : isOverdue
    ? "text-error"
    : "text-navy";

  return (
    <Link
      href={linkHref}
      className={`block bg-white rounded-lg border-2 ${cardBorder} p-4 transition-colors group`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-xs uppercase tracking-wider text-navy font-medium">
              {assignment.exam_level} · Mock {assignment.mock_number ?? "?"}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${c.bg} ${c.text}`}
            >
              {c.label}
            </span>
          </div>
          <p className="text-base font-medium text-ink">
            {assignment.exam_title}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted flex-wrap">
            {dueLabel && (
              <span
                className={`inline-flex items-center gap-1 ${
                  isOverdue ? "text-error font-medium" : ""
                }`}
              >
                {isOverdue ? (
                  <CalendarX className="h-3 w-3" />
                ) : (
                  <CalendarClock className="h-3 w-3" />
                )}
                {dueLabel}
              </span>
            )}
            {assignment.assigned_by_name && (
              <span>Asignado por {assignment.assigned_by_name}</span>
            )}
            {assignment.progress_papers_total > 0 && (
              <span>
                <strong className="text-ink">
                  {assignment.progress_papers_done}
                </strong>
                /{assignment.progress_papers_total} papers
              </span>
            )}
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-1 text-sm font-medium ${ctaColor} group-hover:gap-2 transition-all flex-shrink-0 self-center`}
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
