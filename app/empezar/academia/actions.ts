"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/brevo";
import { welcomeAcademyEmail } from "@/lib/email/templates";
import type { AcademyPlan } from "@/lib/supabase/types";

export type SignUpAcademyResult = {
  error: string | null;
};

/**
 * Mapa de plan → número de plazas concurrentes iniciales.
 * Coincide con lo comunicado en /precios.
 */
const SEATS_BY_PLAN: Record<AcademyPlan, number> = {
  starter: 20,
  pro: 50,
  business: 100,
  enterprise: 250,
};

const PLAN_LABELS: Record<AcademyPlan, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

/**
 * Genera un slug URL-friendly a partir del nombre de academia.
 * Solo minúsculas, letras, números y guiones. Sin acentos.
 */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Registro completo de una academia + su primer academy_admin.
 *
 * Flujo (todo en el servidor):
 *  1. Validar entradas
 *  2. Crear auth.users con Supabase Auth (con auto-confirm)
 *  3. Con admin client (bypassa RLS), en orden:
 *     a. Crear academies row
 *     b. Crear profiles row con role='academy_admin'
 *     c. Crear las N licenses vacías del plan
 *     d. Crear subscription en trialing
 *  4. Enviar email de bienvenida (best effort)
 *  5. Login automático → redirect a /academia
 *
 * Si algo falla a mitad, hacemos cleanup del auth.users creado
 * para dejar todo consistente.
 */
export async function signUpAcademyAction(
  _prev: SignUpAcademyResult,
  formData: FormData
): Promise<SignUpAcademyResult> {
  // ─── 1. Validar entradas ─────────────────────────────────────────
  const academyName = String(formData.get("academyName") ?? "").trim();
  const cif = String(formData.get("cif") ?? "").trim() || null;
  const adminName = String(formData.get("adminName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const planRaw = String(formData.get("plan") ?? "starter");
  const acceptedTerms = formData.get("acceptTerms") === "on";

  if (!academyName || academyName.length < 3) {
    return { error: "El nombre de la academia es obligatorio (mín. 3 caracteres)." };
  }
  if (!adminName || adminName.length < 3) {
    return { error: "Tu nombre es obligatorio." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Introduce un email válido." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== passwordConfirm) {
    return { error: "Las contraseñas no coinciden." };
  }
  if (!acceptedTerms) {
    return { error: "Tienes que aceptar los términos y la política de privacidad." };
  }

  const plan = (["starter", "pro", "business"].includes(planRaw)
    ? planRaw
    : "starter") as AcademyPlan;
  const totalSeats = SEATS_BY_PLAN[plan];

  // ─── 2. Crear auth.users con Supabase Auth ───────────────────────
  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // saltamos verificación email (en Fase 3 quizás la activamos)
    user_metadata: { full_name: adminName },
  });

  if (authError || !authData.user) {
    if (authError?.message.toLowerCase().includes("already")) {
      return {
        error: "Ya existe una cuenta con ese email. Inicia sesión o recupera tu contraseña.",
      };
    }
    return {
      error:
        "No se ha podido crear tu cuenta. Revisa el email y vuelve a intentarlo.",
    };
  }

  const userId = authData.user.id;

  // ─── 3. Crear academia + profile + licencias + subscription ──────
  try {
    // Generar un slug único (si colisiona, añadir sufijo aleatorio)
    let slug = slugify(academyName);
    if (!slug) slug = "academia-" + Math.random().toString(36).slice(2, 8);

    // Comprobar si el slug existe; si sí, añadir sufijo
    const { data: existing } = await admin
      .from("academies")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    // 3a. Crear academia
    const { data: academy, error: academyError } = await admin
      .from("academies")
      .insert({
        name: academyName,
        slug,
        cif,
        email,
        plan,
        total_seats: totalSeats,
        status: "active",
      })
      .select()
      .single();

    if (academyError || !academy) {
      throw new Error(academyError?.message || "Fallo creando la academia.");
    }

    // 3b. Crear profile del academy_admin
    const { error: profileError } = await admin.from("profiles").insert({
      id: userId,
      academy_id: academy.id,
      role: "academy_admin",
      email,
      full_name: adminName,
      is_active: true,
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    // 3c. Crear las N licencias vacías del plan
    const licenseRows = Array.from({ length: totalSeats }, () => ({
      academy_id: academy.id,
      is_active: true,
    }));
    const { error: licensesError } = await admin.from("licenses").insert(licenseRows);
    if (licensesError) {
      throw new Error(licensesError.message);
    }

    // 3d. Crear subscription en estado trialing (sin Stripe todavía)
    await admin.from("subscriptions").insert({
      academy_id: academy.id,
      plan,
      status: "trialing",
    });

    // ─── 4. Enviar email de bienvenida (best effort) ──────────────
    // Esperamos al envío para poder loguear el error si falla.
    // Aun si falla, no romperemos el signup — el usuario ya está creado.
    const emailPayload = welcomeAcademyEmail({
      academyName,
      adminName,
      planName: PLAN_LABELS[plan],
      totalSeats,
    });

    try {
      const emailResult = await sendEmail({
        to: email,
        toName: adminName,
        subject: emailPayload.subject,
        htmlContent: emailPayload.htmlContent,
        textContent: emailPayload.textContent,
      });
      if (!emailResult.success) {
        console.error(
          `[signup] Email de bienvenida falló para ${email}: ${emailResult.error}`
        );
      } else {
        console.log(
          `[signup] Email de bienvenida enviado a ${email} (messageId: ${emailResult.messageId})`
        );
      }
    } catch (err) {
      console.error("[signup] Excepción enviando email de bienvenida:", err);
    }

    // ─── 5. Iniciar sesión y redirigir ────────────────────────────
    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email, password });
  } catch (err) {
    // Rollback: si algo ha fallado, borrar el auth.users creado
    // para que el email quede disponible.
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return {
      error:
        err instanceof Error
          ? `Error al crear la academia: ${err.message}`
          : "Error inesperado al crear la academia.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/academia");
}
