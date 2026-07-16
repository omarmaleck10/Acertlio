"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestionType } from "@/lib/supabase/types";

export type EditorResult = {
  error: string | null;
  success: string | null;
};

/**
 * Solo super_admin puede editar preguntas.
 */
async function assertSuperAdmin(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "No autenticado.";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "super_admin" || !profile.is_active) {
    return "Solo el superadmin puede editar preguntas.";
  }
  return null;
}

// ─── Texto base de la parte ─────────────────────────────────────────
/**
 * Guarda contenido compartido de la parte:
 *  - reading_text: texto largo para MC (Part 3, Part 5 C1)
 *  - base_text: texto con gaps para MC cloze / open cloze
 *  - matching_options: array de {letter, text} para multiple matching
 *  - long_texts: array de {letter, text} para cross-text matching
 */
export async function updatePartContextAction(
  _prev: EditorResult,
  formData: FormData
): Promise<EditorResult> {
  const authError = await assertSuperAdmin();
  if (authError) return { error: authError, success: null };

  const partId = String(formData.get("partId") ?? "").trim();
  if (!partId) return { error: "Falta el ID de la parte.", success: null };

  const admin = createAdminClient();

  const { data: part } = await admin
    .from("exam_parts")
    .select("id, exam_id, settings")
    .eq("id", partId)
    .maybeSingle();

  if (!part) return { error: "Parte no encontrada.", success: null };

  // Extraer los campos de contexto del formData
  const readingText = String(formData.get("reading_text") ?? "").trim() || null;
  const baseText = String(formData.get("base_text") ?? "").trim() || null;
  const instructionsExtra =
    String(formData.get("instructions_extra") ?? "").trim() || null;

  // Multiple matching options: se envían como JSON string
  const matchingOptionsRaw = String(formData.get("matching_options") ?? "").trim();
  let matchingOptions: Array<{ letter: string; text: string }> | null = null;
  if (matchingOptionsRaw) {
    try {
      matchingOptions = JSON.parse(matchingOptionsRaw);
    } catch {
      return { error: "Formato inválido en las opciones de matching.", success: null };
    }
  }

  // Preservar campos existentes que no editamos aquí
  const existingSettings = (part.settings as Record<string, unknown>) ?? {};
  const newSettings: Record<string, unknown> = {
    ...existingSettings,
    reading_text: readingText,
    base_text: baseText,
    instructions_extra: instructionsExtra,
    matching_options: matchingOptions,
  };

  const { error } = await admin
    .from("exam_parts")
    .update({ settings: newSettings })
    .eq("id", partId);

  if (error) return { error: error.message, success: null };

  revalidatePath(`/admin/examenes/${part.exam_id}/parte/${partId}`);
  return { error: null, success: "Contenido base guardado." };
}

// ─── Crear pregunta ─────────────────────────────────────────────────
/**
 * Crea una pregunta nueva al final de la parte.
 * Inicializa según el tipo de la parte:
 *  - MC/MC-cloze: crea la pregunta + 3 opciones vacías
 *  - Open cloze / word formation / KWT: solo la pregunta
 *  - Multiple matching: solo la pregunta
 *  - Writing task: solo la pregunta (con instrucciones vacías)
 */
export async function createQuestionAction(
  _prev: EditorResult,
  formData: FormData
): Promise<EditorResult> {
  const authError = await assertSuperAdmin();
  if (authError) return { error: authError, success: null };

  const partId = String(formData.get("partId") ?? "").trim();
  const typeRaw = String(formData.get("question_type") ?? "").trim();
  if (!partId || !typeRaw) return { error: "Faltan datos.", success: null };

  const admin = createAdminClient();

  // Contar preguntas existentes en esta parte para asignar order_index y question_number
  const { count } = await admin
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("part_id", partId);
  const nextIndex = count ?? 0;

  const questionType = typeRaw as QuestionType;
  const isMC = questionType === "multiple_choice" || questionType === "multiple_choice_cloze";

  // Insertar la pregunta
  const { data: question, error } = await admin
    .from("questions")
    .insert({
      part_id: partId,
      question_number: nextIndex + 1,
      question_type: questionType,
      stem: "",
      correct_answer: "",
      order_index: nextIndex,
      points: 1,
      context: {},
    })
    .select("id")
    .single();

  if (error || !question) {
    return { error: `No se pudo crear la pregunta: ${error?.message}`, success: null };
  }

  // Si es MC, crear 3 opciones vacías (A, B, C)
  if (isMC) {
    const optionRows = ["A", "B", "C"].map((letter, i) => ({
      question_id: question.id,
      letter,
      text: "",
      is_correct: false,
      order_index: i,
    }));
    await admin.from("question_options").insert(optionRows);
  }

  const { data: part } = await admin
    .from("exam_parts")
    .select("exam_id")
    .eq("id", partId)
    .maybeSingle();
  if (part) {
    revalidatePath(`/admin/examenes/${part.exam_id}/parte/${partId}`);
  }
  return { error: null, success: "Pregunta añadida." };
}

// ─── Editar pregunta ────────────────────────────────────────────────
/**
 * Actualiza el contenido de una pregunta existente.
 * FormData esperada:
 *  - questionId: uuid
 *  - stem: enunciado (para MC, MM, writing)
 *  - correct_answer: respuesta correcta (para todos menos MC — en MC se marca por opción)
 *  - context: JSON string con datos extra (writing notes, opening sentence)
 *  - opciones (solo MC): option_A, option_B, option_C (+ D si aplica) y correct_letter
 */
export async function updateQuestionAction(
  _prev: EditorResult,
  formData: FormData
): Promise<EditorResult> {
  const authError = await assertSuperAdmin();
  if (authError) return { error: authError, success: null };

  const questionId = String(formData.get("questionId") ?? "").trim();
  if (!questionId) return { error: "Falta ID de pregunta.", success: null };

  const admin = createAdminClient();

  const { data: question } = await admin
    .from("questions")
    .select("id, part_id, question_type, exam_parts(exam_id)")
    .eq("id", questionId)
    .maybeSingle();

  if (!question) return { error: "Pregunta no encontrada.", success: null };

  const stem = String(formData.get("stem") ?? "").trim();
  const correctAnswer = String(formData.get("correct_answer") ?? "").trim();

  // Contexto extra (JSON string) — writing notes, opening sentence, etc.
  const contextRaw = String(formData.get("context") ?? "").trim();
  let context: Record<string, unknown> = {};
  if (contextRaw) {
    try {
      context = JSON.parse(contextRaw);
    } catch {
      return { error: "Contexto extra tiene formato inválido.", success: null };
    }
  }

  // Actualizar la pregunta
  const { error: updateError } = await admin
    .from("questions")
    .update({
      stem,
      correct_answer: correctAnswer || null,
      context,
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionId);

  if (updateError) {
    return { error: updateError.message, success: null };
  }

  // Si es MC, actualizar las opciones
  const isMC =
    question.question_type === "multiple_choice" ||
    question.question_type === "multiple_choice_cloze";

  if (isMC) {
    const correctLetter = String(formData.get("correct_letter") ?? "").trim();
    const letters = ["A", "B", "C", "D"];

    // Traer opciones existentes
    const { data: existingOptions } = await admin
      .from("question_options")
      .select("id, letter")
      .eq("question_id", questionId);

    const existingByLetter = new Map(
      (existingOptions ?? []).map((o) => [o.letter, o.id])
    );

    for (const letter of letters) {
      const text = String(formData.get(`option_${letter}`) ?? "").trim();
      if (!text) {
        // Si estaba y ahora no, borrarla
        const existingId = existingByLetter.get(letter);
        if (existingId) {
          await admin.from("question_options").delete().eq("id", existingId);
        }
        continue;
      }

      const isCorrect = letter === correctLetter;
      const existingId = existingByLetter.get(letter);
      if (existingId) {
        await admin
          .from("question_options")
          .update({ text, is_correct: isCorrect })
          .eq("id", existingId);
      } else {
        await admin.from("question_options").insert({
          question_id: questionId,
          letter,
          text,
          is_correct: isCorrect,
          order_index: letters.indexOf(letter),
        });
      }
    }

    // En MC, correct_answer se guarda también como la letra
    if (correctLetter) {
      await admin
        .from("questions")
        .update({ correct_answer: correctLetter })
        .eq("id", questionId);
    }
  }

  const examPartsRaw = question.exam_parts as unknown;
  const examParts = (Array.isArray(examPartsRaw) ? examPartsRaw[0] : examPartsRaw) as { exam_id: string } | null;
  if (examParts) {
    revalidatePath(`/admin/examenes/${examParts.exam_id}/parte/${question.part_id}`);
  }
  return { error: null, success: "Pregunta guardada." };
}

// ─── Borrar pregunta ────────────────────────────────────────────────
export async function deleteQuestionAction(
  _prev: EditorResult,
  formData: FormData
): Promise<EditorResult> {
  const authError = await assertSuperAdmin();
  if (authError) return { error: authError, success: null };

  const questionId = String(formData.get("questionId") ?? "").trim();
  if (!questionId) return { error: "Falta ID.", success: null };

  const admin = createAdminClient();

  // Obtener info para renumerar y revalidar
  const { data: question } = await admin
    .from("questions")
    .select("part_id, order_index, exam_parts(exam_id)")
    .eq("id", questionId)
    .maybeSingle();

  if (!question) return { error: "Pregunta no encontrada.", success: null };

  // Borrar (cascada limpia opciones)
  await admin.from("questions").delete().eq("id", questionId);

  // Renumerar preguntas restantes (order_index y question_number consecutivos)
  const { data: remaining } = await admin
    .from("questions")
    .select("id, order_index")
    .eq("part_id", question.part_id)
    .order("order_index", { ascending: true });

  for (let i = 0; i < (remaining ?? []).length; i++) {
    await admin
      .from("questions")
      .update({ order_index: i, question_number: i + 1 })
      .eq("id", remaining![i].id);
  }

  const examPartsRaw = question.exam_parts as unknown;
  const examParts = (Array.isArray(examPartsRaw) ? examPartsRaw[0] : examPartsRaw) as { exam_id: string } | null;
  if (examParts) {
    revalidatePath(`/admin/examenes/${examParts.exam_id}/parte/${question.part_id}`);
  }
  return { error: null, success: "Pregunta eliminada." };
}
