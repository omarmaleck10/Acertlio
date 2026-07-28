"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/user";

const VALID_LEVELS = ["A2", "B1", "B2", "C1", "C2"] as const;


async function assertAcademyAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." as string };
  if (
    user.profile.role !== "academy_admin" &&
    user.profile.role !== "super_admin"
  ) {
    return { error: "Solo el admin de la academia puede gestionar grupos." };
  }
  if (!user.profile.academy_id) {
    return { error: "Tu cuenta no está vinculada a una academia." };
  }
  return { user };
}


// ─── Crear grupo ─────────────────────────────────────────────────────

export async function createGroupAction(input: {
  name: string;
  level: string | null;
  teacherId: string;
  description: string | null;
  memberIds: string[];
}): Promise<{ error?: string; groupId?: string }> {
  const check = await assertAcademyAdmin();
  if ("error" in check) return { error: check.error };
  const { user } = check;

  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) {
    return { error: "El nombre debe tener entre 2 y 80 caracteres." };
  }

  const level = input.level?.trim() || null;
  if (level && !VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
    return { error: "Nivel no válido." };
  }

  const admin = createAdminClient();

  // Verificar que el profesor pertenece a la academia
  const { data: teacher } = await admin
    .from("profiles")
    .select("id, role, academy_id")
    .eq("id", input.teacherId)
    .maybeSingle();

  if (
    !teacher ||
    teacher.academy_id !== user.profile.academy_id ||
    (teacher.role !== "teacher" && teacher.role !== "academy_admin")
  ) {
    return { error: "El profesor no pertenece a tu academia." };
  }

  // Crear grupo
  const { data: created, error: createErr } = await admin
    .from("student_groups")
    .insert({
      academy_id: user.profile.academy_id,
      teacher_id: input.teacherId,
      name,
      level,
      description: input.description?.trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (createErr || !created) {
    return { error: `No se pudo crear el grupo: ${createErr?.message ?? "error"}` };
  }

  // Añadir miembros si vienen
  if (input.memberIds.length > 0) {
    // Verificar que son alumnos de la academia
    const { data: validStudents } = await admin
      .from("profiles")
      .select("id")
      .in("id", input.memberIds)
      .eq("academy_id", user.profile.academy_id)
      .eq("role", "student");

    const validIds = (validStudents ?? []).map((s) => s.id);

    if (validIds.length > 0) {
      await admin.from("student_group_members").insert(
        validIds.map((sid) => ({
          group_id: created.id,
          student_id: sid,
          added_by: user.id,
        }))
      );
    }
  }

  revalidatePath("/academia/grupos");
  return { groupId: created.id };
}


// ─── Actualizar grupo ────────────────────────────────────────────────

export async function updateGroupAction(input: {
  groupId: string;
  name: string;
  level: string | null;
  teacherId: string;
  description: string | null;
}): Promise<{ error?: string; ok?: boolean }> {
  const check = await assertAcademyAdmin();
  if ("error" in check) return { error: check.error };
  const { user } = check;

  const admin = createAdminClient();

  const { data: group } = await admin
    .from("student_groups")
    .select("id, academy_id")
    .eq("id", input.groupId)
    .maybeSingle();

  if (!group) return { error: "Grupo no encontrado." };
  if (group.academy_id !== user.profile.academy_id) {
    return { error: "Este grupo no es de tu academia." };
  }

  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) {
    return { error: "El nombre debe tener entre 2 y 80 caracteres." };
  }

  const level = input.level?.trim() || null;
  if (level && !VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
    return { error: "Nivel no válido." };
  }

  // Verificar profesor
  const { data: teacher } = await admin
    .from("profiles")
    .select("id, role, academy_id")
    .eq("id", input.teacherId)
    .maybeSingle();

  if (
    !teacher ||
    teacher.academy_id !== user.profile.academy_id ||
    (teacher.role !== "teacher" && teacher.role !== "academy_admin")
  ) {
    return { error: "El profesor no pertenece a tu academia." };
  }

  const { error } = await admin
    .from("student_groups")
    .update({
      name,
      level,
      teacher_id: input.teacherId,
      description: input.description?.trim() || null,
    })
    .eq("id", input.groupId);

  if (error) return { error: error.message };

  revalidatePath("/academia/grupos");
  revalidatePath(`/academia/grupos/${input.groupId}`);
  return { ok: true };
}


// ─── Archivar grupo (soft delete) ────────────────────────────────────

export async function archiveGroupAction(input: {
  groupId: string;
}): Promise<{ error?: string; ok?: boolean }> {
  const check = await assertAcademyAdmin();
  if ("error" in check) return { error: check.error };
  const { user } = check;

  const admin = createAdminClient();

  const { data: group } = await admin
    .from("student_groups")
    .select("id, academy_id")
    .eq("id", input.groupId)
    .maybeSingle();

  if (!group) return { error: "Grupo no encontrado." };
  if (group.academy_id !== user.profile.academy_id) {
    return { error: "Este grupo no es de tu academia." };
  }

  const { error } = await admin
    .from("student_groups")
    .update({ is_archived: true })
    .eq("id", input.groupId);

  if (error) return { error: error.message };

  revalidatePath("/academia/grupos");
  return { ok: true };
}


// ─── Eliminar grupo (hard delete) ────────────────────────────────────

export async function deleteGroupAction(input: {
  groupId: string;
}): Promise<{ error?: string; ok?: boolean }> {
  const check = await assertAcademyAdmin();
  if ("error" in check) return { error: check.error };
  const { user } = check;

  const admin = createAdminClient();

  const { data: group } = await admin
    .from("student_groups")
    .select("id, academy_id")
    .eq("id", input.groupId)
    .maybeSingle();

  if (!group) return { error: "Grupo no encontrado." };
  if (group.academy_id !== user.profile.academy_id) {
    return { error: "Este grupo no es de tu academia." };
  }

  const { error } = await admin
    .from("student_groups")
    .delete()
    .eq("id", input.groupId);

  if (error) return { error: error.message };

  revalidatePath("/academia/grupos");
  redirect("/academia/grupos");
}


// ─── Añadir alumnos al grupo ─────────────────────────────────────────

export async function addStudentsToGroupAction(input: {
  groupId: string;
  studentIds: string[];
}): Promise<{ error?: string; added?: number }> {
  const check = await assertAcademyAdmin();
  if ("error" in check) return { error: check.error };
  const { user } = check;

  if (input.studentIds.length === 0) {
    return { error: "Selecciona al menos un alumno." };
  }

  const admin = createAdminClient();

  const { data: group } = await admin
    .from("student_groups")
    .select("id, academy_id")
    .eq("id", input.groupId)
    .maybeSingle();

  if (!group) return { error: "Grupo no encontrado." };
  if (group.academy_id !== user.profile.academy_id) {
    return { error: "Este grupo no es de tu academia." };
  }

  // Filtrar alumnos válidos
  const { data: validStudents } = await admin
    .from("profiles")
    .select("id")
    .in("id", input.studentIds)
    .eq("academy_id", user.profile.academy_id)
    .eq("role", "student");

  const validIds = (validStudents ?? []).map((s) => s.id);
  if (validIds.length === 0) {
    return { error: "Ningún alumno válido." };
  }

  // Filtrar los que YA son miembros para evitar violar el unique
  const { data: existing } = await admin
    .from("student_group_members")
    .select("student_id")
    .eq("group_id", input.groupId)
    .in("student_id", validIds);

  const existingSet = new Set((existing ?? []).map((r) => r.student_id));
  const toInsert = validIds.filter((id) => !existingSet.has(id));

  if (toInsert.length === 0) {
    return { error: "Estos alumnos ya están en el grupo." };
  }

  const { error } = await admin.from("student_group_members").insert(
    toInsert.map((sid) => ({
      group_id: input.groupId,
      student_id: sid,
      added_by: user.id,
    }))
  );

  if (error) return { error: error.message };

  revalidatePath(`/academia/grupos/${input.groupId}`);
  return { added: toInsert.length };
}


// ─── Quitar alumno del grupo ─────────────────────────────────────────

export async function removeStudentFromGroupAction(input: {
  groupId: string;
  studentId: string;
}): Promise<{ error?: string; ok?: boolean }> {
  const check = await assertAcademyAdmin();
  if ("error" in check) return { error: check.error };
  const { user } = check;

  const admin = createAdminClient();

  const { data: group } = await admin
    .from("student_groups")
    .select("id, academy_id")
    .eq("id", input.groupId)
    .maybeSingle();

  if (!group) return { error: "Grupo no encontrado." };
  if (group.academy_id !== user.profile.academy_id) {
    return { error: "Este grupo no es de tu academia." };
  }

  const { error } = await admin
    .from("student_group_members")
    .delete()
    .eq("group_id", input.groupId)
    .eq("student_id", input.studentId);

  if (error) return { error: error.message };

  revalidatePath(`/academia/grupos/${input.groupId}`);
  return { ok: true };
}
