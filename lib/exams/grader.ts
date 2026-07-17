import { createAdminClient } from "@/lib/supabase/admin";
import type { CambridgeLevel, QuestionType } from "@/lib/supabase/types";

/**
 * Motor de autocorrección de un attempt.
 *
 * Recorre todas las respuestas del intento, las compara contra las correctas,
 * y guarda `is_correct` y `points_earned` en cada `answer`.
 * Después calcula raw_score, cambridge_score y estimated_grade,
 * y actualiza el `attempts` row.
 *
 * Las preguntas de tipo `writing_task` NO se corrigen aquí — se dejan en null
 * hasta que el profesor las corrija manualmente (Fase 4).
 */

// Tipos de pregunta que se corrigen automáticamente
const AUTO_GRADABLE_TYPES: QuestionType[] = [
  "multiple_choice",
  "multiple_choice_cloze",
  "open_cloze",
  "word_formation",
  "key_word_transformation",
  "multiple_matching",
  "cross_text_multiple_matching",
];

const MANUAL_GRADE_TYPES: QuestionType[] = ["writing_task"];

export interface GradeResult {
  attemptId: string;
  autoCorrectCount: number;
  autoGradableTotal: number;
  writingTasksPending: number;
  rawScore: number; // puntos ganados en las partes autocorregidas
  maxRawScore: number; // puntos máximos posibles (autocorregibles)
  autoPercentage: number; // % de aciertos en autocorregibles
  cambridgeScore: number;
  estimatedGrade: string;
  hasWritingPending: boolean;
  byPart: Array<{
    partId: string;
    partNumber: number;
    partTitle: string;
    skill: string;
    correct: number;
    total: number;
    hasWriting: boolean;
  }>;
}

// ─── Cambridge English Scale mapping ─────────────────────────────────
// Rangos oficiales aproximados: cada nivel tiene min-max, con "pass" en el punto medio-bajo.
const SCALE_RANGES: Record<CambridgeLevel, { floor: number; pass: number; top: number }> = {
  A2: { floor: 100, pass: 120, top: 150 },
  B1: { floor: 120, pass: 140, top: 170 },
  B2: { floor: 140, pass: 160, top: 190 },
  C1: { floor: 160, pass: 180, top: 210 },
  C2: { floor: 180, pass: 200, top: 230 },
};

/**
 * Convierte % de aciertos al Cambridge English Scale del nivel.
 * Aproximación lineal — el mapping oficial es más complejo pero para MVP funciona.
 *
 * - 0% → floor
 * - 60% → pass (nota mínima para aprobar)
 * - 100% → top
 */
function toCambridgeScore(level: CambridgeLevel, percentage: number): number {
  const range = SCALE_RANGES[level];
  const clamped = Math.max(0, Math.min(100, percentage));

  if (clamped <= 60) {
    // De 0% a 60% mapeamos linealmente de floor a pass
    return Math.round(range.floor + (range.pass - range.floor) * (clamped / 60));
  } else {
    // De 60% a 100% mapeamos linealmente de pass a top
    return Math.round(range.pass + (range.top - range.pass) * ((clamped - 60) / 40));
  }
}

/**
 * Devuelve el grade estimado según % de aciertos.
 * Grados oficiales de Cambridge:
 *  - A (Distinction): 80%+
 *  - B (Merit / Pass with merit): 65-79%
 *  - C (Pass): 50-64%
 *  - Fail (Level below): <50%
 *
 * Para A2 Key, en lugar de A/B/C se usa: Distinction / Merit / Pass
 * Para MVP los unifico en Pass/Merit/Distinction/Fail.
 */
function toEstimatedGrade(percentage: number): string {
  if (percentage >= 80) return "Distinction";
  if (percentage >= 65) return "Merit";
  if (percentage >= 50) return "Pass";
  return "Fail";
}

// ─── Normalización de respuestas de texto ────────────────────────────
/**
 * Normaliza una respuesta de texto para comparación:
 * - trim
 * - lowercase
 * - colapsa espacios múltiples a uno
 * - quita puntuación al final (. , ; :)
 */
function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/g, "")
    .trim();
}

/**
 * Compara respuesta de texto contra las variantes correctas.
 * Las variantes vienen separadas por `|` en `correct_answer` — ej: "will|can|could".
 */
function isTextAnswerCorrect(
  studentAnswer: string | null,
  correctAnswerRaw: string | null
): boolean {
  if (!studentAnswer || !correctAnswerRaw) return false;
  const normStudent = normalize(studentAnswer);
  if (!normStudent) return false;
  const variants = correctAnswerRaw
    .split("|")
    .map((v) => normalize(v))
    .filter(Boolean);
  return variants.includes(normStudent);
}

// ─── Función principal ───────────────────────────────────────────────
export async function gradeAttempt(attemptId: string): Promise<GradeResult | null> {
  const admin = createAdminClient();

  // 1. Cargar attempt + exam
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, exam_id, exams(id, level)")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) return null;

  const examData = Array.isArray(attempt.exams) ? attempt.exams[0] : attempt.exams;
  const level = examData?.level as CambridgeLevel;
  if (!level) return null;

  // 2. Cargar todas las partes, preguntas y opciones del examen
  const { data: parts } = await admin
    .from("exam_parts")
    .select("id, part_number, title, skill, order_index")
    .eq("exam_id", attempt.exam_id)
    .order("order_index", { ascending: true });

  if (!parts) return null;

  const partIds = parts.map((p) => p.id);

  const [{ data: questions }, { data: options }, { data: answers }] = await Promise.all([
    admin
      .from("questions")
      .select("id, part_id, question_type, correct_answer, points")
      .in("part_id", partIds),
    admin.from("question_options").select("id, question_id, letter, is_correct"),
    admin
      .from("answers")
      .select("id, question_id, answer_text, selected_option_id")
      .eq("attempt_id", attemptId),
  ]);

  if (!questions) return null;

  // Mapas útiles
  const optionsByQuestion = new Map<
    string,
    Array<{ id: string; letter: string; is_correct: boolean }>
  >();
  for (const o of options ?? []) {
    const arr = optionsByQuestion.get(o.question_id) ?? [];
    arr.push({ id: o.id, letter: o.letter, is_correct: o.is_correct });
    optionsByQuestion.set(o.question_id, arr);
  }

  const answersByQuestion = new Map<
    string,
    { id: string; answer_text: string | null; selected_option_id: string | null }
  >();
  for (const a of answers ?? []) {
    answersByQuestion.set(a.question_id, a);
  }

  const questionsByPart = new Map<string, typeof questions>();
  for (const q of questions) {
    const arr = questionsByPart.get(q.part_id) ?? [];
    arr.push(q);
    questionsByPart.set(q.part_id, arr);
  }

  // 3. Corregir pregunta a pregunta
  let autoCorrectCount = 0;
  let autoGradableTotal = 0;
  let writingTasksPending = 0;
  let rawScorePoints = 0;
  let maxRawScorePoints = 0;
  const byPart: GradeResult["byPart"] = [];

  for (const part of parts) {
    const partQuestions = questionsByPart.get(part.id) ?? [];
    let partCorrect = 0;
    let partTotal = 0;
    let partHasWriting = false;

    for (const q of partQuestions) {
      const qType = q.question_type as QuestionType;
      const answer = answersByQuestion.get(q.id);
      const points = q.points ?? 1;

      if (MANUAL_GRADE_TYPES.includes(qType)) {
        // Writing: se queda pendiente
        partHasWriting = true;
        writingTasksPending++;
        continue;
      }

      if (!AUTO_GRADABLE_TYPES.includes(qType)) {
        continue;
      }

      autoGradableTotal++;
      partTotal++;
      maxRawScorePoints += points;

      // Determinar si es correcta
      let isCorrect = false;

      if (qType === "multiple_choice" || qType === "multiple_choice_cloze") {
        // Comparamos por selected_option_id → verificar si esa opción tiene is_correct = true
        const opts = optionsByQuestion.get(q.id) ?? [];
        const correctOption = opts.find((o) => o.is_correct);
        if (answer?.selected_option_id && correctOption) {
          isCorrect = answer.selected_option_id === correctOption.id;
        }
      } else if (qType === "multiple_matching" || qType === "cross_text_multiple_matching") {
        // Comparar letra guardada en answer_text con correct_answer
        if (answer?.answer_text && q.correct_answer) {
          isCorrect =
            answer.answer_text.trim().toUpperCase() ===
            q.correct_answer.trim().toUpperCase();
        }
      } else {
        // open_cloze, word_formation, key_word_transformation
        isCorrect = isTextAnswerCorrect(answer?.answer_text ?? null, q.correct_answer);
      }

      const pointsEarned = isCorrect ? points : 0;
      if (isCorrect) {
        autoCorrectCount++;
        partCorrect++;
        rawScorePoints += pointsEarned;
      }

      // Guardar corrección en el answer (upsert por si no había respuesta)
      if (answer) {
        await admin
          .from("answers")
          .update({ is_correct: isCorrect, points_earned: pointsEarned })
          .eq("id", answer.id);
      } else {
        // Alumno no respondió esta pregunta → guardar answer con is_correct=false
        await admin.from("answers").insert({
          attempt_id: attemptId,
          question_id: q.id,
          is_correct: false,
          points_earned: 0,
        });
      }
    }

    byPart.push({
      partId: part.id,
      partNumber: part.part_number,
      partTitle: part.title,
      skill: part.skill,
      correct: partCorrect,
      total: partTotal,
      hasWriting: partHasWriting,
    });
  }

  // 4. Calcular métricas globales
  const autoPercentage =
    autoGradableTotal > 0
      ? Math.round((autoCorrectCount / autoGradableTotal) * 100)
      : 0;
  const cambridgeScore = toCambridgeScore(level, autoPercentage);
  const estimatedGrade = toEstimatedGrade(autoPercentage);
  const hasWritingPending = writingTasksPending > 0;

  // 5. Guardar en el attempt
  const newStatus = hasWritingPending ? "submitted" : "auto_graded";
  await admin
    .from("attempts")
    .update({
      status: newStatus,
      raw_score: rawScorePoints,
      cambridge_score: cambridgeScore,
      estimated_grade: estimatedGrade,
      updated_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  return {
    attemptId,
    autoCorrectCount,
    autoGradableTotal,
    writingTasksPending,
    rawScore: rawScorePoints,
    maxRawScore: maxRawScorePoints,
    autoPercentage,
    cambridgeScore,
    estimatedGrade,
    hasWritingPending,
    byPart,
  };
}
