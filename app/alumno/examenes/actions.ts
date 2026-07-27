"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Confirma la lectura de instrucciones y arranca un paper.
 *
 * Flujo:
 *   1. Verifica el paper y sus condiciones (disponible, prerequisitos)
 *   2. Busca o crea el attempt agrupador para este mock
 *   3. Busca o crea el paper_attempt
 *   4. Marca el paper_attempt como "in_progress" con timer arrancando
 *   5. Redirige al simulador
 *
 * Idempotente: si ya hay un paper_attempt in_progress, solo redirige.
 */
export async function startOrResumePaperAction(
  examId: string,
  paperCode: string
): Promise<{ error?: string; redirectTo?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  // 1. Verificar el examen y el paper
  const { data: exam } = await admin
    .from("exams")
    .select("id, is_published")
    .eq("id", examId)
    .maybeSingle();

  if (!exam || !exam.is_published) {
    return { error: "El examen no existe o no está publicado." };
  }

  const { data: paper } = await admin
    .from("exam_papers")
    .select(
      "id, code, is_available, unlocks_after_paper_id, duration_minutes"
    )
    .eq("exam_id", examId)
    .eq("code", paperCode)
    .maybeSingle();

  if (!paper) return { error: "Este paper no existe en el examen." };
  if (!paper.is_available) return { error: "Este paper aún no está disponible." };

  // ─── Guard: alumnos individuales — verificar suscripción/trial ─────
  const isIndividual = Boolean(
    (user.profile as unknown as Record<string, unknown>).is_individual
  );

  if (isIndividual) {
    const { getIndividualStatus, canStartMock } = await import(
      "@/lib/individual/trial"
    );
    const status = await getIndividualStatus({
      id: user.id,
      is_individual: true,
      trial_ends_at:
        ((user.profile as unknown as Record<string, unknown>)
          .trial_ends_at as string | null) ?? null,
      current_level:
        ((user.profile as unknown as Record<string, unknown>)
          .current_level as string | null) ?? null,
    });

    const check = await canStartMock(user.id, examId, status);
    if (!check.allowed) {
      return {
        error: check.reason === "trial_cap_reached"
          ? "TRIAL_CAP_REACHED"
          : check.reason ?? "No puedes empezar este mock.",
      };
    }

    // Verificar nivel del examen coincide con el nivel del alumno
    const { data: examLevel } = await admin
      .from("exams")
      .select("level")
      .eq("id", examId)
      .maybeSingle();

    if (
      examLevel?.level &&
      status.cambridge_level &&
      examLevel.level !== status.cambridge_level
    ) {
      return {
        error: `Este mock es de nivel ${examLevel.level}. Tu suscripción es de ${status.cambridge_level}.`,
      };
    }
  }

  // 2. Buscar o crear el attempt agrupador
  const { data: existingAttempt } = await admin
    .from("attempts")
    .select("id, status, academy_id")
    .eq("exam_id", examId)
    .eq("student_id", user.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let attemptId: string;
  let academyId: string | null;

  if (existingAttempt) {
    attemptId = existingAttempt.id;
    academyId = existingAttempt.academy_id;
  } else {
    // Crear nuevo attempt agrupador
    if (isIndividual) {
      academyId = null;
    } else {
      if (!user.profile.academy_id) {
        return { error: "Tu cuenta no está asociada a ninguna academia." };
      }
      academyId = user.profile.academy_id;
    }

    const { data: newAttempt, error: attemptErr } = await admin
      .from("attempts")
      .insert({
        exam_id: examId,
        student_id: user.id,
        academy_id: academyId,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (attemptErr || !newAttempt) {
      return { error: `No se pudo crear el intento: ${attemptErr?.message ?? "error"}` };
    }
    attemptId = newAttempt.id;
  }

  // 3. Verificar prerequisitos del paper
  if (paper.unlocks_after_paper_id) {
    const { data: prereqAttempt } = await admin
      .from("paper_attempts")
      .select("status")
      .eq("attempt_id", attemptId)
      .eq("paper_id", paper.unlocks_after_paper_id)
      .maybeSingle();

    const done =
      prereqAttempt?.status === "completed" ||
      prereqAttempt?.status === "time_expired";
    if (!done) {
      return {
        error: "Aún no puedes empezar este paper. Termina antes el anterior.",
      };
    }
  }

  // 4. Buscar o crear el paper_attempt
  const { data: existingPa } = await admin
    .from("paper_attempts")
    .select("id, status, time_remaining_seconds")
    .eq("attempt_id", attemptId)
    .eq("paper_id", paper.id)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existingPa) {
    // Si ya está completado, no dejar volver a empezar
    if (
      existingPa.status === "completed" ||
      existingPa.status === "time_expired"
    ) {
      return { error: "Este paper ya está completado. Puedes ver tu resultado." };
    }

    // Marcar como in_progress (por si venía de paused o confirmed)
    await admin
      .from("paper_attempts")
      .update({
        status: "in_progress",
        started_at: existingPa.status === "confirmed" ? now : undefined,
        last_active_at: now,
        updated_at: now,
      })
      .eq("id", existingPa.id);
  } else {
    // Crear nuevo paper_attempt
    const { error: paErr } = await admin.from("paper_attempts").insert({
      attempt_id: attemptId,
      paper_id: paper.id,
      student_id: user.id,
      status: "in_progress",
      started_at: now,
      confirmed_at: now,
      last_active_at: now,
      time_remaining_seconds: paper.duration_minutes * 60,
    });

    if (paErr) {
      return {
        error: `No se pudo crear el intento del paper: ${paErr.message}`,
      };
    }
  }

  revalidatePath(`/alumno/examenes/${examId}`);

  return {
    redirectTo: `/alumno/examenes/${examId}/${paper.code}/examen`,
  };
}


/**
 * Cierra un paper (llamado al agotarse el timer o cuando el alumno termina).
 * Cambia el status a completed o time_expired.
 */
export async function closePaperAction(
  examId: string,
  paperCode: string,
  reason: "completed" | "time_expired"
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  // Buscar attempt agrupador
  const { data: attempt } = await admin
    .from("attempts")
    .select("id")
    .eq("exam_id", examId)
    .eq("student_id", user.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!attempt) return { error: "No hay intento en curso." };

  // Buscar el paper
  const { data: paper } = await admin
    .from("exam_papers")
    .select("id")
    .eq("exam_id", examId)
    .eq("code", paperCode)
    .maybeSingle();

  if (!paper) return { error: "Paper no encontrado." };

  // Actualizar paper_attempt
  const now = new Date().toISOString();
  const { error } = await admin
    .from("paper_attempts")
    .update({
      status: reason,
      completed_at: now,
      last_active_at: now,
      auto_closed: reason === "time_expired",
      updated_at: now,
    })
    .eq("attempt_id", attempt.id)
    .eq("paper_id", paper.id);

  if (error) return { error: error.message };

  revalidatePath(`/alumno/examenes/${examId}`);
  return {};
}


/**
 * Guarda o actualiza una respuesta del alumno.
 * Se llama desde el simulador cada vez que cambia una respuesta (debounced).
 * Idempotente: si ya existe la respuesta, la actualiza.
 */
export async function saveAnswerAction(input: {
  paperAttemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
}): Promise<{ error?: string; ok?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  // Verificar que el paper_attempt pertenece al alumno y está in_progress
  const { data: pa } = await admin
    .from("paper_attempts")
    .select("id, attempt_id, status, student_id")
    .eq("id", input.paperAttemptId)
    .maybeSingle();

  if (!pa) return { error: "Intento no encontrado." };
  if (pa.student_id !== user.id) return { error: "No autorizado." };
  if (pa.status !== "in_progress") {
    return { error: "El intento no está en curso." };
  }

  // Upsert en answers (unique attempt_id + question_id)
  const { error } = await admin.from("answers").upsert(
    {
      attempt_id: pa.attempt_id,
      paper_attempt_id: pa.id,
      question_id: input.questionId,
      selected_option_id: input.selectedOptionId ?? null,
      answer_text: input.answerText ?? null,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "attempt_id,question_id" }
  );

  if (error) return { error: error.message };
  return { ok: true };
}


/**
 * Sincroniza el timer con la BD.
 * Se llama cada 30 segundos desde el cliente para persistir el tiempo
 * restante. También actualiza last_active_at.
 */
export async function syncTimerAction(input: {
  paperAttemptId: string;
  timeRemainingSeconds: number;
}): Promise<{ error?: string; ok?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  const { data: pa } = await admin
    .from("paper_attempts")
    .select("id, student_id, status")
    .eq("id", input.paperAttemptId)
    .maybeSingle();

  if (!pa) return { error: "Intento no encontrado." };
  if (pa.student_id !== user.id) return { error: "No autorizado." };
  if (pa.status !== "in_progress") return { ok: true }; // no-op

  const now = new Date().toISOString();
  const { error } = await admin
    .from("paper_attempts")
    .update({
      time_remaining_seconds: Math.max(0, Math.floor(input.timeRemainingSeconds)),
      last_active_at: now,
      updated_at: now,
    })
    .eq("id", input.paperAttemptId);

  if (error) return { error: error.message };
  return { ok: true };
}


/**
 * Marca o desmarca una pregunta como "para revisar" (bookmark).
 */
export async function toggleBookmarkAction(input: {
  paperAttemptId: string;
  questionId: string;
  bookmarked: boolean;
}): Promise<{ error?: string; ok?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  if (input.bookmarked) {
    // Insertar (idempotente por unique constraint)
    const { error } = await admin.from("paper_attempt_bookmarks").upsert(
      {
        paper_attempt_id: input.paperAttemptId,
        question_id: input.questionId,
        student_id: user.id,
      },
      { onConflict: "paper_attempt_id,question_id" }
    );
    if (error) return { error: error.message };
  } else {
    // Borrar
    const { error } = await admin
      .from("paper_attempt_bookmarks")
      .delete()
      .eq("paper_attempt_id", input.paperAttemptId)
      .eq("question_id", input.questionId);
    if (error) return { error: error.message };
  }

  return { ok: true };
}


/**
 * Pausa el paper (llamado al cerrar el navegador o navegar fuera).
 * Guarda el tiempo restante y marca el paper_attempt como 'paused'.
 */
export async function pausePaperAction(input: {
  paperAttemptId: string;
  timeRemainingSeconds: number;
}): Promise<{ error?: string; ok?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  const { data: pa } = await admin
    .from("paper_attempts")
    .select("id, student_id, status")
    .eq("id", input.paperAttemptId)
    .maybeSingle();

  if (!pa) return { error: "Intento no encontrado." };
  if (pa.student_id !== user.id) return { error: "No autorizado." };
  if (pa.status !== "in_progress") return { ok: true }; // ya está en otro estado

  const now = new Date().toISOString();
  const { error } = await admin
    .from("paper_attempts")
    .update({
      status: "paused",
      time_remaining_seconds: Math.max(0, Math.floor(input.timeRemainingSeconds)),
      last_active_at: now,
      updated_at: now,
    })
    .eq("id", input.paperAttemptId);

  if (error) return { error: error.message };
  return { ok: true };
}


/**
 * Cierre automático por tiempo agotado.
 * Autocorrige y marca el paper_attempt como 'time_expired'.
 */
export async function expirePaperAction(input: {
  paperAttemptId: string;
}): Promise<{ error?: string; redirectTo?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  const { data: pa } = await admin
    .from("paper_attempts")
    .select("id, attempt_id, student_id, status")
    .eq("id", input.paperAttemptId)
    .maybeSingle();

  if (!pa) return { error: "Intento no encontrado." };
  if (pa.student_id !== user.id) return { error: "No autorizado." };

  // AUTOCORRECCIÓN antes de marcar como cerrado
  const { autogradePaperAttempt } = await import("@/lib/exam/autograde");
  await autogradePaperAttempt(pa.id);

  const now = new Date().toISOString();
  await admin
    .from("paper_attempts")
    .update({
      status: "time_expired",
      completed_at: now,
      last_active_at: now,
      time_remaining_seconds: 0,
      auto_closed: true,
      updated_at: now,
    })
    .eq("id", input.paperAttemptId);

  // Buscar el examId para el redirect
  const { data: attempt } = await admin
    .from("attempts")
    .select("exam_id")
    .eq("id", pa.attempt_id)
    .maybeSingle();

  const redirectTo = attempt
    ? `/alumno/examenes/${attempt.exam_id}`
    : "/alumno";

  return { redirectTo };
}


/**
 * Guarda las notas del alumno para un paper_attempt.
 * Upsert: si no existen, crea la fila; si existen, actualiza el contenido.
 */
export async function saveNotesAction(input: {
  paperAttemptId: string;
  content: string;
}): Promise<{ error?: string; ok?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  const { data: pa } = await admin
    .from("paper_attempts")
    .select("id, student_id")
    .eq("id", input.paperAttemptId)
    .maybeSingle();

  if (!pa) return { error: "Intento no encontrado." };
  if (pa.student_id !== user.id) return { error: "No autorizado." };

  const { error } = await admin.from("paper_attempt_notes").upsert(
    {
      paper_attempt_id: input.paperAttemptId,
      student_id: user.id,
      content: input.content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "paper_attempt_id" }
  );

  if (error) return { error: error.message };
  return { ok: true };
}
