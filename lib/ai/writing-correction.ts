/**
 * ═══════════════════════════════════════════════════════════════
 * SERVICIO DE CORRECCIÓN IA DEL WRITING
 * ═══════════════════════════════════════════════════════════════
 *
 * Módulo REESCRITO desde cero con foco en robustez y observabilidad.
 *
 * Principios:
 *  · Nunca silenciar errores. Todo error se captura, loguea y propaga.
 *  · Un solo camino de escritura para writing_corrections.
 *  · UPSERT idempotente con onConflict.
 *  · Diagnóstico rico devuelto al caller.
 *
 * Uso:
 *   const result = await correctAndSaveWriting({
 *     attemptId, questionId, studentId, academyId, input
 *   });
 *   if (result.ok) console.log(result.totalScore);
 *   else console.error(result.error);
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { callAnthropic } from "./anthropic-client";
import {
  buildWritingCorrectionSystem,
  buildWritingCorrectionUser,
} from "./prompt-writing-v1";
import type { WritingCorrectionInput } from "./prompt-writing-v1";
import { checkAIRateLimit } from "./rate-limit";

// Modelo Claude Sonnet 4.6 (potente y económico para correcciones)
const AI_MODEL = "claude-sonnet-4-5-20250929";

// Rúbrica Cambridge: cada criterio 0-5, total 20 puntos
const MAX_CRITERION_SCORE = 5;
const MAX_TOTAL_SCORE = 20;


export interface CorrectAndSaveParams {
  attemptId: string;
  questionId: string;
  studentId: string;
  academyId: string | null; // null para alumnos individuales
  input: WritingCorrectionInput;
  triggeredBy?: "auto_submit" | "retry" | "fallback";
}


export interface CorrectAndSaveResult {
  ok: boolean;
  totalScore?: number;
  contentScore?: number;
  communicativeScore?: number;
  organisationScore?: number;
  languageScore?: number;
  feedbackLen?: number;
  error?: string;
  errorStage?:
    | "rate_limit"
    | "anthropic_call"
    | "parse_response"
    | "save_ai_correction"
    | "save_writing_correction"
    | "invalid_input";
}


/**
 * Corrige un writing con IA y lo guarda en writing_corrections + ai_corrections.
 *
 * Idempotente: si ya existe la fila (attempt_id, question_id), la sobrescribe.
 *
 * NO lanza excepciones. Todo error queda capturado en el resultado.
 */
export async function correctAndSaveWriting(
  params: CorrectAndSaveParams
): Promise<CorrectAndSaveResult> {
  const admin = createAdminClient();
  const {
    attemptId,
    questionId,
    studentId,
    academyId,
    input,
    triggeredBy = "auto_submit",
  } = params;

  const logPrefix = `[AI writing q=${questionId.slice(0, 8)}]`;

  // ─── 0. Validar input ───────────────────────────────────────
  if (!input.studentResponse || !input.studentResponse.trim()) {
    // Sin respuesta → guardar directamente con 0 puntos, sin llamar a IA
    console.log(`${logPrefix} Sin respuesta, guardando 0s.`);
    const saveResult = await saveWritingCorrection({
      attemptId,
      questionId,
      studentId,
      academyId,
      contentScore: 0,
      communicativeScore: 0,
      organisationScore: 0,
      languageScore: 0,
      totalScore: 0,
      feedback:
        "No se detectó respuesta. Recuerda escribir tu texto antes de enviar el examen.",
      suggestions: [],
      aiCorrectionId: null,
    });

    if (!saveResult.ok) {
      return {
        ok: false,
        error: saveResult.error,
        errorStage: "save_writing_correction",
      };
    }

    return { ok: true, totalScore: 0, contentScore: 0, communicativeScore: 0, organisationScore: 0, languageScore: 0, feedbackLen: 0 };
  }

  // ─── 1. Rate limit ──────────────────────────────────────────
  const rl = await checkAIRateLimit(studentId);
  if (!rl.allowed) {
    console.warn(`${logPrefix} Rate limit alcanzado.`);
    return {
      ok: false,
      error: `Has alcanzado el límite diario de correcciones IA (${rl.limit}). Reintenta mañana.`,
      errorStage: "rate_limit",
    };
  }

  // ─── 2. Preparar prompt ─────────────────────────────────────
  const systemPrompt = buildWritingCorrectionSystem();
  const userPrompt = buildWritingCorrectionUser(input);

  // ─── 3. Crear fila ai_corrections en estado 'pending' ───────
  // Sirve como traza. Si algo falla, quedará en 'error' con detalle.
  let aiCorrectionId: string | null = null;
  {
    const { data: aiRow, error: aiErr } = await admin
      .from("ai_corrections")
      .insert({
        attempt_id: attemptId,
        question_id: questionId,
        student_id: studentId,
        academy_id: academyId,
        model: AI_MODEL,
        prompt_version: "writing-v1",
        triggered_by: triggeredBy,
        status: "pending",
      })
      .select("id")
      .single();

    if (aiErr) {
      console.error(`${logPrefix} No se pudo crear ai_corrections:`, aiErr);
      // Continuamos igualmente (no es crítico) sin ai_correction_id
    } else {
      aiCorrectionId = aiRow?.id ?? null;
    }
  }

  // ─── 4. Llamar a Anthropic ──────────────────────────────────
  let anthropicResponse;
  try {
    anthropicResponse = await callAnthropic({
      model: AI_MODEL,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 1500,
      temperature: 0.3,
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(`${logPrefix} Anthropic API falló:`, errMsg);
    await markAICorrectionAsError(admin, aiCorrectionId, `Anthropic API: ${errMsg}`);
    return {
      ok: false,
      error: `La IA no respondió: ${errMsg}`,
      errorStage: "anthropic_call",
    };
  }

  // ─── 5. Parsear respuesta ───────────────────────────────────
  let parsed: {
    content_score: number;
    communicative_score: number;
    organisation_score: number;
    language_score: number;
    feedback: string;
    suggestions?: Array<{ type: string; text: string; example?: string }>;
  };

  try {
    const rawText = anthropicResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    // Buscar el bloque JSON en la respuesta (por si viene con texto rodeándolo)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se encontró JSON en la respuesta de la IA.");
    }
    parsed = JSON.parse(jsonMatch[0]);

    // Validar scores dentro de rango [0, MAX_CRITERION_SCORE]
    const clip = (n: unknown) => {
      const num = typeof n === "number" ? n : Number(n);
      if (!Number.isFinite(num)) return 0;
      return Math.max(0, Math.min(MAX_CRITERION_SCORE, Math.round(num)));
    };
    parsed.content_score = clip(parsed.content_score);
    parsed.communicative_score = clip(parsed.communicative_score);
    parsed.organisation_score = clip(parsed.organisation_score);
    parsed.language_score = clip(parsed.language_score);

    if (!parsed.feedback || typeof parsed.feedback !== "string") {
      parsed.feedback = "";
    }
    if (!Array.isArray(parsed.suggestions)) {
      parsed.suggestions = [];
    }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(`${logPrefix} Error parseando respuesta IA:`, errMsg);
    await markAICorrectionAsError(admin, aiCorrectionId, `Parse: ${errMsg}`);
    return {
      ok: false,
      error: `No se pudo interpretar la respuesta de la IA: ${errMsg}`,
      errorStage: "parse_response",
    };
  }

  const totalScore =
    parsed.content_score +
    parsed.communicative_score +
    parsed.organisation_score +
    parsed.language_score;

  // ─── 6. Actualizar ai_corrections a 'completed' ─────────────
  if (aiCorrectionId) {
    const { error: updateAiErr } = await admin
      .from("ai_corrections")
      .update({
        status: "completed",
        response_json: parsed,
        input_tokens: anthropicResponse.usage.input_tokens,
        output_tokens: anthropicResponse.usage.output_tokens,
        completed_at: new Date().toISOString(),
      })
      .eq("id", aiCorrectionId);

    if (updateAiErr) {
      console.error(
        `${logPrefix} No se pudo marcar ai_corrections como completed:`,
        updateAiErr
      );
      // No crítico, seguimos
    }
  }

  // ─── 7. Guardar en writing_corrections ──────────────────────
  const saveResult = await saveWritingCorrection({
    attemptId,
    questionId,
    studentId,
    academyId,
    contentScore: parsed.content_score,
    communicativeScore: parsed.communicative_score,
    organisationScore: parsed.organisation_score,
    languageScore: parsed.language_score,
    totalScore,
    feedback: parsed.feedback,
    suggestions: parsed.suggestions ?? [],
    aiCorrectionId,
  });

  if (!saveResult.ok) {
    console.error(
      `${logPrefix} FALLO al guardar writing_corrections:`,
      saveResult.error
    );
    return {
      ok: false,
      error: saveResult.error,
      errorStage: "save_writing_correction",
    };
  }

  console.log(
    `${logPrefix} OK — total=${totalScore} content=${parsed.content_score} comm=${parsed.communicative_score} org=${parsed.organisation_score} lang=${parsed.language_score}`
  );

  return {
    ok: true,
    totalScore,
    contentScore: parsed.content_score,
    communicativeScore: parsed.communicative_score,
    organisationScore: parsed.organisation_score,
    languageScore: parsed.language_score,
    feedbackLen: parsed.feedback.length,
  };
}


// ─────────────────────────────────────────────────────────────
// Helper: marcar ai_corrections como error (traza)
// ─────────────────────────────────────────────────────────────
async function markAICorrectionAsError(
  admin: ReturnType<typeof createAdminClient>,
  aiCorrectionId: string | null,
  errorMessage: string
): Promise<void> {
  if (!aiCorrectionId) return;
  await admin
    .from("ai_corrections")
    .update({
      status: "error",
      error_message: errorMessage.slice(0, 500),
      completed_at: new Date().toISOString(),
    })
    .eq("id", aiCorrectionId);
}


// ─────────────────────────────────────────────────────────────
// Helper: guardar en writing_corrections con UPSERT idempotente
// ─────────────────────────────────────────────────────────────
interface SaveWritingParams {
  attemptId: string;
  questionId: string;
  studentId: string;
  academyId: string | null;
  contentScore: number;
  communicativeScore: number;
  organisationScore: number;
  languageScore: number;
  totalScore: number;
  feedback: string;
  suggestions: unknown[];
  aiCorrectionId: string | null;
}

interface SaveResult {
  ok: boolean;
  error?: string;
}

async function saveWritingCorrection(
  params: SaveWritingParams
): Promise<SaveResult> {
  const admin = createAdminClient();

  const row = {
    attempt_id: params.attemptId,
    question_id: params.questionId,
    student_id: params.studentId,
    academy_id: params.academyId, // null OK (individuales) tras migración 035
    content_score: params.contentScore,
    communicative_score: params.communicativeScore,
    organisation_score: params.organisationScore,
    language_score: params.languageScore,
    total_score: params.totalScore,
    feedback: params.feedback,
    suggestions: params.suggestions,
    corrected_by_ai: true,
    ai_correction_id: params.aiCorrectionId,
    status: "completed",
    corrected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("writing_corrections")
    .upsert(row, { onConflict: "attempt_id,question_id" });

  if (error) {
    return { ok: false, error: `Supabase UPSERT: ${error.message}` };
  }

  return { ok: true };
}
