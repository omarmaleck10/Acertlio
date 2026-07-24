import { createAdminClient } from "@/lib/supabase/admin";
import type { CambridgeLevel } from "@/lib/supabase/types";

/**
 * Recalcula el score total de un intento combinando:
 *   50% Reading/UoE  +  50% Writing
 *
 * Debe llamarse:
 *  - Al enviar el examen (después del auto-correcto de Reading)
 *  - Cada vez que el profesor guarda o actualiza una corrección de Writing
 *
 * Actualiza:
 *  - attempts.raw_score
 *  - attempts.cambridge_score
 *  - attempts.estimated_grade
 *  - attempts.status → 'fully_graded' si todos los writings están corregidos
 */

const SCALE_RANGES: Record<CambridgeLevel, { floor: number; pass: number; top: number }> = {
  A2: { floor: 100, pass: 120, top: 150 },
  B1: { floor: 120, pass: 140, top: 170 },
  B2: { floor: 140, pass: 160, top: 190 },
  C1: { floor: 160, pass: 180, top: 210 },
  C2: { floor: 180, pass: 200, top: 230 },
};

function toCambridgeScore(level: CambridgeLevel, percentage: number): number {
  const range = SCALE_RANGES[level];
  const clamped = Math.max(0, Math.min(100, percentage));
  if (clamped <= 60) {
    return Math.round(range.floor + (range.pass - range.floor) * (clamped / 60));
  }
  return Math.round(range.pass + (range.top - range.pass) * ((clamped - 60) / 40));
}

function toEstimatedGrade(percentage: number): string {
  if (percentage >= 80) return "Distinction";
  if (percentage >= 65) return "Merit";
  if (percentage >= 50) return "Pass";
  return "Fail";
}

export interface RecalcResult {
  readingPercentage: number;
  writingPercentage: number | null; // null si no hay writings todavía corregidos
  combinedPercentage: number;
  rawScore: number;
  maxRawScore: number;
  cambridgeScore: number;
  estimatedGrade: string;
  writingsCorrected: number;
  writingsTotal: number;
  allWritingsCorrected: boolean;
  newStatus: "in_progress" | "submitted" | "auto_graded" | "fully_graded";
}

/**
 * Recalcula y actualiza el intento.
 */
export async function recalculateAttemptScore(
  attemptId: string
): Promise<RecalcResult | null> {
  const admin = createAdminClient();

  // Cargar attempt + exam
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, status, exam_id, exams(id, level)")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) return null;

  const examData = Array.isArray(attempt.exams) ? attempt.exams[0] : attempt.exams;
  const level = examData?.level as CambridgeLevel;
  if (!level) return null;

  // 1. Puntos de Reading/UoE (todo lo que no sea writing_task)
  const { data: readingAnswers } = await admin
    .from("answers")
    .select("points_earned, questions!inner(question_type)")
    .eq("attempt_id", attemptId)
    .neq("questions.question_type", "writing_task");

  // Total de preguntas de Reading (para el máximo)
  const { data: readingQuestions } = await admin
    .from("questions")
    .select("id, points, part_id, exam_parts!inner(exam_id)")
    .eq("exam_parts.exam_id", attempt.exam_id)
    .neq("question_type", "writing_task");

  let readingPointsEarned = 0;
  for (const a of readingAnswers ?? []) {
    readingPointsEarned += Number(a.points_earned ?? 0);
  }
  let readingMaxPoints = 0;
  for (const q of readingQuestions ?? []) {
    readingMaxPoints += Number(q.points ?? 1);
  }

  const readingPercentage =
    readingMaxPoints > 0 ? (readingPointsEarned / readingMaxPoints) * 100 : 0;

  // 2. Puntos de Writing (from writing_corrections)
  const { data: writingQuestions } = await admin
    .from("questions")
    .select("id, part_id, exam_parts!inner(exam_id)")
    .eq("exam_parts.exam_id", attempt.exam_id)
    .eq("question_type", "writing_task");

  const writingQuestionIds = (writingQuestions ?? []).map((q) => q.id);

  const { data: corrections } = writingQuestionIds.length
    ? await admin
        .from("writing_corrections")
        .select("question_id, total_score, status")
        .eq("attempt_id", attemptId)
        .eq("status", "completed")
        .in("question_id", writingQuestionIds)
    : { data: [] };

  const writingsTotal = writingQuestionIds.length;
  const writingsCorrected = (corrections ?? []).length;
  const allWritingsCorrected =
    writingsTotal > 0 && writingsCorrected === writingsTotal;

  let writingPercentage: number | null = null;
  if (writingsCorrected > 0) {
    const writingPointsEarned = (corrections ?? []).reduce(
      (sum, c) => sum + Number(c.total_score ?? 0),
      0
    );
    const writingMaxPoints = writingsTotal * 20; // 20 puntos por task
    // Si aún no están todos corregidos, escalamos solo sobre los corregidos
    // para dar una aproximación temprana (opcional). Aquí uso el máximo real.
    writingPercentage =
      writingsCorrected > 0
        ? (writingPointsEarned / (writingsCorrected * 20)) * 100
        : null;
  }

  // 3. Score combinado
  // Si no hay writings todavía, solo cuenta Reading.
  // Si hay writings pero no todos corregidos, mostramos ya la corrección parcial ponderada.
  let combinedPercentage: number;
  if (writingsTotal === 0) {
    combinedPercentage = readingPercentage;
  } else if (writingPercentage === null) {
    // No hay writings corregidos → solo Reading determina la nota provisional
    combinedPercentage = readingPercentage;
  } else if (allWritingsCorrected) {
    combinedPercentage = 0.5 * readingPercentage + 0.5 * writingPercentage;
  } else {
    // Corrección parcial: ponderamos proporcionalmente los writings corregidos
    const writingWeight = 0.5 * (writingsCorrected / writingsTotal);
    const readingWeight = 1 - writingWeight;
    combinedPercentage =
      readingWeight * readingPercentage + writingWeight * writingPercentage;
  }

  const rawScore = Math.round(readingPointsEarned + (writingPercentage !== null
    ? (writingPercentage / 100) * writingsCorrected * 20
    : 0));
  const maxRawScore = readingMaxPoints + writingsTotal * 20;
  const cambridgeScore = toCambridgeScore(level, combinedPercentage);
  const estimatedGrade = toEstimatedGrade(combinedPercentage);

  // 4. Determinar nuevo status
  let newStatus: RecalcResult["newStatus"] = attempt.status as RecalcResult["newStatus"];
  if (writingsTotal === 0) {
    // Sin writings: pasa a auto_graded al completarse
    if (newStatus === "submitted") newStatus = "auto_graded";
  } else if (allWritingsCorrected) {
    newStatus = "fully_graded";
  }
  // Si hay writings pero no todos corregidos, sigue en 'submitted' (writing pendiente)

  // 5. Actualizar attempts
  await admin
    .from("attempts")
    .update({
      raw_score: rawScore,
      cambridge_score: cambridgeScore,
      estimated_grade: estimatedGrade,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  return {
    readingPercentage,
    writingPercentage,
    combinedPercentage,
    rawScore,
    maxRawScore,
    cambridgeScore,
    estimatedGrade,
    writingsCorrected,
    writingsTotal,
    allWritingsCorrected,
    newStatus,
  };
}
