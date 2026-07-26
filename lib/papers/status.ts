import { createAdminClient } from "@/lib/supabase/admin";

// ─── Tipos ────────────────────────────────────────────────────────────

export type PaperStatus =
  | "unavailable"     // el paper existe pero aún no está disponible (Listening)
  | "locked"          // requiere completar otro paper primero
  | "available"       // se puede empezar, nunca se ha empezado
  | "in_progress"     // hay un paper_attempt in_progress o paused
  | "completed";      // hay un paper_attempt completed o time_expired

export interface Paper {
  id: string;
  code: string;
  title: string;
  short_description: string | null;
  duration_minutes: number;
  order_index: number;
  unlocks_after_paper_id: string | null;
  is_available: boolean;
  unavailable_reason: string | null;
  instructions: string | null;
}

export interface PaperAttempt {
  id: string;
  paper_id: string;
  status: "not_started" | "confirmed" | "in_progress" | "paused" | "completed" | "time_expired";
  started_at: string | null;
  completed_at: string | null;
  time_remaining_seconds: number | null;
  raw_score: number | null;
  max_score: number | null;
  auto_closed: boolean;
}

export interface PaperWithStatus extends Paper {
  status: PaperStatus;
  attempt: PaperAttempt | null;
  answered_questions: number;
  total_questions: number;
  score_percentage: number | null;
  time_remaining_display: string | null; // "22:15"
}

export interface MockData {
  exam_id: string;
  exam_title: string;
  exam_level: string;
  mock_number: number | null;
  papers: PaperWithStatus[];
  attempt_id: string | null; // el attempt agrupador (o null si el alumno nunca entró)
  total_papers: number;
  completed_papers: number;
}


// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Devuelve "MM:SS" a partir de segundos.
 * Devuelve null si segundos es null o negativo.
 */
export function formatTimeRemaining(seconds: number | null): string | null {
  if (seconds == null || seconds < 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * A partir de un paper y su attempt, calcula el estado desde el punto de vista
 * del alumno. Considera también si el paper que lo desbloquea está completado.
 */
function computeStatus(
  paper: Paper,
  attempt: PaperAttempt | null,
  papersById: Map<string, { attempt: PaperAttempt | null }>
): PaperStatus {
  // No disponible tiene la prioridad más alta
  if (!paper.is_available) return "unavailable";

  // Si ya hay attempt terminado
  if (attempt?.status === "completed" || attempt?.status === "time_expired") {
    return "completed";
  }

  // Si hay attempt a mitad
  if (
    attempt?.status === "in_progress" ||
    attempt?.status === "paused" ||
    attempt?.status === "confirmed"
  ) {
    return "in_progress";
  }

  // Comprobar bloqueo por prerequisito
  if (paper.unlocks_after_paper_id) {
    const prereq = papersById.get(paper.unlocks_after_paper_id);
    const prereqCompleted =
      prereq?.attempt?.status === "completed" ||
      prereq?.attempt?.status === "time_expired";
    if (!prereqCompleted) return "locked";
  }

  return "available";
}


// ─── Función principal ────────────────────────────────────────────────

/**
 * Devuelve toda la información necesaria para renderizar la pantalla de
 * tarjetas de un mock para un alumno concreto.
 *
 * - Trae los papers del mock
 * - Trae los paper_attempts del alumno para ese mock (si existen)
 * - Trae el attempt agrupador (si existe)
 * - Calcula estados, progreso, tiempo restante, etc.
 */
export async function getMockDataForStudent(
  examId: string,
  studentId: string
): Promise<MockData | null> {
  const admin = createAdminClient();

  // 1. Traer el examen
  const { data: exam } = await admin
    .from("exams")
    .select("id, title, level, mock_number, is_published")
    .eq("id", examId)
    .eq("is_published", true)
    .maybeSingle();

  if (!exam) return null;

  // 2. Traer los papers del examen
  const { data: papers } = await admin
    .from("exam_papers")
    .select(
      "id, code, title, short_description, duration_minutes, order_index, unlocks_after_paper_id, is_available, unavailable_reason, instructions"
    )
    .eq("exam_id", examId)
    .order("order_index", { ascending: true });

  if (!papers || papers.length === 0) return null;

  // 3. Buscar el attempt agrupador del alumno (si existe)
  const { data: attempts } = await admin
    .from("attempts")
    .select("id, status")
    .eq("exam_id", examId)
    .eq("student_id", studentId)
    .order("started_at", { ascending: false })
    .limit(1);

  const attemptId = attempts?.[0]?.id ?? null;

  // 4. Traer los paper_attempts del alumno para este attempt (si hay attempt)
  let paperAttempts: PaperAttempt[] = [];
  if (attemptId) {
    const { data } = await admin
      .from("paper_attempts")
      .select(
        "id, paper_id, status, started_at, completed_at, time_remaining_seconds, raw_score, max_score, auto_closed"
      )
      .eq("attempt_id", attemptId);
    paperAttempts = data ?? [];
  }

  // Mapa: paper_id → paper_attempt
  const attemptsByPaperId = new Map<string, PaperAttempt>();
  paperAttempts.forEach((pa) => attemptsByPaperId.set(pa.paper_id, pa));

  // Mapa: paper_id → { attempt } (para calcular prerequisitos)
  const papersById = new Map<string, { attempt: PaperAttempt | null }>();
  papers.forEach((p) => {
    papersById.set(p.id, { attempt: attemptsByPaperId.get(p.id) ?? null });
  });

  // 5. Contar respuestas y preguntas por paper
  const paperIds = papers.map((p) => p.id);
  const { data: partsData } = await admin
    .from("exam_parts")
    .select("id, paper_id")
    .in("paper_id", paperIds);

  const partsByPaper = new Map<string, string[]>();
  (partsData ?? []).forEach((p) => {
    const arr = partsByPaper.get(p.paper_id) ?? [];
    arr.push(p.id);
    partsByPaper.set(p.paper_id, arr);
  });

  // Obtener total de preguntas por paper
  const allPartIds = (partsData ?? []).map((p) => p.id);
  let questionsByPart = new Map<string, number>();
  if (allPartIds.length > 0) {
    const { data: qData } = await admin
      .from("questions")
      .select("id, part_id")
      .in("part_id", allPartIds);
    (qData ?? []).forEach((q) => {
      questionsByPart.set(q.part_id, (questionsByPart.get(q.part_id) ?? 0) + 1);
    });
  }

  // Obtener respuestas del alumno (solo si tiene attempt)
  const answeredByPart = new Map<string, number>();
  if (attemptId && allPartIds.length > 0) {
    const { data: aData } = await admin
      .from("answers")
      .select("id, question_id")
      .eq("attempt_id", attemptId);

    if (aData && aData.length > 0) {
      // Necesito mapear question_id → part_id
      const answeredQuestionIds = aData.map((a) => a.question_id);
      const { data: qMap } = await admin
        .from("questions")
        .select("id, part_id")
        .in("id", answeredQuestionIds);
      (qMap ?? []).forEach((q) => {
        answeredByPart.set(q.part_id, (answeredByPart.get(q.part_id) ?? 0) + 1);
      });
    }
  }

  // 6. Construir el resultado
  const papersWithStatus: PaperWithStatus[] = papers.map((paper) => {
    const attempt = attemptsByPaperId.get(paper.id) ?? null;
    const status = computeStatus(paper, attempt, papersById);

    // Contar preguntas y respondidas para este paper
    const partIds = partsByPaper.get(paper.id) ?? [];
    let totalQuestions = 0;
    let answeredQuestions = 0;
    partIds.forEach((pid) => {
      totalQuestions += questionsByPart.get(pid) ?? 0;
      answeredQuestions += answeredByPart.get(pid) ?? 0;
    });

    const scorePct =
      attempt?.raw_score != null && attempt.max_score != null && attempt.max_score > 0
        ? Math.round((attempt.raw_score / attempt.max_score) * 100)
        : null;

    return {
      ...paper,
      status,
      attempt,
      answered_questions: answeredQuestions,
      total_questions: totalQuestions,
      score_percentage: scorePct,
      time_remaining_display: formatTimeRemaining(attempt?.time_remaining_seconds ?? null),
    };
  });

  const completedPapers = papersWithStatus.filter(
    (p) => p.status === "completed"
  ).length;

  return {
    exam_id: exam.id,
    exam_title: exam.title,
    exam_level: exam.level,
    mock_number: exam.mock_number,
    papers: papersWithStatus,
    attempt_id: attemptId,
    total_papers: papersWithStatus.filter((p) => p.is_available).length,
    completed_papers: completedPapers,
  };
}
