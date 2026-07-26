import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Normaliza una respuesta de texto para comparación tolerante:
 * - Case-insensitive
 * - Trim whitespace
 * - Normaliza apóstrofos rectos y curvos a apóstrofo recto simple
 * - Colapsa espacios múltiples
 */
export function normalizeAnswer(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/\s+/g, " ");
}

/**
 * Compara una respuesta de texto con la respuesta correcta.
 * `correctAnswer` puede tener alternativas separadas por pipe: "in|at"
 * significa que "in" o "at" son ambas válidas.
 */
export function isTextAnswerCorrect(
  userAnswer: string | null | undefined,
  correctAnswer: string | null | undefined
): boolean {
  if (!correctAnswer) return false;
  const normalizedUser = normalizeAnswer(userAnswer);
  if (!normalizedUser) return false;
  const alternatives = correctAnswer.split("|").map(normalizeAnswer);
  return alternatives.includes(normalizedUser);
}


export interface AutogradeResult {
  raw_score: number;
  max_score: number;
  correct_count: number;
  total_count: number;
  writing_pending: number;
}


/**
 * Autocorrige un paper_attempt.
 *
 * Recorre todas las preguntas del paper (a través de las parts) y compara
 * las respuestas del alumno con la solución. Actualiza raw_score y max_score
 * en el paper_attempt.
 *
 * Las preguntas de Writing (writing_task) se saltan y se cuentan aparte.
 * Serán corregidas por el profesor a mano después.
 */
export async function autogradePaperAttempt(
  paperAttemptId: string
): Promise<AutogradeResult | null> {
  const admin = createAdminClient();

  // 1. Traer el paper_attempt
  const { data: paperAttempt } = await admin
    .from("paper_attempts")
    .select("id, paper_id")
    .eq("id", paperAttemptId)
    .maybeSingle();

  if (!paperAttempt) return null;

  // 2. Traer todas las parts del paper
  const { data: parts } = await admin
    .from("exam_parts")
    .select("id")
    .eq("paper_id", paperAttempt.paper_id);

  if (!parts || parts.length === 0) {
    return { raw_score: 0, max_score: 0, correct_count: 0, total_count: 0, writing_pending: 0 };
  }

  const partIds = parts.map((p) => p.id);

  // 3. Traer todas las preguntas del paper
  const { data: questions } = await admin
    .from("questions")
    .select("id, question_type, correct_answer, points")
    .in("part_id", partIds);

  if (!questions || questions.length === 0) {
    return { raw_score: 0, max_score: 0, correct_count: 0, total_count: 0, writing_pending: 0 };
  }

  // 4. Traer todas las options con is_correct para preguntas con opciones
  const questionIds = questions.map((q) => q.id);
  const { data: options } = await admin
    .from("question_options")
    .select("id, question_id, letter, is_correct")
    .in("question_id", questionIds);

  // Mapa: question_id → option_id correcta (si tiene opciones en BD)
  const correctOptionByQuestion = new Map<string, string>();
  (options ?? []).forEach((o) => {
    if (o.is_correct) correctOptionByQuestion.set(o.question_id, o.id);
  });

  // 5. Traer todas las respuestas del alumno para este paper_attempt
  const { data: answers } = await admin
    .from("answers")
    .select("question_id, selected_option_id, answer_text")
    .eq("paper_attempt_id", paperAttemptId);

  const answerByQuestion = new Map<
    string,
    { selected_option_id: string | null; answer_text: string | null }
  >();
  (answers ?? []).forEach((a) => {
    answerByQuestion.set(a.question_id, {
      selected_option_id: a.selected_option_id,
      answer_text: a.answer_text,
    });
  });

  // 6. Calcular puntuación
  let rawScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let totalCount = 0;
  let writingPending = 0;

  for (const q of questions) {
    // Skip writing (se corrige a mano)
    if (q.question_type === "writing_task") {
      writingPending += 1;
      // Los points del writing task se suman al max pero no al raw hasta que
      // el profesor los corrija manualmente. Los guardamos aparte para saberlo.
      continue;
    }

    const points = Number(q.points ?? 1);
    maxScore += points;
    totalCount += 1;

    const userAnswer = answerByQuestion.get(q.id);
    if (!userAnswer) continue;

    let isCorrect = false;
    const correctOptionId = correctOptionByQuestion.get(q.id);

    if (correctOptionId) {
      // Pregunta con opciones en BD (MC A/B/C, MC A/B/C/D, MC Cloze)
      isCorrect = userAnswer.selected_option_id === correctOptionId;
    } else {
      // Pregunta sin opciones en BD:
      //   - Matching / gapped: correct_answer es una letra (A, B, C...)
      //   - Open cloze: correct_answer es texto con alternativas (a|b)
      isCorrect = isTextAnswerCorrect(userAnswer.answer_text, q.correct_answer);
    }

    if (isCorrect) {
      rawScore += points;
      correctCount += 1;
    }
  }

  // 7. Guardar en paper_attempt
  await admin
    .from("paper_attempts")
    .update({
      raw_score: rawScore,
      max_score: maxScore,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paperAttemptId);

  return {
    raw_score: rawScore,
    max_score: maxScore,
    correct_count: correctCount,
    total_count: totalCount,
    writing_pending: writingPending,
  };
}
