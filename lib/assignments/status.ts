import { createAdminClient } from "@/lib/supabase/admin";

// ─── Tipos ────────────────────────────────────────────────────────────

export type AssignmentDisplayStatus =
  | "pending"       // asignado, no empezado
  | "in_progress"   // el alumno lo empezó
  | "completed"     // el alumno lo terminó (todos los papers)
  | "overdue"       // due_date pasado, no completado
  | "cancelled";    // profesor lo canceló

export interface AssignmentSummary {
  id: string;
  exam_id: string;
  exam_title: string;
  exam_level: string;
  mock_number: number | null;
  student_id: string;
  student_name: string;
  student_email: string;
  assigned_by_id: string | null;
  assigned_by_name: string | null;
  due_date: string | null;
  status: AssignmentDisplayStatus;
  raw_status: string;      // el status guardado en BD
  attempt_id: string | null;
  progress_papers_done: number;
  progress_papers_total: number;
  overall_score_pct: number | null;
  created_at: string;
}


// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Devuelve el estado real de la asignación, considerando el due_date.
 * Prioridad:
 *   1. Si raw_status = 'cancelled' → cancelled
 *   2. Si raw_status = 'completed' → completed
 *   3. Si due_date < now() y no está completo → overdue
 *   4. Si tiene attempts → in_progress
 *   5. Si no → pending
 */
export function computeAssignmentStatus(
  rawStatus: string,
  dueDate: string | null,
  hasAttempt: boolean,
  isCompleted: boolean
): AssignmentDisplayStatus {
  if (rawStatus === "cancelled") return "cancelled";
  if (isCompleted) return "completed";
  if (dueDate && new Date(dueDate) < new Date() && !isCompleted) {
    return "overdue";
  }
  if (hasAttempt) return "in_progress";
  return "pending";
}


/**
 * Formatea la deadline de forma amigable en español.
 *   "Vence en 2 horas"
 *   "Vence el 3 de agosto"
 *   "Vencido hace 1 día"
 */
export function formatDueDate(iso: string | null): string {
  if (!iso) return "";
  const due = new Date(iso);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMs > 0) {
    // Futuro
    if (diffMin < 60) return `Vence en ${diffMin} minutos`;
    if (diffHours < 24) return `Vence en ${diffHours} horas`;
    if (diffDays === 1) return "Vence mañana";
    if (diffDays < 7) return `Vence en ${diffDays} días`;
    return `Vence el ${due.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })}`;
  } else {
    // Pasado (overdue)
    const absMin = Math.abs(diffMin);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    if (absMin < 60) return `Vencido hace ${absMin} minutos`;
    if (absHours < 24) return `Vencido hace ${absHours} horas`;
    if (absDays === 1) return "Vencido ayer";
    return `Vencido hace ${absDays} días`;
  }
}


/**
 * Devuelve el color asociado al estado (para clases Tailwind).
 */
export function statusColorClass(status: AssignmentDisplayStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case "pending":
      return {
        bg: "bg-navy/5",
        text: "text-navy",
        border: "border-navy/30",
        label: "Pendiente",
      };
    case "in_progress":
      return {
        bg: "bg-saffron/10",
        text: "text-saffron",
        border: "border-saffron/40",
        label: "En progreso",
      };
    case "completed":
      return {
        bg: "bg-ok/10",
        text: "text-ok",
        border: "border-ok/40",
        label: "Completado",
      };
    case "overdue":
      return {
        bg: "bg-error/10",
        text: "text-error",
        border: "border-error/40",
        label: "Vencido",
      };
    case "cancelled":
      return {
        bg: "bg-paper",
        text: "text-muted",
        border: "border-rule",
        label: "Cancelado",
      };
  }
}


// ─── Loaders server-side ──────────────────────────────────────────────

/**
 * Devuelve las asignaciones de un alumno con toda la info necesaria
 * para renderizar el dashboard.
 */
export async function loadStudentAssignments(
  studentId: string
): Promise<AssignmentSummary[]> {
  const admin = createAdminClient();

  const { data: assignments } = await admin
    .from("assignments")
    .select(
      `id, exam_id, student_id, assigned_by, due_date, status, created_at,
       exam:exams(id, title, level, mock_number, is_published)`
    )
    .eq("student_id", studentId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!assignments || assignments.length === 0) return [];

  // Obtener nombres de los profesores
  const assignedByIds = assignments
    .map((a) => a.assigned_by)
    .filter((id): id is string => Boolean(id));
  const uniqueByIds = Array.from(new Set(assignedByIds));

  const assignedByMap = new Map<string, { name: string }>();
  if (uniqueByIds.length > 0) {
    const { data: profs } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", uniqueByIds);
    (profs ?? []).forEach((p) => assignedByMap.set(p.id, { name: p.full_name }));
  }

  // Datos del alumno
  const { data: student } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", studentId)
    .maybeSingle();

  // Attempts del alumno para calcular progreso
  const examIds = assignments
    .map((a) => {
      const exam = a.exam as unknown;
      return Array.isArray(exam) ? (exam[0] as { id?: string })?.id : (exam as { id?: string })?.id;
    })
    .filter((id): id is string => Boolean(id));

  const { data: attempts } = await admin
    .from("attempts")
    .select("id, exam_id, assignment_id, status")
    .eq("student_id", studentId)
    .in("exam_id", examIds);

  const attemptByAssignment = new Map<string, { id: string; status: string }>();
  const attemptByExam = new Map<string, { id: string; status: string }>();
  (attempts ?? []).forEach((a) => {
    if (a.assignment_id) attemptByAssignment.set(a.assignment_id, { id: a.id, status: a.status });
    attemptByExam.set(a.exam_id, { id: a.id, status: a.status });
  });

  // Papers de cada examen
  const { data: papers } = await admin
    .from("exam_papers")
    .select("id, exam_id, is_available")
    .in("exam_id", examIds);

  const papersByExam = new Map<string, string[]>();
  (papers ?? []).forEach((p) => {
    if (!p.is_available) return;
    const arr = papersByExam.get(p.exam_id) ?? [];
    arr.push(p.id);
    papersByExam.set(p.exam_id, arr);
  });

  // Paper attempts completados del alumno
  const paperIds = (papers ?? []).map((p) => p.id);
  const { data: paperAttempts } = await admin
    .from("paper_attempts")
    .select("paper_id, status, attempt_id")
    .in("paper_id", paperIds)
    .eq("student_id", studentId);

  const completedPapersByAttempt = new Map<string, Set<string>>();
  (paperAttempts ?? []).forEach((pa) => {
    if (pa.status === "completed" || pa.status === "time_expired") {
      const set = completedPapersByAttempt.get(pa.attempt_id) ?? new Set<string>();
      set.add(pa.paper_id);
      completedPapersByAttempt.set(pa.attempt_id, set);
    }
  });

  // Ensamblar resultado
  const result: AssignmentSummary[] = assignments.map((a) => {
    const examRaw = a.exam as unknown;
    const exam = (Array.isArray(examRaw) ? examRaw[0] : examRaw) as
      | { id: string; title: string; level: string; mock_number: number | null }
      | null;
    const attempt =
      attemptByAssignment.get(a.id) ?? (exam ? attemptByExam.get(exam.id) : undefined);
    const totalPapers = exam ? (papersByExam.get(exam.id)?.length ?? 0) : 0;
    const donePapers = attempt ? completedPapersByAttempt.get(attempt.id)?.size ?? 0 : 0;
    const isCompleted = totalPapers > 0 && donePapers >= totalPapers;

    const displayStatus = computeAssignmentStatus(
      a.status,
      a.due_date,
      Boolean(attempt),
      isCompleted
    );

    return {
      id: a.id,
      exam_id: exam?.id ?? "",
      exam_title: exam?.title ?? "—",
      exam_level: exam?.level ?? "",
      mock_number: exam?.mock_number ?? null,
      student_id: studentId,
      student_name: student?.full_name ?? "—",
      student_email: student?.email ?? "",
      assigned_by_id: a.assigned_by,
      assigned_by_name: a.assigned_by
        ? assignedByMap.get(a.assigned_by)?.name ?? null
        : null,
      due_date: a.due_date,
      status: displayStatus,
      raw_status: a.status,
      attempt_id: attempt?.id ?? null,
      progress_papers_done: donePapers,
      progress_papers_total: totalPapers,
      overall_score_pct: null,
      created_at: a.created_at,
    };
  });

  return result;
}


/**
 * Devuelve las asignaciones creadas por un profesor (o todas las de la
 * academia si es admin), con datos agregados por alumno.
 */
export async function loadTeacherAssignments(
  teacherId: string,
  academyId: string,
  onlyMine: boolean
): Promise<AssignmentSummary[]> {
  const admin = createAdminClient();

  let query = admin
    .from("assignments")
    .select(
      `id, exam_id, student_id, assigned_by, due_date, status, created_at,
       exam:exams(id, title, level, mock_number)`
    )
    .eq("academy_id", academyId);

  if (onlyMine) query = query.eq("assigned_by", teacherId);

  const { data: assignments } = await query
    .order("created_at", { ascending: false })
    .limit(100);

  if (!assignments || assignments.length === 0) return [];

  // Datos de los alumnos
  const studentIds = Array.from(new Set(assignments.map((a) => a.student_id)));
  const { data: students } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", studentIds);
  const studentMap = new Map<string, { name: string; email: string }>();
  (students ?? []).forEach((s) =>
    studentMap.set(s.id, { name: s.full_name, email: s.email })
  );

  // Datos de los profesores que asignaron
  const teacherIds = Array.from(
    new Set(assignments.map((a) => a.assigned_by).filter(Boolean) as string[])
  );
  const { data: teachers } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", teacherIds);
  const teacherMap = new Map<string, string>();
  (teachers ?? []).forEach((t) => teacherMap.set(t.id, t.full_name));

  // Attempts para saber estado
  const { data: attempts } = await admin
    .from("attempts")
    .select("id, exam_id, assignment_id, student_id, status")
    .in("student_id", studentIds);

  const attemptByAssignment = new Map<string, { id: string; status: string }>();
  (attempts ?? []).forEach((at) => {
    if (at.assignment_id) attemptByAssignment.set(at.assignment_id, { id: at.id, status: at.status });
  });

  // Papers por examen (cache)
  const examIds = Array.from(
    new Set(
      assignments
        .map((a) => {
          const examRaw = a.exam as unknown;
          const ex = Array.isArray(examRaw) ? examRaw[0] : examRaw;
          return (ex as { id?: string })?.id;
        })
        .filter((id): id is string => Boolean(id))
    )
  );
  const { data: papers } = await admin
    .from("exam_papers")
    .select("id, exam_id, is_available")
    .in("exam_id", examIds);
  const papersByExam = new Map<string, string[]>();
  (papers ?? []).forEach((p) => {
    if (!p.is_available) return;
    const arr = papersByExam.get(p.exam_id) ?? [];
    arr.push(p.id);
    papersByExam.set(p.exam_id, arr);
  });

  // Paper attempts completados
  const paperIds = (papers ?? []).map((p) => p.id);
  const { data: paperAttempts } = await admin
    .from("paper_attempts")
    .select("paper_id, status, attempt_id")
    .in("paper_id", paperIds);
  const completedPapersByAttempt = new Map<string, Set<string>>();
  (paperAttempts ?? []).forEach((pa) => {
    if (pa.status === "completed" || pa.status === "time_expired") {
      const set = completedPapersByAttempt.get(pa.attempt_id) ?? new Set<string>();
      set.add(pa.paper_id);
      completedPapersByAttempt.set(pa.attempt_id, set);
    }
  });

  const result: AssignmentSummary[] = assignments.map((a) => {
    const examRaw = a.exam as unknown;
    const exam = (Array.isArray(examRaw) ? examRaw[0] : examRaw) as
      | { id: string; title: string; level: string; mock_number: number | null }
      | null;
    const student = studentMap.get(a.student_id);
    const attempt = attemptByAssignment.get(a.id);
    const totalPapers = exam ? papersByExam.get(exam.id)?.length ?? 0 : 0;
    const donePapers = attempt
      ? completedPapersByAttempt.get(attempt.id)?.size ?? 0
      : 0;
    const isCompleted = totalPapers > 0 && donePapers >= totalPapers;

    const displayStatus = computeAssignmentStatus(
      a.status,
      a.due_date,
      Boolean(attempt),
      isCompleted
    );

    return {
      id: a.id,
      exam_id: exam?.id ?? "",
      exam_title: exam?.title ?? "—",
      exam_level: exam?.level ?? "",
      mock_number: exam?.mock_number ?? null,
      student_id: a.student_id,
      student_name: student?.name ?? "—",
      student_email: student?.email ?? "",
      assigned_by_id: a.assigned_by,
      assigned_by_name: a.assigned_by ? teacherMap.get(a.assigned_by) ?? null : null,
      due_date: a.due_date,
      status: displayStatus,
      raw_status: a.status,
      attempt_id: attempt?.id ?? null,
      progress_papers_done: donePapers,
      progress_papers_total: totalPapers,
      overall_score_pct: null,
      created_at: a.created_at,
    };
  });

  return result;
}
