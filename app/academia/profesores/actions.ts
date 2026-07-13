"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AssignmentActionResult = {
  error: string | null;
  success: string | null;
};

/**
 * Asigna un alumno a un profesor.
 * Un alumno puede tener 1 profesor a la vez — si ya tiene, se reemplaza.
 * Un profesor puede tener N alumnos.
 *
 * Solo puede hacerlo el academy_admin de la academia.
 */
export async function assignStudentAction(
  teacherId: string,
  studentId: string
): Promise<AssignmentActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado.", success: null };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role, academy_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !adminProfile ||
    !adminProfile.academy_id ||
    !["academy_admin", "super_admin"].includes(adminProfile.role)
  ) {
    return { error: "Sin permiso para asignar.", success: null };
  }

  const admin = createAdminClient();

  // Verificar que profesor y alumno pertenecen a la academia del admin
  const { data: teacher } = await admin
    .from("profiles")
    .select("id, academy_id, role, full_name")
    .eq("id", teacherId)
    .maybeSingle();

  const { data: student } = await admin
    .from("profiles")
    .select("id, academy_id, role, full_name")
    .eq("id", studentId)
    .maybeSingle();

  if (
    !teacher ||
    !student ||
    teacher.role !== "teacher" ||
    student.role !== "student"
  ) {
    return { error: "Profesor o alumno no válido.", success: null };
  }

  if (
    adminProfile.role !== "super_admin" &&
    (teacher.academy_id !== adminProfile.academy_id ||
      student.academy_id !== adminProfile.academy_id)
  ) {
    return { error: "Los usuarios no pertenecen a tu academia.", success: null };
  }

  // Quitar asignación previa del alumno (si tiene otro profesor)
  await admin
    .from("teacher_students")
    .delete()
    .eq("student_id", studentId);

  // Crear nueva asignación
  const { error } = await admin.from("teacher_students").insert({
    teacher_id: teacherId,
    student_id: studentId,
    academy_id: teacher.academy_id!,
  });

  if (error) {
    return { error: `No se pudo asignar: ${error.message}`, success: null };
  }

  revalidatePath("/academia/profesores");
  revalidatePath(`/academia/profesores/${teacherId}`);
  revalidatePath("/profesor");
  revalidatePath("/profesor/alumnos");

  return {
    error: null,
    success: `${student.full_name ?? "El alumno"} asignado a ${teacher.full_name ?? "el profesor"}.`,
  };
}

/**
 * Quita la asignación de un alumno respecto a su profesor.
 */
export async function unassignStudentAction(
  studentId: string
): Promise<AssignmentActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado.", success: null };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role, academy_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !adminProfile ||
    !["academy_admin", "super_admin"].includes(adminProfile.role)
  ) {
    return { error: "Sin permiso.", success: null };
  }

  const admin = createAdminClient();
  await admin.from("teacher_students").delete().eq("student_id", studentId);

  revalidatePath("/academia/profesores");

  return { error: null, success: "Asignación eliminada." };
}
