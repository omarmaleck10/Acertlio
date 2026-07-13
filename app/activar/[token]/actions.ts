"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dashboardPathForRole } from "@/lib/supabase/user";
import type { UserRole } from "@/lib/supabase/types";

export type ActivateResult = {
  error: string | null;
};

/**
 * Server Action: aceptar una invitación.
 *
 * Flujo:
 *  1. Verificar token válido (existe, no caducado, no aceptado)
 *  2. Crear auth.users con la contraseña que ha puesto
 *  3. Crear profile con el rol de la invitación y academia
 *  4. Si es student: asignar una licencia libre
 *  5. Marcar invitación como aceptada
 *  6. Login automático y redirect al dashboard
 */
export async function activateAccountAction(
  _prev: ActivateResult,
  formData: FormData
): Promise<ActivateResult> {
  const token = String(formData.get("token") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!token) return { error: "Falta el token de invitación." };
  if (!fullName || fullName.length < 3) {
    return { error: "Tu nombre es obligatorio (mínimo 3 caracteres)." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== passwordConfirm) {
    return { error: "Las contraseñas no coinciden." };
  }

  const admin = createAdminClient();

  // 1. Buscar la invitación
  const { data: invitation, error: invError } = await admin
    .from("invitations")
    .select("id, academy_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (invError || !invitation) {
    return { error: "Invitación no válida o ya utilizada." };
  }

  if (invitation.accepted_at) {
    return {
      error:
        "Esta invitación ya se ha aceptado. Si eres tú, prueba a iniciar sesión.",
    };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return {
      error:
        "Esta invitación ha caducado (más de 7 días). Pide a tu academia que te envíe una nueva.",
    };
  }

  const role = invitation.role as UserRole;
  if (!["academy_admin", "teacher", "student"].includes(role)) {
    return { error: "Rol de invitación no válido." };
  }

  // 2. Crear auth.users
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !authData.user) {
    if (authError?.message.toLowerCase().includes("already")) {
      return {
        error:
          "Ya existe una cuenta con ese email. Inicia sesión con tu contraseña.",
      };
    }
    return {
      error: "No se ha podido crear tu cuenta. Inténtalo de nuevo.",
    };
  }

  const userId = authData.user.id;

  try {
    // 3. Crear profile
    const { error: profileError } = await admin.from("profiles").insert({
      id: userId,
      academy_id: invitation.academy_id,
      role,
      email: invitation.email,
      full_name: fullName,
      is_active: true,
    });

    if (profileError) throw new Error(profileError.message);

    // 4. Si es student, asignar una licencia libre
    if (role === "student") {
      const { data: freeLicense } = await admin
        .from("licenses")
        .select("id")
        .eq("academy_id", invitation.academy_id)
        .is("student_id", null)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (freeLicense) {
        await admin
          .from("licenses")
          .update({
            student_id: userId,
            assigned_at: new Date().toISOString(),
          })
          .eq("id", freeLicense.id);
      }
      // Si no había licencia libre, el alumno queda creado pero sin plaza.
      // El academy_admin puede asignarle una más tarde.
    }

    // 5. Marcar invitación como aceptada
    await admin
      .from("invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    // 6. Login automático
    const supabase = createClient();
    await supabase.auth.signInWithPassword({
      email: invitation.email,
      password,
    });
  } catch (err) {
    // Rollback
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return {
      error:
        err instanceof Error
          ? `Error al activar tu cuenta: ${err.message}`
          : "Error inesperado al activar tu cuenta.",
    };
  }

  revalidatePath("/", "layout");
  redirect(dashboardPathForRole(role));
}
