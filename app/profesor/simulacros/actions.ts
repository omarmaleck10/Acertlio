"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recalculateAttemptScore } from "@/lib/exams/recalculate";

export type CorrectionResult = {
  error: string | null;
  success: string | null;
};

/**
 * Guarda una corrección de Writing y recalcula la nota del intento.
 * Solo profesores, academy_admins de la academia, o superadmin pueden hacerlo.
 */
export async function saveWritingCorrectionAction(
  _prev: CorrectionResult,
  formData: FormData
): Promise<CorrectionResult> {
  const attemptId = String(formData.get("attemptId") ?? "").trim();
  const questionId = String(formData.get("questionId") ?? "").trim();
  const contentScoreRaw = String(formData.get("content_score") ?? "").trim();
  const communicativeScoreRaw = String(formData.get("communicative_score") ?? "").trim();
  const organisationScoreRaw = String(formData.get("organisation_score") ?? "").trim();
  const languageScoreRaw = String(formData.get("language_score") ?? "").trim();
  const feedback = String(formData.get("feedback") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? "").trim();
  const notifyStudent = String(formData.get("notify_student") ?? "").trim() === "on";

  if (!attemptId || !questionId) {
    return { error: "Faltan datos de la corrección.", success: null };
  }

  const contentScore = parseInt(contentScoreRaw, 10);
  const communicativeScore = parseInt(communicativeScoreRaw, 10);
  const organisationScore = parseInt(organisationScoreRaw, 10);
  const languageScore = parseInt(languageScoreRaw, 10);

  const scores = [contentScore, communicativeScore, organisationScore, languageScore];
  for (const s of scores) {
    if (isNaN(s) || s < 0 || s > 5) {
      return {
        error: "Todas las puntuaciones deben estar entre 0 y 5.",
        success: null,
      };
    }
  }

  const totalScore =
    contentScore + communicativeScore + organisationScore + languageScore;

  // Autenticación
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado.", success: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, academy_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    (profile.role !== "teacher" &&
      profile.role !== "academy_admin" &&
      profile.role !== "super_admin")
  ) {
    return { error: "No tienes permiso para corregir.", success: null };
  }

  const admin = createAdminClient();

  // Verificar attempt + academia
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, academy_id, student_id, exam_id")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) return { error: "Intento no encontrado.", success: null };
  if (
    profile.role !== "super_admin" &&
    attempt.academy_id !== profile.academy_id
  ) {
    return { error: "Este intento no es de tu academia.", success: null };
  }

  // Verificar que la pregunta existe y es writing_task
  const { data: question } = await admin
    .from("questions")
    .select("id, question_type")
    .eq("id", questionId)
    .maybeSingle();

  if (!question || question.question_type !== "writing_task") {
    return { error: "La pregunta no es de tipo Writing.", success: null };
  }

  // Upsert corrección
  const now = new Date().toISOString();
  const { error: upsertError } = await admin.from("writing_corrections").upsert(
    {
      attempt_id: attemptId,
      question_id: questionId,
      student_id: attempt.student_id,
      teacher_id: profile.id,
      academy_id: attempt.academy_id,
      content_score: contentScore,
      communicative_score: communicativeScore,
      organisation_score: organisationScore,
      language_score: languageScore,
      total_score: totalScore,
      feedback: feedback || null,
      status: "completed",
      corrected_at: now,
      updated_at: now,
    },
    { onConflict: "attempt_id,question_id" }
  );

  if (upsertError) {
    return {
      error: `No se pudo guardar la corrección: ${upsertError.message}`,
      success: null,
    };
  }

  // Actualizar también el answer.points_earned para que el desglose por parte lo refleje
  await admin
    .from("answers")
    .update({
      points_earned: totalScore,
      is_correct: totalScore >= 12, // 60% del máximo — umbral aproximado de "pass"
      updated_at: now,
    })
    .eq("attempt_id", attemptId)
    .eq("question_id", questionId);

  // Recalcular score total del intento
  try {
    await recalculateAttemptScore(attemptId);
  } catch (e) {
    console.error("Recalculate failed:", e);
  }

  // ─── Notificación email al alumno (Fase C.2) ─────────────────
  // Se envía solo si:
  //   · notifyStudent=true (checkbox marcado en el form)
  //   · el alumno NO es individual (los individuales no reciben este email)
  //   · no se envió antes (notification_sent_at IS NULL)
  if (notifyStudent) {
    try {
      // Cargar la corrección recién guardada para saber si ya se notificó
      const { data: correction } = await admin
        .from("writing_corrections")
        .select("id, notification_sent_at")
        .eq("attempt_id", attemptId)
        .eq("question_id", questionId)
        .maybeSingle();

      if (correction && !correction.notification_sent_at) {
        // Cargar datos del alumno
        const { data: student } = await admin
          .from("profiles")
          .select("id, full_name, email, is_individual, academy_id")
          .eq("id", attempt.student_id)
          .maybeSingle();

        const isIndividual = Boolean(
          (student as unknown as Record<string, unknown>)?.is_individual
        );

        if (student && student.email && !isIndividual) {
          // Cargar datos del examen y del paper
          const { data: examData } = await admin
            .from("exams")
            .select("id, title, level")
            .eq("id", (attempt as unknown as Record<string, unknown>).exam_id as string)
            .maybeSingle();

          // Buscar el paper que contiene esta question
          const { data: paperData } = await admin
            .from("questions")
            .select("part:parts(paper:exam_papers(id, code, title))")
            .eq("id", questionId)
            .maybeSingle();

          const paper = (paperData as unknown as {
            part?: { paper?: { code: string; title: string } };
          } | null)?.part?.paper;

          // Cargar academia
          const { data: academyData } = student.academy_id
            ? await admin
                .from("academies")
                .select("name")
                .eq("id", student.academy_id)
                .maybeSingle()
            : { data: null };

          if (examData && paper) {
            const { sendWritingCorrectionEmail } = await import(
              "@/lib/email/writing-correction"
            );
            const { siteConfig } = await import("@/lib/site-config");

            const resultUrl = `${siteConfig.url}/alumno/examenes/${examData.id}/${paper.code}/resultado`;

            const emailResult = await sendWritingCorrectionEmail({
              studentEmail: student.email,
              studentName: student.full_name ?? "alumno",
              teacherName: profile.full_name ?? null,
              academyName: academyData?.name ?? "Acertlio",
              examTitle: examData.title,
              examLevel: examData.level,
              paperName: paper.title || "Writing",
              totalScore,
              maxScore: 20,
              hasFeedback: Boolean(feedback),
              resultUrl,
            });

            // Marcar como notificado
            if (emailResult.success) {
              await admin
                .from("writing_corrections")
                .update({
                  notification_sent_at: new Date().toISOString(),
                })
                .eq("id", correction.id);
            }
          }
        }
      }
    } catch (e) {
      // No bloqueamos el guardado si el email falla — solo lo logueamos
      console.error("Writing correction email failed:", e);
    }
  }

  revalidatePath(`/profesor/simulacros/${attemptId}`);
  revalidatePath(`/profesor/simulacros`);
  revalidatePath(`/alumno/examen/${attemptId}/enviado`);
  revalidatePath(`/alumno/examen/${attemptId}/revisar`);

  if (redirectTo) {
    redirect(redirectTo);
  }

  return { error: null, success: "Corrección guardada." };
}
