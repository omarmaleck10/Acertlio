"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SimulatorResult = {
  error: string | null;
  data?: unknown;
};

/**
 * Empieza un attempt (o recupera el en curso si existe).
 * Redirige a /alumno/examen/[attemptId].
 */
export async function startAttemptAction(
  _prev: SimulatorResult,
  formData: FormData
): Promise<SimulatorResult> {
  const examId = String(formData.get("examId") ?? "").trim();
  if (!examId) return { error: "Falta ID del examen." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, academy_id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "student" || !profile.is_active) {
    return { error: "Solo alumnos activos pueden empezar exámenes." };
  }

  if (!profile.academy_id) {
    return { error: "Tu cuenta no está asociada a ninguna academia." };
  }

  const admin = createAdminClient();

  // Verificar que el examen existe y está publicado
  const { data: exam } = await admin
    .from("exams")
    .select("id, is_published")
    .eq("id", examId)
    .maybeSingle();

  if (!exam || !exam.is_published) {
    return { error: "Este examen no está disponible." };
  }

  // ¿Hay un attempt en curso para este alumno + este examen?
  const { data: existing } = await admin
    .from("attempts")
    .select("id, status")
    .eq("exam_id", examId)
    .eq("student_id", profile.id)
    .eq("status", "in_progress")
    .maybeSingle();

  let attemptId: string;

  if (existing) {
    attemptId = existing.id;
  } else {
    // Crear nuevo attempt
    const { data: created, error: createError } = await admin
      .from("attempts")
      .insert({
        exam_id: examId,
        student_id: profile.id,
        academy_id: profile.academy_id,
        status: "in_progress",
        started_at: new Date().toISOString(),
        time_spent_seconds: 0,
      })
      .select("id")
      .single();

    if (createError || !created) {
      return { error: `No se pudo empezar el examen: ${createError?.message ?? ""}` };
    }
    attemptId = created.id;
  }

  redirect(`/alumno/examen/${attemptId}`);
}

/**
 * Guarda un lote de respuestas (autosave).
 * NO devuelve error si algún guardado individual falla — best effort.
 *
 * Payload esperado en formData:
 *   - attemptId
 *   - answers: JSON string con array [{questionId, answerText?, selectedOptionId?}]
 */
export async function saveAnswersAction(
  formData: FormData
): Promise<SimulatorResult> {
  const attemptId = String(formData.get("attemptId") ?? "").trim();
  const answersRaw = String(formData.get("answers") ?? "").trim();
  const timeSpentRaw = String(formData.get("time_spent_seconds") ?? "").trim();

  if (!attemptId || !answersRaw) return { error: "Faltan datos." };

  let answers: Array<{
    questionId: string;
    answerText?: string | null;
    selectedOptionId?: string | null;
  }> = [];
  try {
    answers = JSON.parse(answersRaw);
  } catch {
    return { error: "Formato de respuestas inválido." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const admin = createAdminClient();

  // Verificar que el attempt es del alumno autenticado (o superadmin)
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, student_id, status")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) return { error: "Intento no encontrado." };
  if (attempt.status !== "in_progress") {
    return { error: "Este intento ya no está en curso." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isOwner = attempt.student_id === user.id;
  const isSuperAdmin = profile?.role === "super_admin";
  if (!isOwner && !isSuperAdmin) {
    return { error: "Sin permiso." };
  }

  // Upsert respuestas (una por una para evitar problemas de tipos con jsonb batch)
  for (const a of answers) {
    if (!a.questionId) continue;
    const payload: Record<string, unknown> = {
      attempt_id: attemptId,
      question_id: a.questionId,
      updated_at: new Date().toISOString(),
    };
    if (a.answerText !== undefined) payload.answer_text = a.answerText;
    if (a.selectedOptionId !== undefined) payload.selected_option_id = a.selectedOptionId;

    await admin.from("answers").upsert(payload, {
      onConflict: "attempt_id,question_id",
    });
  }

  // Actualizar time_spent_seconds si viene
  if (timeSpentRaw) {
    const seconds = parseInt(timeSpentRaw, 10);
    if (!isNaN(seconds) && seconds >= 0) {
      await admin
        .from("attempts")
        .update({ time_spent_seconds: seconds, updated_at: new Date().toISOString() })
        .eq("id", attemptId);
    }
  }

  return { error: null };
}

/**
 * Envía el examen: cambia status a "submitted" y timestamp de envío.
 * No autocorrige (eso es sesión siguiente).
 */
export async function submitAttemptAction(
  _prev: SimulatorResult,
  formData: FormData
): Promise<SimulatorResult> {
  const attemptId = String(formData.get("attemptId") ?? "").trim();
  if (!attemptId) return { error: "Falta ID de intento." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const admin = createAdminClient();
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, student_id, status")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) return { error: "Intento no encontrado." };
  if (attempt.status !== "in_progress") {
    return { error: "Este intento ya fue enviado." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isOwner = attempt.student_id === user.id;
  const isSuperAdmin = profile?.role === "super_admin";
  if (!isOwner && !isSuperAdmin) return { error: "Sin permiso." };

  await admin
    .from("attempts")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  revalidatePath(`/alumno/examen/${attemptId}`);
  revalidatePath("/alumno");
  redirect(`/alumno/examen/${attemptId}/enviado`);
}
