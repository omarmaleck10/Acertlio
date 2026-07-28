import { createAdminClient } from "@/lib/supabase/admin";
import { callAnthropic, estimateCostUsd } from "./anthropic-client";
import {
  buildWritingCorrectionSystem,
  buildWritingCorrectionUser,
  WRITING_PROMPT_VERSION,
  type WritingCorrectionInput,
} from "./prompt-writing-v1";

// Modelo elegido en la decisión 5B.1
const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1500;


export interface WritingAIResult {
  content_score: number;
  communicative_score: number;
  organisation_score: number;
  language_score: number;
  total_score: number;
  feedback: string;
  suggestions: Array<{
    type: string;
    text: string;
    example?: string;
  }>;
  ai_correction_id: string;
}


export interface AICorrectionParams {
  attemptId: string;
  questionId: string;
  studentId: string;
  input: WritingCorrectionInput;
  triggeredBy?: "auto_submit" | "fallback_academy" | "retry";
}


/**
 * Corrige un Writing con IA, guarda trazabilidad en ai_corrections y
 * escribe el resultado en writing_corrections.
 *
 * Idempotente: si ya existe una corrección para (attempt_id, question_id),
 * la sobreescribe (útil para retries).
 *
 * En caso de error:
 *   · Guarda la fila en ai_corrections con status='error' + error_message
 *   · Lanza la excepción (el caller decide qué mostrar al alumno)
 */
export async function correctWritingWithAI(
  params: AICorrectionParams
): Promise<WritingAIResult> {
  const admin = createAdminClient();
  const { attemptId, questionId, studentId, input, triggeredBy = "auto_submit" } = params;

  // Registrar la llamada como pending
  const { data: aiRow, error: aiInsertErr } = await admin
    .from("ai_corrections")
    .insert({
      attempt_id: attemptId,
      question_id: questionId,
      student_id: studentId,
      model: DEFAULT_MODEL,
      prompt_version: WRITING_PROMPT_VERSION,
      status: "pending",
      triggered_by: triggeredBy,
    })
    .select("id")
    .single();

  if (aiInsertErr || !aiRow) {
    throw new Error(`No se pudo registrar la llamada IA: ${aiInsertErr?.message}`);
  }

  const aiCorrectionId = aiRow.id;
  const startedAt = Date.now();

  try {
    // ─── Llamada a Anthropic ────────────────────────────────
    const system = buildWritingCorrectionSystem();
    const user = buildWritingCorrectionUser(input);

    const response = await callAnthropic({
      model: DEFAULT_MODEL,
      system,
      messages: [{ role: "user", content: user }],
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
    });

    const latencyMs = Date.now() - startedAt;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costUsd = estimateCostUsd(DEFAULT_MODEL, inputTokens, outputTokens);

    // ─── Parsear respuesta JSON ─────────────────────────────
    const rawText = response.content[0]?.text ?? "";
    const parsed = parseAIResponse(rawText);

    // Sanity check de rangos
    const clamp05 = (v: number) =>
      Math.max(0, Math.min(5, Math.round(v)));
    const contentScore = clamp05(parsed.content_score);
    const communicativeScore = clamp05(parsed.communicative_score);
    const organisationScore = clamp05(parsed.organisation_score);
    const languageScore = clamp05(parsed.language_score);
    const totalScore =
      contentScore + communicativeScore + organisationScore + languageScore;

    // ─── Actualizar ai_corrections ──────────────────────────
    await admin
      .from("ai_corrections")
      .update({
        status: "success",
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: costUsd,
        latency_ms: latencyMs,
        completed_at: new Date().toISOString(),
      })
      .eq("id", aiCorrectionId);

    // ─── Guardar en writing_corrections ────────────────────
    await admin.from("writing_corrections").upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        student_id: studentId,
        content_score: contentScore,
        communicative_score: communicativeScore,
        organisation_score: organisationScore,
        language_score: languageScore,
        total_score: totalScore,
        feedback: parsed.feedback ?? "",
        corrected_by: null, // null = IA, no humano
        corrected_by_ai: true,
        ai_correction_id: aiCorrectionId,
        suggestions: parsed.suggestions ?? [],
        corrected_at: new Date().toISOString(),
      },
      { onConflict: "attempt_id,question_id" }
    );

    return {
      content_score: contentScore,
      communicative_score: communicativeScore,
      organisation_score: organisationScore,
      language_score: languageScore,
      total_score: totalScore,
      feedback: parsed.feedback ?? "",
      suggestions: parsed.suggestions ?? [],
      ai_correction_id: aiCorrectionId,
    };
  } catch (error) {
    // Guardar error en ai_corrections
    const latencyMs = Date.now() - startedAt;
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    await admin
      .from("ai_corrections")
      .update({
        status: "error",
        error_message: errorMessage.slice(0, 1000),
        latency_ms: latencyMs,
        completed_at: new Date().toISOString(),
      })
      .eq("id", aiCorrectionId);

    throw error;
  }
}


/**
 * Parsea la respuesta JSON de la IA, siendo tolerante a errores comunes:
 *   · Fences ```json ... ```
 *   · Texto antes/después del JSON
 */
function parseAIResponse(text: string): {
  content_score: number;
  communicative_score: number;
  organisation_score: number;
  language_score: number;
  feedback: string;
  suggestions: Array<{ type: string; text: string; example?: string }>;
} {
  let cleaned = text.trim();

  // Quitar fences si vienen
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Si viene con texto antes/después, extraer el primer {...} bien formado
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleaned);

    return {
      content_score: Number(parsed.content_score ?? 0),
      communicative_score: Number(parsed.communicative_score ?? 0),
      organisation_score: Number(parsed.organisation_score ?? 0),
      language_score: Number(parsed.language_score ?? 0),
      feedback: String(parsed.feedback ?? ""),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 5).map((s: { type?: unknown; text?: unknown; example?: unknown }) => ({
            type: String(s.type ?? "structure"),
            text: String(s.text ?? ""),
            example: s.example ? String(s.example) : undefined,
          }))
        : [],
    };
  } catch (e) {
    throw new Error(
      `No se pudo parsear la respuesta de la IA: ${
        e instanceof Error ? e.message : String(e)
      }. Respuesta: ${text.slice(0, 200)}`
    );
  }
}
