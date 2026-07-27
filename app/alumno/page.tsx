import Link from "next/link";
import { cookies } from "next/headers";
import {
  BookOpenCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  CalendarX,
  GraduationCap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loadStudentAssignments,
  formatDueDate,
  statusColorClass,
} from "@/lib/assignments/status";
import { getIndividualStatus } from "@/lib/individual/trial";
import {
  TrialBanner,
  ActivationWelcomeToast,
} from "@/components/alumno/trial-banner";
import {
  IndividualMocksList,
  type IndividualMockCardData,
} from "@/components/alumno/individual-mocks-list";

export default async function AlumnoResumenPage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createAdminClient();

  const isIndividual = Boolean(
    (user.profile as unknown as Record<string, unknown>).is_individual
  );

  const level = ((user.profile as unknown as Record<string, unknown>)
    .current_level ?? (user.profile as unknown as Record<string, unknown>).level) as
    | string
    | null
    | undefined;

  const { data: academy } = user.profile.academy_id
    ? await supabase
        .from("academies")
        .select("name")
        .eq("id", user.profile.academy_id)
        .single()
    : { data: null };

  // ────── FLUJO INDIVIDUAL ──────
  if (isIndividual) {
    const status = await getIndividualStatus({
      id: user.id,
      is_individual: true,
      trial_ends_at:
        ((user.profile as unknown as Record<string, unknown>)
          .trial_ends_at as string | null) ?? null,
      current_level: level ?? null,
    });

    // Cargar mocks del nivel del alumno
    let mocks: IndividualMockCardData[] = [];
    if (level) {
      const { data: exams } = await admin
        .from("exams")
        .select("id, title, level, mock_number, is_published")
        .eq("is_published", true)
        .eq("level", level)
        .order("mock_number", { ascending: true });

      if (exams && exams.length > 0) {
        const examIds = exams.map((e) => e.id);

        // Papers publicados de cada mock
        const { data: papers } = await admin
          .from("exam_papers")
          .select("id, exam_id, code, order_index, is_available")
          .in("exam_id", examIds)
          .order("order_index", { ascending: true });

        const papersByExam = new Map<string, { id: string; code: string }[]>();
        (papers ?? []).forEach((p) => {
          if (!p.is_available) return;
          const arr = papersByExam.get(p.exam_id) ?? [];
          arr.push({ id: p.id, code: p.code });
          papersByExam.set(p.exam_id, arr);
        });

        // Attempts del alumno
        const { data: attempts } = await admin
          .from("attempts")
          .select("id, exam_id, status")
          .eq("student_id", user.id)
          .in("exam_id", examIds);

        const attemptByExam = new Map<string, { id: string; status: string }>();
        (attempts ?? []).forEach((a) =>
          attemptByExam.set(a.exam_id, { id: a.id, status: a.status })
        );

        // Paper attempts completados
        const attemptIds = (attempts ?? []).map((a) => a.id);
        const { data: paperAttempts } =
          attemptIds.length > 0
            ? await admin
                .from("paper_attempts")
                .select("attempt_id, paper_id, status")
                .in("attempt_id", attemptIds)
            : { data: [] };

        const completedPapersByAttempt = new Map<string, Set<string>>();
        (paperAttempts ?? []).forEach((pa) => {
          if (pa.status === "completed" || pa.status === "time_expired") {
            const set =
              completedPapersByAttempt.get(pa.attempt_id) ?? new Set<string>();
            set.add(pa.paper_id);
            completedPapersByAttempt.set(pa.attempt_id, set);
          }
        });

        mocks = exams.map((e) => {
          const attempt = attemptByExam.get(e.id);
          const totalPapers = papersByExam.get(e.id)?.length ?? 0;
          const donePapers = attempt
            ? completedPapersByAttempt.get(attempt.id)?.size ?? 0
            : 0;
          const isCompleted = totalPapers > 0 && donePapers >= totalPapers;
          const state = isCompleted
            ? "completed"
            : attempt
            ? "in_progress"
            : "not_started";

          return {
            exam_id: e.id,
            title: e.title,
            level: e.level,
            mock_number: e.mock_number,
            state: state as "not_started" | "in_progress" | "completed",
            progress_papers_done: donePapers,
            progress_papers_total: totalPapers,
            first_paper_code: papersByExam.get(e.id)?.[0]?.code ?? null,
          };
        });
      }
    }

    // Toast bienvenida Premium (solo 1 vez, si acaba de pasar a active)
    const cookieStore = cookies();
    const premiumSeen = cookieStore.get("premium_toast_seen")?.value === "1";
    const showPremiumToast = status.status === "active" && !premiumSeen;

    const canStartNew = status.status !== "trialing_capped";

    return (
      <div className="px-6 md:px-8 py-8 max-w-4xl">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-muted">
            Acertlio Individual
          </p>
          <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
            Hola, {user.profile.full_name?.split(" ")[0] ?? "alumno"}
          </h1>
          <p className="text-sm text-muted mt-2">
            {level ? (
              <>
                Preparación para el nivel{" "}
                <strong className="text-navy">{level}</strong>. Practica cuando
                quieras.
              </>
            ) : (
              "Bienvenido a Acertlio."
            )}
          </p>
        </header>

        {showPremiumToast && <ActivationWelcomeToast />}
        <TrialBanner status={status} />

        <section>
          <h2 className="text-sm font-medium text-ink mb-4 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-saffron" />
            Simulacros disponibles
            <span className="text-xs font-normal text-muted">
              ({mocks.length})
            </span>
          </h2>
          <IndividualMocksList
            mocks={mocks}
            canStartNew={canStartNew}
            daysLeftInTrial={status.days_left_in_trial}
          />
        </section>
      </div>
    );
  }

  // ────── FLUJO ACADEMIA (sin cambios) ──────
  const assignments = await loadStudentAssignments(user.id);
  const active = assignments.filter(
    (a) =>
      a.status === "pending" ||
      a.status === "in_progress" ||
      a.status === "overdue"
  );
  const completed = assignments
    .filter((a) => a.status === "completed")
    .slice(0, 3);

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

      {active.length === 0 && completed.length === 0 ? (
        <EmptyStateAcademy />
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
      )}
    </div>
  );
}

function EmptyStateAcademy() {
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
  const cta = isCompleted ? "Ver resultado" : isInProgress ? "Continuar" : "Empezar";
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
          <p className="text-base font-medium text-ink">{assignment.exam_title}</p>
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
