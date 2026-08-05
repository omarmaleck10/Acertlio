/**
 * ═══════════════════════════════════════════════════════════════
 * TRIGGER DE CORRECCIONES IA PARA UN ATTEMPT COMPLETO
 * ═══════════════════════════════════════════════════════════════
 *
 * Módulo REESCRITO desde cero.
 *
 * Función única: dispara la corrección IA para TODAS las questions
 * tipo Writing del attempt del alumno, guardando los resultados en
 * writing_corrections.
 *
 * Solo procesa alumnos individuales (los de academia esperan al profesor).
 *
 * Devuelve un diagnóstico completo de qué pasó con cada question,
 * para que el frontend pueda mostrar errores útiles si algo falla.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { correctAndSaveWriting } from "./writing-correction";
import type { WritingCorrectionInput } from "./prompt-writing-v1";

// Tipos de question que se corrigen con IA
const WRITING_TYPES = ["writing_task"];


export interface TriggerResult {
  corrected: number;
  skipped: number;
  errors: number;
  lastError?: string;
  perQuestion: Array<{
    questionId: string;
    ok: boolean;
    totalScore?: number;
    error?: string;
    errorStage?: string;
  }>;
}


export async function triggerAICorrectionsForAttempt(
  attemptId: string
): Promise<TriggerResult> {
  const admin = createAdminClient();
  const logPrefix = `[AI trigger ${attemptId.slice(0, 8)}]`;

  const result: TriggerResult = {
    corrected: 0,
    skipped: 0,
    errors: 0,
    perQuestion: [],
  };

  // ─── 1. Cargar attempt + academy_id ─────────────────────────
  const { data: attempt, error: attemptErr } = await admin
    .from("attempts")
    .select("id, exam_id, student_id, academy_id, exams(id, level)")
    .eq("id", attemptId)
    .maybeSingle();

  if (attemptErr || !attempt) {
    const msg = attemptErr?.message ?? "Attempt no encontrado.";
    console.error(`${logPrefix} No se pudo cargar attempt:`, msg);
    result.lastError = msg;
    return result;
  }

  const examData = Array.isArray(attempt.exams)
    ? attempt.exams[0]
    : attempt.exams;
  const cambridgeLevel = examData?.level ?? "B1";

  // ─── 2. Cargar preguntas del examen (writing_task) ─────────
  const { data: parts, error: partsErr } = await admin
    .from("exam_parts")
    .select("id, part_number")
    .eq("exam_id", attempt.exam_id);

  if (partsErr || !parts) {
    console.error(`${logPrefix} No se pudieron cargar parts:`, partsErr);
    result.lastError = partsErr?.message ?? "Sin parts.";
    return result;
  }

  const partIds = parts.map((p) => p.id);
  if (partIds.length === 0) {
    result.lastError = "El examen no tiene parts.";
    return result;
  }

  const { data: questions, error: questionsErr } = await admin
    .from("questions")
    .select("id, part_id, stem, context, question_type")
    .in("part_id", partIds);

  if (questionsErr || !questions) {
    console.error(
      `${logPrefix} No se pudieron cargar questions:`,
      questionsErr
    );
    result.lastError = questionsErr?.message ?? "Sin questions.";
    return result;
  }

  const writingQuestions = questions.filter((q) =>
    WRITING_TYPES.includes(q.question_type as string)
  );

  console.log(
    `${logPrefix} attempt=${attemptId} · questions_total=${questions.length} · writing=${writingQuestions.length}`
  );

  if (writingQuestions.length === 0) {
    result.lastError = "No hay preguntas de Writing en este examen.";
    return result;
  }

  // ─── 3. Cargar respuestas del alumno ───────────────────────
  const writingQuestionIds = writingQuestions.map((q) => q.id);

  // ⚠️ CRÍTICO: usar filtro simple .eq("attempt_id") funciona aquí porque
  // es una tabla pequeña por attempt. Si acaso falla, cargamos por student.
  let { data: answersData, error: answersErr } = await admin
    .from("answers")
    .select("question_id, answer_text")
    .eq("attempt_id", attemptId)
    .in("question_id", writingQuestionIds);

  if (answersErr) {
    console.warn(
      `${logPrefix} Fallo answers por attempt_id, probando fallback:`,
      answersErr
    );
    // Fallback: cargar todas las answers del student y filtrar en JS
    const { data: allAnswers } = await admin
      .from("answers")
      .select("attempt_id, question_id, answer_text");

    answersData = (allAnswers ?? []).filter(
      (a) =>
        a.attempt_id === attemptId &&
        writingQuestionIds.includes(a.question_id as string)
    );
  }

  const answerByQuestion = new Map<string, string>();
  (answersData ?? []).forEach((a) => {
    answerByQuestion.set(a.question_id, a.answer_text ?? "");
  });

  console.log(
    `${logPrefix} answers_encontradas=${answerByQuestion.size}/${writingQuestions.length}`
  );

  // ─── 4. Verificar cuáles ya están corregidas ───────────────
  // Query GLOBAL por student (evita bug de .eq("attempt_id"))
  const { data: existingRaw } = await admin
    .from("writing_corrections")
    .select("attempt_id, question_id, corrected_by_ai, status")
    .eq("student_id", attempt.student_id)
    .order("updated_at", { ascending: false })
    .limit(200);

  const alreadyCorrected = new Set<string>();
  (existingRaw ?? []).forEach((c) => {
    if (
      c.attempt_id === attemptId &&
      writingQuestionIds.includes(c.question_id as string)
    ) {
      // Solo saltar si es humana (corrección profesor)
      // Si es IA, permitimos re-correcion (retry)
      const isHuman = !(c as unknown as Record<string, unknown>).corrected_by_ai;
      if (isHuman && c.status === "completed") {
        alreadyCorrected.add(c.question_id as string);
      }
    }
  });

  console.log(
    `${logPrefix} ya_corregidas_por_humano=${alreadyCorrected.size}`
  );

  // ─── 5. Procesar cada writing question ─────────────────────
  for (const q of writingQuestions) {
    if (alreadyCorrected.has(q.id)) {
      console.log(
        `${logPrefix} q=${q.id.slice(0, 8)} ya corregida por humano, salto.`
      );
      result.skipped += 1;
      result.perQuestion.push({ questionId: q.id, ok: true });
      continue;
    }

    const answerText = answerByQuestion.get(q.id) ?? "";
    const context = (q.context ?? {}) as Record<string, unknown>;

    const part = parts.find((p) => p.id === q.part_id);
    const taskInstruction =
      (context.task_instruction as string | undefined) ??
      (context.instruction as string | undefined) ??
      q.stem ??
      "";
    const wordMin = context.word_count_min as number | undefined;
    const wordMax = context.word_count_max as number | undefined;
    const taskType = (context.task_type as string) ?? null;

    const input: WritingCorrectionInput = {
      cambridgeLevel: cambridgeLevel as WritingCorrectionInput["cambridgeLevel"],
      partNumber: part?.part_number ?? 1,
      taskInstruction,
      taskType,
      studentResponse: answerText,
      wordCountTarget:
        wordMin && wordMax ? { min: wordMin, max: wordMax } : null,
    };

    const res = await correctAndSaveWriting({
      attemptId,
      questionId: q.id,
      studentId: attempt.student_id,
      academyId: attempt.academy_id, // null OK para individuales
      input,
      triggeredBy: "auto_submit",
    });

    if (res.ok) {
      result.corrected += 1;
      result.perQuestion.push({
        questionId: q.id,
        ok: true,
        totalScore: res.totalScore,
      });
    } else {
      result.errors += 1;
      result.lastError = res.error;
      result.perQuestion.push({
        questionId: q.id,
        ok: false,
        error: res.error,
        errorStage: res.errorStage,
      });
    }
  }

  console.log(
    `${logPrefix} Fin: corrected=${result.corrected} skipped=${result.skipped} errors=${result.errors}`
  );

  return result;
}
