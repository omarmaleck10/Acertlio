"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";
import {
  INDIVIDUAL_PLAN,
  TRIAL_DAYS_INDIVIDUAL,
  type BillingInterval,
} from "@/lib/stripe/plans";
import { siteConfig } from "@/lib/site-config";

export type IndividualRegistrationResult = {
  error: string | null;
  fieldErrors?: Partial<{
    email: string;
    full_name: string;
    target_level: string;
    referral_source: string;
    referral_other: string;
  }>;
};

const VALID_LEVELS = ["A2", "B1", "B2", "C1", "C2"] as const;
const VALID_SOURCES = [
  "google",
  "instagram",
  "tiktok",
  "friend",
  "academy",
  "other",
] as const;


/**
 * Arranca el registro de un alumno individual.
 *
 * Flujo:
 *   1. Valida los campos del formulario
 *   2. Verifica que el email no existe ya en profiles
 *   3. Crea fila en individual_registrations (status=pending)
 *   4. Crea Stripe Customer con el email
 *   5. Crea Stripe Checkout Session con trial 7 días
 *   6. Guarda IDs de Stripe, marca status=checkout_started
 *   7. Redirige a Stripe
 *
 * El usuario auth y el profile se crean SOLO al confirmarse el pago
 * vía webhook. Así evitamos usuarios fantasma si abandona el checkout.
 */
export async function startIndividualRegistrationAction(
  _prev: IndividualRegistrationResult,
  formData: FormData
): Promise<IndividualRegistrationResult> {
  // ─── Extraer y validar ─────────────────────────────────────────
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const targetLevel = String(formData.get("target_level") ?? "")
    .trim()
    .toUpperCase();
  const referralSource = String(formData.get("referral_source") ?? "").trim();
  const referralOther = String(formData.get("referral_other") ?? "").trim();
  const interval = String(formData.get("interval") ?? "monthly").trim() as BillingInterval;

  const fieldErrors: IndividualRegistrationResult["fieldErrors"] = {};

  if (!email) fieldErrors.email = "El email es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fieldErrors.email = "Formato de email no válido.";

  if (!fullName) fieldErrors.full_name = "Escribe tu nombre completo.";
  else if (fullName.length < 2)
    fieldErrors.full_name = "Nombre demasiado corto.";

  if (!targetLevel) fieldErrors.target_level = "Elige un nivel.";
  else if (!VALID_LEVELS.includes(targetLevel as (typeof VALID_LEVELS)[number]))
    fieldErrors.target_level = "Nivel no válido.";

  if (!referralSource) fieldErrors.referral_source = "Cuéntanos cómo nos conociste.";
  else if (
    !VALID_SOURCES.includes(referralSource as (typeof VALID_SOURCES)[number])
  )
    fieldErrors.referral_source = "Opción no válida.";

  if (referralSource === "other" && !referralOther) {
    fieldErrors.referral_other = "Escribe cómo nos conociste.";
  }

  if (interval !== "monthly" && interval !== "yearly") {
    return { error: "Ciclo de facturación no válido." };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Revisa los campos marcados.", fieldErrors };
  }

  const admin = createAdminClient();

  // ─── Verificar que no existe ya un profile con ese email ───────
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, is_individual")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    return {
      error:
        "Ya existe una cuenta con ese email. Prueba a iniciar sesión desde el enlace de acceso.",
    };
  }

  // ─── Crear la registration ─────────────────────────────────────
  const { data: registration, error: regError } = await admin
    .from("individual_registrations")
    .insert({
      email,
      full_name: fullName,
      target_level: targetLevel,
      referral_source: referralSource,
      referral_other: referralSource === "other" ? referralOther : null,
      billing_interval: interval,
      status: "pending",
    })
    .select("id")
    .single();

  if (regError || !registration) {
    return { error: `No se pudo crear el registro: ${regError?.message ?? "error"}` };
  }

  // ─── Crear Stripe Customer ─────────────────────────────────────
  const customer = await stripe.customers.create({
    email,
    name: fullName,
    metadata: {
      registration_id: registration.id,
      acertlio_role: "individual",
      target_level: targetLevel,
      referral_source: referralSource,
    },
  });

  // ─── Crear Checkout Session ────────────────────────────────────
  const priceId =
    interval === "monthly"
      ? INDIVIDUAL_PLAN.monthly.priceId
      : INDIVIDUAL_PLAN.yearly.priceId;

  if (!priceId) {
    // Rollback: marcar como abandoned y devolver error
    await admin
      .from("individual_registrations")
      .update({ status: "abandoned", updated_at: new Date().toISOString() })
      .eq("id", registration.id);
    return { error: "Plan no configurado en Stripe. Contacta con soporte." };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS_INDIVIDUAL,
      metadata: {
        registration_id: registration.id,
        plan: "individual",
        plan_type: "individual",
        target_level: targetLevel,
        billing_interval: interval,
      },
    },
    customer_update: { address: "auto", name: "auto" },
    billing_address_collection: "required",
    allow_promotion_codes: true,
    success_url: `${siteConfig.url}/individual/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteConfig.url}/individual/empezar?cancelled=1`,
    metadata: {
      registration_id: registration.id,
      plan_type: "individual",
      target_level: targetLevel,
      email,
    },
  });

  if (!session.url) {
    return { error: "No se pudo crear la sesión de pago." };
  }

  // ─── Guardar IDs y marcar como checkout_started ────────────────
  await admin
    .from("individual_registrations")
    .update({
      stripe_customer_id: customer.id,
      stripe_session_id: session.id,
      status: "checkout_started",
      updated_at: new Date().toISOString(),
    })
    .eq("id", registration.id);

  redirect(session.url);
}
