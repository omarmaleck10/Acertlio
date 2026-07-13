"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type LicenseActionResult = {
  error: string | null;
  success: string | null;
};

/**
 * Liberar una licencia: quita al alumno actual y marca la licencia como libre.
 * El alumno queda desactivado (is_active = false) pero no se borra —
 * conservamos su histórico de intentos.
 *
 * Solo puede hacerlo el academy_admin de esa academia (o superadmin).
 */
export async function releaseLicenseAction(
  licenseId: string
): Promise<LicenseActionResult> {
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
    !["academy_admin", "super_admin"].includes(profile.role)
  ) {
    return { error: "No tienes permiso para gestionar licencias.", success: null };
  }

  const admin = createAdminClient();

  // Buscar la licencia y verificar academia
  const { data: license } = await admin
    .from("licenses")
    .select("id, academy_id, student_id")
    .eq("id", licenseId)
    .maybeSingle();

  if (!license) {
    return { error: "Licencia no encontrada.", success: null };
  }

  if (
    profile.role !== "super_admin" &&
    license.academy_id !== profile.academy_id
  ) {
    return { error: "Esta licencia no pertenece a tu academia.", success: null };
  }

  if (!license.student_id) {
    return { error: "Esta licencia ya está libre.", success: null };
  }

  // Guardar el student_id para desactivarlo
  const studentId = license.student_id;

  // 1. Liberar la licencia
  const { error: releaseError } = await admin
    .from("licenses")
    .update({
      student_id: null,
      assigned_at: null,
      released_at: new Date().toISOString(),
    })
    .eq("id", licenseId);

  if (releaseError) {
    return { error: `Error al liberar: ${releaseError.message}`, success: null };
  }

  // 2. Desactivar el profile del alumno
  await admin
    .from("profiles")
    .update({ is_active: false })
    .eq("id", studentId);

  revalidatePath("/academia/licencias");
  revalidatePath("/academia/alumnos");
  revalidatePath("/academia");

  return { error: null, success: "Licencia liberada. El alumno queda archivado." };
}
