"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/brevo";
import { inviteTeacherEmail, inviteStudentEmail } from "@/lib/email/templates";
import { siteConfig } from "@/lib/site-config";
import type { CambridgeLevel, UserRole } from "@/lib/supabase/types";

export type InviteResult = {
  error: string | null;
  success: string | null;
};

const initial: InviteResult = { error: null, success: null };

/**
 * Base común para invitar profesor o alumno.
 *
 * Reglas de negocio:
 *  - Solo academy_admin (y super_admin) puede invitar
 *  - El email no puede coincidir con uno ya registrado (auth.users)
 *  - Si ya hay una invitación pendiente para ese email en esa academia, la cancelamos
 *    y creamos una nueva (para que el token sea fresco)
 *  - Para alumnos: se necesita al menos una licencia libre en la academia
 */
async function inviteBase(params: {
  email: string;
  role: UserRole;
  level?: CambridgeLevel | null;
}): Promise<InviteResult> {
  const supabase = createClient();

  // 1. Verificar quién invita
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado.", success: null };

  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("id, role, academy_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !inviterProfile ||
    !["academy_admin", "super_admin"].includes(inviterProfile.role)
  ) {
    return { error: "No tienes permiso para invitar usuarios.", success: null };
  }

  if (!inviterProfile.academy_id) {
    return {
      error: "Tu cuenta no está asociada a ninguna academia.",
      success: null,
    };
  }

  // 2. Info de la academia
  const admin = createAdminClient();
  const { data: academy } = await admin
    .from("academies")
    .select("name, total_seats")
    .eq("id", inviterProfile.academy_id)
    .maybeSingle();

  if (!academy) {
    return { error: "No se ha encontrado la academia.", success: null };
  }

  // 3. Comprobar si el email ya está registrado como usuario
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", params.email)
    .maybeSingle();

  if (existingProfile) {
    return {
      error: "Ya hay una cuenta activa con ese email.",
      success: null,
    };
  }

  // 4. Para alumnos: comprobar que hay licencias libres
  if (params.role === "student") {
    const { count: freeLicenses } = await admin
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("academy_id", inviterProfile.academy_id)
      .is("student_id", null)
      .eq("is_active", true);

    if ((freeLicenses ?? 0) < 1) {
      return {
        error:
          "No quedan plazas libres. Libera una licencia o sube de plan antes de invitar más alumnos.",
        success: null,
      };
    }
  }

  // 5. Cancelar invitaciones pendientes anteriores al mismo email
  await admin
    .from("invitations")
    .delete()
    .eq("email", params.email)
    .eq("academy_id", inviterProfile.academy_id)
    .is("accepted_at", null);

  // 6. Crear nueva invitación (el token lo genera Postgres por defecto)
  const { data: invitation, error: invError } = await admin
    .from("invitations")
    .insert({
      academy_id: inviterProfile.academy_id,
      email: params.email,
      role: params.role,
      invited_by: inviterProfile.id,
    })
    .select("token")
    .single();

  if (invError || !invitation) {
    return {
      error: "No se ha podido crear la invitación. Inténtalo de nuevo.",
      success: null,
    };
  }

  // 7. Si es alumno con nivel, guardarlo temporalmente en un metadata
  //    (cuando acepte la invitación, se aplicará al profile)
  // De momento el nivel viaja como parte del subject del email; el profile
  // se completará en la Server Action de activate. Simplificamos: en Fase 2C
  // el nivel se asigna al aceptar. El academy_admin lo puede cambiar después.

  // 8. Enviar email de invitación (best effort — si falla, la invitación existe)
  const activationUrl = `${siteConfig.url}/activar/${invitation.token}`;
  const emailPayload =
    params.role === "teacher"
      ? inviteTeacherEmail({
          academyName: academy.name,
          inviterName: inviterProfile.full_name ?? "Tu academia",
          activationUrl,
        })
      : inviteStudentEmail({
          academyName: academy.name,
          inviterName: inviterProfile.full_name ?? "Tu academia",
          activationUrl,
          level: params.level ?? undefined,
        });

  const sendResult = await sendEmail({
    to: params.email,
    subject: emailPayload.subject,
    htmlContent: emailPayload.htmlContent,
    textContent: emailPayload.textContent,
  });

  if (!sendResult.success) {
    // El email falló pero la invitación existe.
    // El academy_admin puede reenviarla o darle el link manualmente.
    return {
      error: null,
      success: `Invitación creada, pero el email no ha podido enviarse (${sendResult.error}). Puedes reenviar la invitación desde el listado.`,
    };
  }

  return {
    error: null,
    success: `Invitación enviada a ${params.email}.`,
  };
}

/**
 * Server Action: invitar profesor
 */
export async function inviteTeacherAction(
  _prev: InviteResult,
  formData: FormData
): Promise<InviteResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Introduce un email válido.", success: null };
  }

  const result = await inviteBase({ email, role: "teacher" });
  revalidatePath("/academia/profesores");
  return result;
}

/**
 * Server Action: invitar alumno
 */
export async function inviteStudentAction(
  _prev: InviteResult,
  formData: FormData
): Promise<InviteResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const levelRaw = String(formData.get("level") ?? "").trim().toUpperCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Introduce un email válido.", success: null };
  }

  const level: CambridgeLevel | null = ["B1", "B2", "C1"].includes(levelRaw)
    ? (levelRaw as CambridgeLevel)
    : null;

  const result = await inviteBase({ email, role: "student", level });
  revalidatePath("/academia/alumnos");
  return result;
}

export { initial as initialInviteState };
