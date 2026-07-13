"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getExamFormat } from "@/lib/exams/formats";
import type { CambridgeLevel } from "@/lib/supabase/types";

export type ExamActionResult = {
  error: string | null;
  success: string | null;
};

/**
 * Chequeo común: solo super_admin puede gestionar exámenes.
 * Los exámenes son un catálogo global compartido entre academias.
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
    return "Solo el superadmin puede gestionar exámenes.";
  }
  return null;
}

/**
 * Crea un examen nuevo.
 *
 * Si `generateStructure` es true, además crea automáticamente todas las
 * partes vacías con la estructura oficial del nivel (según lib/exams/formats.ts).
 * Solo faltará meter el contenido de las preguntas dentro de cada parte.
 */
export async function createExamAction(
  _prev: ExamActionResult,
  formData: FormData
): Promise<ExamActionResult> {
  const authError = await assertSuperAdmin();
  if (authError) return { error: authError, success: null };

  const title = String(formData.get("title") ?? "").trim();
  const levelRaw = String(formData.get("level") ?? "").trim();
  const mockNumberRaw = String(formData.get("mockNumber") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const generateStructure = formData.get("generateStructure") === "on";

  if (!title || title.length < 3) {
    return { error: "El título es obligatorio (min. 3 caracteres).", success: null };
  }
  if (!["A2", "B1", "B2", "C1", "C2"].includes(levelRaw)) {
    return { error: "Nivel no válido.", success: null };
  }
  const level = levelRaw as CambridgeLevel;
  const mockNumber = mockNumberRaw ? parseInt(mockNumberRaw, 10) : null;
  if (mockNumberRaw && (isNaN(mockNumber!) || mockNumber! < 1)) {
    return { error: "Número de mock inválido.", success: null };
  }

  const format = getExamFormat(level);
  const admin = createAdminClient();

  // Crear el examen
  const { data: exam, error: examError } = await admin
    .from("exams")
    .insert({
      title,
      level,
      mock_number: mockNumber,
      description,
      total_time_minutes: format.totalTimeMinutes,
      is_published: false,
      version: 1,
    })
    .select("id")
    .single();

  if (examError || !exam) {
    return {
      error: `No se pudo crear el examen: ${examError?.message ?? "desconocido"}`,
      success: null,
    };
  }

  // Si el admin pidió generar la estructura, creamos todas las partes vacías
  if (generateStructure) {
    const partRows = format.parts.map((p, idx) => ({
      exam_id: exam.id,
      skill: p.skill,
      part_number: p.partNumber,
      title: p.title,
      instructions: p.focus,
      time_minutes: p.timeMinutes ?? null,
      order_index: idx,
      settings: { question_type_hint: p.questionType, expected_count: p.questionCount },
    }));

    const { error: partsError } = await admin.from("exam_parts").insert(partRows);
    if (partsError) {
      // El examen ya existe, no lo borramos. Solo avisamos.
      return {
        error: null,
        success: `Examen creado, pero las partes no se generaron (${partsError.message}). Puedes crearlas manualmente.`,
      };
    }
  }

  revalidatePath("/admin/examenes");
  redirect(`/admin/examenes/${exam.id}`);
}

/**
 * Alterna el estado publicado del examen.
 */
export async function toggleExamPublishAction(
  _prev: ExamActionResult,
  formData: FormData
): Promise<ExamActionResult> {
  const authError = await assertSuperAdmin();
  if (authError) return { error: authError, success: null };

  const examId = String(formData.get("examId") ?? "").trim();
  if (!examId) return { error: "Falta el ID del examen.", success: null };

  const admin = createAdminClient();
  const { data: exam } = await admin
    .from("exams")
    .select("id, is_published")
    .eq("id", examId)
    .maybeSingle();

  if (!exam) return { error: "Examen no encontrado.", success: null };

  const newState = !exam.is_published;
  await admin.from("exams").update({ is_published: newState }).eq("id", examId);

  revalidatePath("/admin/examenes");
  revalidatePath(`/admin/examenes/${examId}`);
  return {
    error: null,
    success: newState
      ? "Examen publicado — ya lo ven todas las academias."
      : "Examen despublicado.",
  };
}

/**
 * Elimina un examen. Solo permitido si no hay intentos hechos sobre él.
 * Si hay intentos, el borrado en cascada de attempts + answers los perdería.
 */
export async function deleteExamAction(
  _prev: ExamActionResult,
  formData: FormData
): Promise<ExamActionResult> {
  const authError = await assertSuperAdmin();
  if (authError) return { error: authError, success: null };

  const examId = String(formData.get("examId") ?? "").trim();
  if (!examId) return { error: "Falta el ID del examen.", success: null };

  const admin = createAdminClient();

  // Chequear que no haya intentos
  const { count: attemptCount } = await admin
    .from("attempts")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", examId);

  if ((attemptCount ?? 0) > 0) {
    return {
      error: `No se puede borrar: hay ${attemptCount} intento(s) sobre este examen. Despublícalo en su lugar.`,
      success: null,
    };
  }

  await admin.from("exams").delete().eq("id", examId);

  revalidatePath("/admin/examenes");
  redirect("/admin/examenes");
}
