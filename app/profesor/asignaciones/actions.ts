"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/user";
import { revalidatePath } from "next/cache";
import { sendAssignmentEmail } from "@/lib/email/assignment";

// ─── Crear asignación (bulk) ──────────────────────────────────────────

/**
 * Crea asignaciones de un mock para uno o varios alumnos.
 *
 * Reglas:
 *   - Solo profesores y admins de academia pueden crear
 *   - Solo pueden asignar a alumnos de su academia
 *   - Los profesores solo pueden asignar a alumnos que enseñan (is_teacher_of)
 *   - due_date opcional. Si se pasa, debe ser futura.
 *
 * Emite email al alumno tras crear cada asignación (best-effort).
 */
export async function createAssignmentsAction(input: {
  examId: string;
  studentIds: string[];
  dueDate: string | null; // ISO 8601 o null
}): Promise<{ error?: string; created?: number }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const { profile } = user;
  const isAdmin = profile.role === "academy_admin";
  const isTeacher = profile.role === "teacher";

  if (!isAdmin && !isTeacher) {
    return { error: "No tienes permiso para asignar exámenes." };
  }

  if (!profile.academy_id) {
    return { error: "Tu cuenta no está asociada a una academia." };
  }

  if (input.studentIds.length === 0) {
    return { error: "Selecciona al menos un alumno." };
  }

  // Validar due_date si viene
  if (input.dueDate) {
    const d = new Date(input.dueDate);
    if (isNaN(d.getTime())) {
      return { error: "Fecha límite inválida." };
    }
    if (d.getTime() <= Date.now()) {
      return { error: "La fecha límite debe ser futura." };
    }
  }

  const admin = createAdminClient();

  // Verificar que el examen existe y está publicado
  const { data: exam } = await admin
    .from("exams")
    .select("id, title, level, is_published")
    .eq("id", input.examId)
    .maybeSingle();

  if (!exam || !exam.is_published) {
    return { error: "El examen no existe o no está publicado." };
  }

  // Verificar que los alumnos son de la academia
  const { data: students, error: studentsErr } = await admin
    .from("profiles")
    .select("id, full_name, email, academy_id, role, current_level")
    .in("id", input.studentIds);

  if (studentsErr) {
    console.error("[Asignar simulacro] Error cargando profiles:", studentsErr);
    return { error: "No se pudieron cargar los alumnos seleccionados." };
  }

  console.log(
    `[Asignar simulacro] Alumnos solicitados: ${input.studentIds.length} · encontrados: ${students?.length ?? 0}`
  );

  const validStudents = (students ?? []).filter(
    (s) => s.academy_id === profile.academy_id && s.role === "student"
  );

  if (validStudents.length === 0) {
    return { error: "Ningún alumno válido en la selección." };
  }

  // Si es teacher (no admin), filtrar solo los que enseña
  // Fuentes: (1) teacher_students directo (2) miembros de sus grupos
  let allowedIds = validStudents.map((s) => s.id);
  if (isTeacher) {
    const [tsRes, myGroups] = await Promise.all([
      admin
        .from("teacher_students")
        .select("student_id")
        .eq("teacher_id", user.id)
        .in("student_id", allowedIds),
      admin
        .from("student_groups")
        .select("id")
        .eq("teacher_id", user.id),
    ]);

    const directIds = (tsRes.data ?? []).map((r) => r.student_id);

    let groupStudentIds: string[] = [];
    const groupIds = (myGroups.data ?? []).map((g) => g.id);
    if (groupIds.length > 0) {
      const { data: members } = await admin
        .from("student_group_members")
        .select("student_id")
        .in("group_id", groupIds)
        .in("student_id", allowedIds);
      groupStudentIds = (members ?? []).map((m) => m.student_id);
    }

    allowedIds = Array.from(new Set([...directIds, ...groupStudentIds]));

    console.log(
      `[Asignar simulacro] teacher=${user.id} · direct=${directIds.length} · fromGroups=${groupStudentIds.length} · finalAllowed=${allowedIds.length}`
    );

    if (allowedIds.length === 0) {
      return { error: "Solo puedes asignar a alumnos que enseñas." };
    }
  }

  // Datos de la academia (para el email)
  const { data: academy } = await admin
    .from("academies")
    .select("name")
    .eq("id", profile.academy_id)
    .maybeSingle();

  // Crear inserts idempotentes: si ya existe una asignación para el mismo
  // exam+student pendiente, saltarla; si estaba completed/cancelled, permitir
  // crear una nueva (D4: opción A, permitir repetir).

  const now = new Date().toISOString();
  const inserts = allowedIds.map((sid) => ({
    exam_id: input.examId,
    student_id: sid,
    assigned_by: user.id,
    academy_id: profile.academy_id!,
    due_date: input.dueDate,
    status: "pending" as const,
    created_at: now,
    updated_at: now,
  }));

  const { data: created, error } = await admin
    .from("assignments")
    .insert(inserts)
    .select("id, student_id");

  if (error) {
    return { error: `No se pudieron crear las asignaciones: ${error.message}` };
  }

  const createdCount = created?.length ?? 0;

  // Enviar emails (best effort — no bloqueamos si fallan)
  if (createdCount > 0 && academy) {
    const studentById = new Map<
      string,
      { name: string; email: string }
    >();
    validStudents.forEach((s) =>
      studentById.set(s.id, { name: s.full_name, email: s.email })
    );

    const assignmentUrl = "https://acertlio.com/alumno";

    // Enviamos en paralelo, con Promise.allSettled para no fallar si uno falla
    await Promise.allSettled(
      (created ?? []).map(async (a) => {
        const stu = studentById.get(a.student_id);
        if (!stu) return;
        const emailResult = await sendAssignmentEmail({
          studentEmail: stu.email,
          studentName: stu.name,
          teacherName: profile.full_name ?? null,
          academyName: academy.name,
          examTitle: exam.title,
          examLevel: exam.level,
          dueDate: input.dueDate,
          assignmentUrl,
        });

        // Rastrear el envío en assignment_notifications
        if (emailResult.success) {
          await admin.from("assignment_notifications").insert({
            assignment_id: a.id,
            student_id: a.student_id,
            kind: "assigned",
            email_provider_id: emailResult.messageId ?? null,
          });
        }
      })
    );
  }

  revalidatePath("/profesor/asignaciones");
  revalidatePath("/alumno");

  return { created: createdCount };
}


// ─── Cancelar asignación ──────────────────────────────────────────────

export async function cancelAssignmentAction(input: {
  assignmentId: string;
}): Promise<{ error?: string; ok?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  const { data: a } = await admin
    .from("assignments")
    .select("id, assigned_by, academy_id, status")
    .eq("id", input.assignmentId)
    .maybeSingle();

  if (!a) return { error: "Asignación no encontrada." };

  const { profile } = user;
  const canCancel =
    a.assigned_by === user.id ||
    (a.academy_id === profile.academy_id && profile.role === "academy_admin");

  if (!canCancel) return { error: "No tienes permiso para cancelar esta asignación." };

  if (a.status === "completed") {
    return { error: "No se puede cancelar una asignación ya completada." };
  }

  const { error } = await admin
    .from("assignments")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.assignmentId);

  if (error) return { error: error.message };

  revalidatePath("/profesor/asignaciones");
  revalidatePath("/alumno");
  return { ok: true };
}


// ─── Actualizar deadline ──────────────────────────────────────────────

export async function updateDueDateAction(input: {
  assignmentId: string;
  dueDate: string | null;
}): Promise<{ error?: string; ok?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "No hay sesión de usuario." };

  const admin = createAdminClient();

  const { data: a } = await admin
    .from("assignments")
    .select("id, assigned_by, academy_id")
    .eq("id", input.assignmentId)
    .maybeSingle();

  if (!a) return { error: "Asignación no encontrada." };

  const { profile } = user;
  const canEdit =
    a.assigned_by === user.id ||
    (a.academy_id === profile.academy_id && profile.role === "academy_admin");

  if (!canEdit) return { error: "No tienes permiso." };

  if (input.dueDate) {
    const d = new Date(input.dueDate);
    if (isNaN(d.getTime())) return { error: "Fecha inválida." };
  }

  const { error } = await admin
    .from("assignments")
    .update({
      due_date: input.dueDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.assignmentId);

  if (error) return { error: error.message };
  revalidatePath("/profesor/asignaciones");
  return { ok: true };
}
