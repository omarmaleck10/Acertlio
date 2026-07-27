import { createAdminClient } from "@/lib/supabase/admin";

// ─── Tipos ──────────────────────────────────────────────────────────

export interface StudentRow {
  student_id: string;
  full_name: string;
  email: string;
  level: string | null;
  mocks_completed: number;
  average_score_pct: number | null;
  last_activity_at: string | null;
  days_inactive: number | null;
  attention_flag: "low_score" | "inactive" | null;
}

export interface TeacherOverviewKPIs {
  total_students: number;
  active_last_7d: number;
  mocks_completed_last_7d: number;
  class_average_pct: number | null;
  attention_count: number;
}

export interface TeacherStats {
  kpis: TeacherOverviewKPIs;
  students: StudentRow[];
  attention_low_score: StudentRow[]; // nota media < 50
  attention_inactive: StudentRow[]; // >14 días sin actividad
  top_students: StudentRow[]; // top 3 por nota media
}


// ─── Constantes ─────────────────────────────────────────────────────

const LOW_SCORE_THRESHOLD = 50;
const INACTIVE_DAYS_THRESHOLD = 14;
const TOP_COUNT = 3;


// ─── Loader principal ────────────────────────────────────────────────

/**
 * Devuelve todas las stats del profesor (o admin de academia).
 *
 * Reglas:
 *   - teacher: solo ve sus alumnos (teacher_students)
 *   - academy_admin: ve todos los alumnos de su academia
 */
export async function loadTeacherStats(params: {
  teacherId: string;
  academyId: string;
  isAdmin: boolean;
}): Promise<TeacherStats> {
  const admin = createAdminClient();
  const { teacherId, academyId, isAdmin } = params;

  // ─── 1. Determinar qué alumnos ve ─────────────────────────────
  let studentIds: string[] = [];
  if (isAdmin) {
    const { data: allStudents } = await admin
      .from("profiles")
      .select("id")
      .eq("academy_id", academyId)
      .eq("role", "student");
    studentIds = (allStudents ?? []).map((s) => s.id);
  } else {
    const { data: myStudents } = await admin
      .from("teacher_students")
      .select("student_id")
      .eq("teacher_id", teacherId);
    studentIds = (myStudents ?? []).map((r) => r.student_id);
  }

  if (studentIds.length === 0) {
    return {
      kpis: {
        total_students: 0,
        active_last_7d: 0,
        mocks_completed_last_7d: 0,
        class_average_pct: null,
        attention_count: 0,
      },
      students: [],
      attention_low_score: [],
      attention_inactive: [],
      top_students: [],
    };
  }

  // ─── 2. Cargar perfiles ─────────────────────────────────────
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email, current_level, level")
    .in("id", studentIds);

  const profileById = new Map<
    string,
    { name: string; email: string; level: string | null }
  >();
  (profiles ?? []).forEach((p) => {
    const lvl =
      (p as unknown as Record<string, unknown>).current_level ??
      (p as unknown as Record<string, unknown>).level;
    profileById.set(p.id, {
      name: p.full_name ?? "—",
      email: p.email ?? "",
      level: (lvl as string | null) ?? null,
    });
  });

  // ─── 3. Cargar attempts de esos alumnos ─────────────────────
  const { data: attempts } = await admin
    .from("attempts")
    .select("id, student_id, exam_id, submitted_at, updated_at, started_at")
    .in("student_id", studentIds);

  const attemptsList = attempts ?? [];
  const attemptIds = attemptsList.map((a) => a.id);
  const examIds = Array.from(new Set(attemptsList.map((a) => a.exam_id)));

  // ─── 4. Paper_attempts para determinar "completado" y notas ──
  const { data: paperAttempts } = attemptIds.length
    ? await admin
        .from("paper_attempts")
        .select(
          "attempt_id, paper_id, status, raw_score, max_score, completed_at, last_active_at"
        )
        .in("attempt_id", attemptIds)
    : { data: [] };

  // ─── 5. Papers publicados por examen ────────────────────────
  const { data: publishedPapers } = examIds.length
    ? await admin
        .from("exam_papers")
        .select("id, exam_id, is_available")
        .in("exam_id", examIds)
    : { data: [] };

  const publishedByExam = new Map<string, string[]>();
  (publishedPapers ?? []).forEach((p) => {
    if (!p.is_available) return;
    const arr = publishedByExam.get(p.exam_id) ?? [];
    arr.push(p.id);
    publishedByExam.set(p.exam_id, arr);
  });

  // ─── 6. Calcular por alumno ─────────────────────────────────
  const completedPapersByAttempt = new Map<string, Set<string>>();
  const scoresByAttempt = new Map<
    string,
    { raw: number; max: number }
  >();
  const lastActivityByAttempt = new Map<string, string>();

  (paperAttempts ?? []).forEach((pa) => {
    if (pa.status === "completed" || pa.status === "time_expired") {
      const set =
        completedPapersByAttempt.get(pa.attempt_id) ?? new Set<string>();
      set.add(pa.paper_id);
      completedPapersByAttempt.set(pa.attempt_id, set);

      if (pa.raw_score !== null && pa.max_score !== null) {
        const rec = scoresByAttempt.get(pa.attempt_id) ?? { raw: 0, max: 0 };
        rec.raw += Number(pa.raw_score);
        rec.max += Number(pa.max_score);
        scoresByAttempt.set(pa.attempt_id, rec);
      }
    }
    // Registrar última actividad de cualquier paper_attempt
    const lastAct = pa.last_active_at ?? pa.completed_at;
    if (lastAct) {
      const prev = lastActivityByAttempt.get(pa.attempt_id);
      if (!prev || new Date(lastAct) > new Date(prev)) {
        lastActivityByAttempt.set(pa.attempt_id, lastAct);
      }
    }
  });

  // Agregar por alumno
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  let mocksCompletedLast7d = 0;
  const activeStudentsLast7d = new Set<string>();

  const perStudent = new Map<
    string,
    {
      completed_count: number;
      score_pcts: number[];
      last_activity: string | null;
    }
  >();

  studentIds.forEach((sid) =>
    perStudent.set(sid, {
      completed_count: 0,
      score_pcts: [],
      last_activity: null,
    })
  );

  attemptsList.forEach((a) => {
    const totalPapers = publishedByExam.get(a.exam_id)?.length ?? 0;
    const donePapers = completedPapersByAttempt.get(a.id)?.size ?? 0;
    const isCompleted = totalPapers > 0 && donePapers >= totalPapers;

    const rec = perStudent.get(a.student_id);
    if (!rec) return;

    if (isCompleted) {
      rec.completed_count += 1;
      const scores = scoresByAttempt.get(a.id);
      if (scores && scores.max > 0) {
        rec.score_pcts.push((scores.raw / scores.max) * 100);
      }
      // Contar para KPI de "última semana"
      if (a.submitted_at) {
        const submittedTime = new Date(a.submitted_at).getTime();
        if (submittedTime >= sevenDaysAgo) mocksCompletedLast7d += 1;
      }
    }

    // Última actividad (usa submitted_at, updated_at o last_active_at del paper)
    const paperLastAct = lastActivityByAttempt.get(a.id);
    const candidates = [
      a.submitted_at,
      a.updated_at,
      a.started_at,
      paperLastAct,
    ].filter((x): x is string => Boolean(x));

    candidates.forEach((iso) => {
      if (!rec.last_activity || new Date(iso) > new Date(rec.last_activity)) {
        rec.last_activity = iso;
      }
    });

    // Activo última semana
    if (rec.last_activity) {
      const t = new Date(rec.last_activity).getTime();
      if (t >= sevenDaysAgo) activeStudentsLast7d.add(a.student_id);
    }
  });

  // ─── 7. Construir StudentRow[] ──────────────────────────────
  const students: StudentRow[] = studentIds.map((sid) => {
    const p = profileById.get(sid);
    const rec = perStudent.get(sid)!;

    const avgPct =
      rec.score_pcts.length > 0
        ? Math.round(
            rec.score_pcts.reduce((s, x) => s + x, 0) / rec.score_pcts.length
          )
        : null;

    const daysInactive = rec.last_activity
      ? Math.floor(
          (now - new Date(rec.last_activity).getTime()) / (24 * 60 * 60 * 1000)
        )
      : null;

    // Attention flag
    let flag: "low_score" | "inactive" | null = null;
    if (avgPct !== null && avgPct < LOW_SCORE_THRESHOLD) {
      flag = "low_score";
    } else if (
      daysInactive !== null &&
      daysInactive > INACTIVE_DAYS_THRESHOLD
    ) {
      flag = "inactive";
    } else if (rec.completed_count === 0 && daysInactive === null) {
      // Alumno que nunca ha empezado nada — no lo flageamos como inactivo,
      // simplemente aparece sin datos
      flag = null;
    }

    return {
      student_id: sid,
      full_name: p?.name ?? "—",
      email: p?.email ?? "",
      level: p?.level ?? null,
      mocks_completed: rec.completed_count,
      average_score_pct: avgPct,
      last_activity_at: rec.last_activity,
      days_inactive: daysInactive,
      attention_flag: flag,
    };
  });

  // ─── 8. Secciones derivadas ─────────────────────────────────
  const attention_low_score = students
    .filter((s) => s.attention_flag === "low_score")
    .sort(
      (a, b) => (a.average_score_pct ?? 0) - (b.average_score_pct ?? 0)
    );

  const attention_inactive = students
    .filter((s) => s.attention_flag === "inactive")
    .sort((a, b) => (b.days_inactive ?? 0) - (a.days_inactive ?? 0));

  const top_students = [...students]
    .filter((s) => s.average_score_pct !== null && s.mocks_completed >= 1)
    .sort(
      (a, b) => (b.average_score_pct ?? 0) - (a.average_score_pct ?? 0)
    )
    .slice(0, TOP_COUNT);

  // ─── 9. KPIs ────────────────────────────────────────────────
  const allAvgs = students
    .map((s) => s.average_score_pct)
    .filter((x): x is number => x !== null);

  const classAveragePct =
    allAvgs.length > 0
      ? Math.round(allAvgs.reduce((s, x) => s + x, 0) / allAvgs.length)
      : null;

  const attention_count =
    attention_low_score.length + attention_inactive.length;

  const kpis: TeacherOverviewKPIs = {
    total_students: studentIds.length,
    active_last_7d: activeStudentsLast7d.size,
    mocks_completed_last_7d: mocksCompletedLast7d,
    class_average_pct: classAveragePct,
    attention_count,
  };

  return {
    kpis,
    students,
    attention_low_score,
    attention_inactive,
    top_students,
  };
}


// ─── Helpers de formato ─────────────────────────────────────────────

export function formatLastActivity(iso: string | null): string {
  if (!iso) return "Sin actividad";
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)
  );
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem`;
  return `Hace ${Math.floor(days / 30)} m`;
}
