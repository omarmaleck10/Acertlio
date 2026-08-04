import { createAdminClient } from "@/lib/supabase/admin";
import { correctWritingWithAI } from "./writing-correction";

/**
 * Busca todos los writings de un attempt y dispara la corrección IA
 * para cada uno. Se llama al completar un intento de un alumno individual.
 *
 * Es idempotente: si ya existe una corrección (writing_corrections)
 * con corrected_by_ai=true o corrected_by=humano, se salta esa writing.
 */
export async function triggerAICorrectionsForAttempt(
  attemptId: string
): Promise<{
  corrected: number;
  skipped: number;
  errors: number;
  lastError?: string;
}> {
  const admin = createAdminClient();

  let corrected = 0;
  let skipped = 0;
  let errors = 0;
  let lastError: string | undefined;

  // Cargar attempt + exam + student + academy
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, exam_id, student_id, academy_id, exams(id, level)")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) return { corrected: 0, skipped: 0, errors: 0, lastError: "Attempt no encontrado en BBDD." };

  const examData = Array.isArray(attempt.exams)
    ? attempt.exams[0]
    : attempt.exams;
  const cambridgeLevel = (examData?.level ?? "B1") as string;

  // Cargar todas las preguntas de tipo Writing del examen
  const { data: parts } = await admin
    .from("exam_parts")
    .select("id, part_number, skill")
    .eq("exam_id", attempt.exam_id);

  if (!parts) return { corrected: 0, skipped: 0, errors: 0, lastError: "No se encontraron partes del examen." };

  const partIds = parts.map((p) => p.id);
  const partById = new Map(parts.map((p) => [p.id, p]));

  const { data: questions } = await admin
    .from("questions")
    .select("id, part_id, question_type, stem, context, correct_answer")
    .in("part_id", partIds);

  if (!questions) return { corrected: 0, skipped: 0, errors: 0, lastError: "No se encontraron preguntas del examen." };

  // Filtrar solo las preguntas de tipo Writing (open_response, essay, letter, etc.)
  // IMPORTANTE: los mocks A2-C2 cargados en 015-030 usan question_type
  // = 'writing_task'. Los antiguos podían usar tipos como 'essay',
  // 'letter', etc. Aceptamos ambos para máxima cobertura.
  const WRITING_TYPES = [
    "writing_task",
    "essay",
    "letter",
    "email",
    "article",
    "review",
    "report",
    "story",
    "open_response",
  ];

  const writingQuestions = questions.filter((q) =>
    WRITING_TYPES.includes(q.question_type as string)
  );

  if (writingQuestions.length === 0) {
    return {
      corrected: 0,
      skipped: 0,
      errors: 0,
      lastError: "No hay preguntas de Writing en este examen.",
    };
  }

  // Cargar las respuestas del alumno
  const questionIds = writingQuestions.map((q) => q.id);
  const { data: answers } = await admin
    .from("answers")
    .select("question_id, answer_text")
    .eq("attempt_id", attemptId)
    .in("question_id", questionIds);

  const answerByQuestion = new Map(
    (answers ?? []).map((a) => [a.question_id, a.answer_text ?? ""])
  );

  // Cargar correcciones ya existentes para saltar duplicados
  const { data: existingCorrections } = await admin
    .from("writing_corrections")
    .select("question_id, corrected_by_ai, corrected_by")
    .eq("attempt_id", attemptId)
    .in("question_id", questionIds);

  const existingSet = new Set(
    (existingCorrections ?? [])
      .filter((c) => c.corrected_by_ai || c.corrected_by !== null)
      .map((c) => c.question_id)
  );

  // Corregir cada writing
  for (const q of writingQuestions) {
    if (existingSet.has(q.id)) {
      skipped += 1;
      continue;
    }

    const answerText = answerByQuestion.get(q.id) ?? "";
    if (!answerText.trim()) {
      // Alumno no respondió → registrar corrección con 0s sin llamar a la IA
      const { error: upsertErr } = await admin
        .from("writing_corrections")
        .upsert(
          {
            attempt_id: attemptId,
            question_id: q.id,
            student_id: attempt.student_id,
            academy_id: attempt.academy_id, // null OK para individuales
            content_score: 0,
            communicative_score: 0,
            organisation_score: 0,
            language_score: 0,
            total_score: 0,
            feedback:
              "No se detectó respuesta. Recuerda escribir tu texto antes de enviar el examen.",
            corrected_by_ai: true,
            status: "completed",
            corrected_at: new Date().toISOString(),
            suggestions: [],
          },
          { onConflict: "attempt_id,question_id" }
        );
      if (upsertErr) {
        console.error(
          `[AI trigger] Upsert (empty answer) failed for q=${q.id}:`,
          upsertErr
        );
        lastError = `Upsert falló (respuesta vacía): ${upsertErr.message}`;
        errors += 1;
      } else {
        corrected += 1;
      }
      continue;
    }

    const part = partById.get(q.part_id);

    // Extraer taskInstruction del context o stem
    const context = (q.context ?? {}) as Record<string, unknown>;
    const taskInstruction =
      (context.task_instruction as string) ||
      (context.instruction as string) ||
      q.stem ||
      "";
    const wordMin = context.word_count_min as number | undefined;
    const wordMax = context.word_count_max as number | undefined;
    const taskType = (context.task_type as string) ?? null;

    try {
      await correctWritingWithAI({
        attemptId,
        questionId: q.id,
        studentId: attempt.student_id,
        academyId: attempt.academy_id, // null OK para individuales
        input: {
          cambridgeLevel,
          partNumber: part?.part_number ?? 1,
          taskInstruction,
          taskType,
          studentResponse: answerText,
          wordCountTarget:
            wordMin && wordMax ? { min: wordMin, max: wordMax } : null,
        },
        triggeredBy: "auto_submit",
      });
      corrected += 1;
    } catch (e) {
      console.error(`AI correction failed for question ${q.id}:`, e);
      lastError = e instanceof Error ? e.message : String(e);
      errors += 1;
    }
  }

  return { corrected, skipped, errors, lastError };
}
