"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AcademyActionResult = {
  error: string | null;
  success: string | null;
};

/**
 * Libera una licencia archivando al alumno que la ocupa.
 * El alumno pasa a is_active=false y la licencia queda vacía otra vez.
 * Solo puede hacerlo el academy_admin de esa academia.
 */
export async function releaseLicenseAction(
  _prev: AcademyActionResult,
  formData: FormData
): Promise<AcademyActionResult> {
  const licenseId = String(formData.get("licenseId") ?? "").trim();
  if (!licenseId) return { error: "Falta el ID de licencia.", success: null };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado.", success: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, academy_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    !["academy_admin", "super_admin"].includes(profile.role) ||
    !profile.academy_id
  ) {
    return { error: "Sin permisos para liberar licencias.", success: null };
  }

  const admin = createAdminClient();

  // Verificar que la licencia pertenece a esta academia
  const { data: license } = await admin
    .from("licenses")
    .select("id, academy_id, student_id")
    .eq("id", licenseId)
    .maybeSingle();

  if (!license || license.academy_id !== profile.academy_id) {
    return { error: "Licencia no encontrada.", success: null };
  }

  if (!license.student_id) {
    return { error: "Esta licencia ya está libre.", success: null };
  }

  // Archivar al alumno (is_active=false) y liberar la licencia
  await admin
    .from("profiles")
    .update({ is_active: false })
    .eq("id", license.student_id);

  await admin
    .from("licenses")
    .update({
      student_id: null,
      assigned_at: null,
      released_at: new Date().toISOString(),
    })
    .eq("id", licenseId);

  revalidatePath("/academia/licencias");
  revalidatePath("/academia/alumnos");
  revalidatePath("/academia");
  return { error: null, success: "Licencia liberada. El alumno queda archivado." };
}

/**
 * Actualiza los datos de la academia (nombre, CIF, teléfono, dirección, etc.).
 * Solo puede hacerlo el academy_admin.
 */
export async function updateAcademyAction(
  _prev: AcademyActionResult,
  formData: FormData
): Promise<AcademyActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado.", success: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, academy_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    !["academy_admin", "super_admin"].includes(profile.role) ||
    !profile.academy_id
  ) {
    return { error: "Sin permisos.", success: null };
  }

  const name = String(formData.get("name") ?? "").trim();
  const cif = String(formData.get("cif") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;

  if (!name || name.length < 3) {
    return { error: "El nombre debe tener al menos 3 caracteres.", success: null };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("academies")
    .update({ name, cif, phone, address, city })
    .eq("id", profile.academy_id);

  if (error) {
    return { error: `Error al guardar: ${error.message}`, success: null };
  }

  revalidatePath("/academia");
  revalidatePath("/academia/configuracion");
  return { error: null, success: "Datos actualizados correctamente." };
}

/**
 * Asigna un alumno a un profesor. Ambos deben ser de la misma academia.
 */
export async function assignStudentToTeacherAction(
  _prev: AcademyActionResult,
  formData: FormData
): Promise<AcademyActionResult> {
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();

  if (!teacherId || !studentId) {
    return { error: "Faltan datos.", success: null };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado.", success: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, academy_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    !["academy_admin", "super_admin"].includes(profile.role) ||
    !profile.academy_id
  ) {
    return { error: "Sin permisos.", success: null };
  }

  const admin = createAdminClient();

  // Verificar que ambos son de la misma academia
  const { data: bothProfiles } = await admin
    .from("profiles")
    .select("id, academy_id, role")
    .in("id", [teacherId, studentId]);

  if (!bothProfiles || bothProfiles.length !== 2) {
    return { error: "Profesor o alumno no encontrados.", success: null };
  }

  if (
    bothProfiles.some(
      (p) => p.academy_id !== profile.academy_id
    )
  ) {
    return { error: "Ambos deben ser de tu academia.", success: null };
  }

  const teacher = bothProfiles.find((p) => p.id === teacherId);
  const student = bothProfiles.find((p) => p.id === studentId);

  if (teacher?.role !== "teacher" || student?.role !== "student") {
    return { error: "Los roles no coinciden.", success: null };
  }

  const { error } = await admin.from("teacher_students").upsert(
    {
      teacher_id: teacherId,
      student_id: studentId,
      academy_id: profile.academy_id,
    },
    { onConflict: "teacher_id,student_id" }
  );

  if (error) {
    return { error: `Error: ${error.message}`, success: null };
  }

  revalidatePath("/academia/profesores");
  revalidatePath(`/academia/profesores/${teacherId}`);
  revalidatePath("/profesor/alumnos");
  return { error: null, success: "Alumno asignado al profesor." };
}

/**
 * Quita la asignación entre profesor y alumno.
 */
export async function unassignStudentFromTeacherAction(
  _prev: AcademyActionResult,
  formData: FormData
): Promise<AcademyActionResult> {
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();

  if (!teacherId || !studentId) {
    return { error: "Faltan datos.", success: null };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado.", success: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, academy_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    !["academy_admin", "super_admin"].includes(profile.role) ||
    !profile.academy_id
  ) {
    return { error: "Sin permisos.", success: null };
  }

  const admin = createAdminClient();
  await admin
    .from("teacher_students")
    .delete()
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .eq("academy_id", profile.academy_id);

  revalidatePath("/academia/profesores");
  revalidatePath(`/academia/profesores/${teacherId}`);
  revalidatePath("/profesor/alumnos");
  return { error: null, success: "Asignación eliminada." };
}
