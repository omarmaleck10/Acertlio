"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";
import {
  ACADEMY_PLANS,
  INDIVIDUAL_PLAN,
  TRIAL_DAYS_ACADEMY,
  TRIAL_DAYS_INDIVIDUAL,
  type BillingInterval,
  type AcademyPlanKey,
} from "@/lib/stripe/plans";
import { siteConfig } from "@/lib/site-config";

export type CheckoutResult = { error: string | null };

/**
 * Crea una Stripe Checkout Session para una academia.
 * Requiere que el usuario esté logueado como academy_admin.
 */
export async function checkoutAcademyPlanAction(
  _prev: CheckoutResult,
  formData: FormData
): Promise<CheckoutResult> {
  const planKey = String(formData.get("plan") ?? "").trim() as AcademyPlanKey;
  const interval = String(formData.get("interval") ?? "monthly").trim() as BillingInterval;

  if (!ACADEMY_PLANS[planKey]) return { error: "Plan no válido." };
  if (interval !== "monthly" && interval !== "yearly")
    return { error: "Ciclo de facturación no válido." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, academy_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "academy_admin") {
    return { error: "Solo el administrador de la academia puede contratar planes." };
  }
  if (!profile.academy_id) return { error: "Tu cuenta no está vinculada a ninguna academia." };

  const admin = createAdminClient();
  const { data: academy } = await admin
    .from("academies")
    .select("id, name, stripe_customer_id")
    .eq("id", profile.academy_id)
    .maybeSingle();

  if (!academy) return { error: "Academia no encontrada." };

  // Reutilizar customer o crear uno nuevo
  let customerId = academy.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email ?? undefined,
      name: academy.name,
      metadata: {
        academy_id: academy.id,
        acertlio_role: "academy",
      },
    });
    customerId = customer.id;
    await admin
      .from("academies")
      .update({ stripe_customer_id: customerId })
      .eq("id", academy.id);
  }

  const plan = ACADEMY_PLANS[planKey];
  const priceId = plan[interval].priceId;
  if (!priceId) {
    return {
      error: "Precio no configurado en Stripe. Contacta con soporte.",
    };
  }

  // Crear Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS_ACADEMY,
      metadata: {
        academy_id: academy.id,
        plan: planKey,
        plan_type: "academy",
        billing_interval: interval,
      },
    },
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    customer_update: {
      address: "auto",
      name: "auto",
    },
    billing_address_collection: "required",
    allow_promotion_codes: true,
    success_url: `${siteConfig.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteConfig.url}/precios?cancelled=1`,
    metadata: {
      academy_id: academy.id,
      plan_type: "academy",
      plan: planKey,
    },
  });

  if (!session.url) return { error: "No se pudo crear la sesión de pago." };
  redirect(session.url);
}

/**
 * Crea una Stripe Checkout Session para un alumno individual.
 * NOTA: Actualmente este flujo está deshabilitado en la landing hasta activar IA.
 */
export async function checkoutIndividualPlanAction(
  _prev: CheckoutResult,
  formData: FormData
): Promise<CheckoutResult> {
  const interval = String(formData.get("interval") ?? "monthly").trim() as BillingInterval;
  const targetLevel = String(formData.get("level") ?? "").trim().toUpperCase();

  if (interval !== "monthly" && interval !== "yearly")
    return { error: "Ciclo de facturación no válido." };
  if (!["A2", "B1", "B2", "C1", "C2"].includes(targetLevel))
    return { error: "Nivel no válido." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión o registrarte primero." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { error: "Perfil no encontrado." };

  const admin = createAdminClient();

  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email ?? undefined,
      name: profile.full_name ?? undefined,
      metadata: {
        profile_id: profile.id,
        acertlio_role: "individual",
        target_level: targetLevel,
      },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", profile.id);
  }

  const priceId =
    interval === "monthly"
      ? INDIVIDUAL_PLAN.monthly.priceId
      : INDIVIDUAL_PLAN.yearly.priceId;
  if (!priceId) return { error: "Precio no configurado en Stripe." };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS_INDIVIDUAL,
      metadata: {
        student_id: profile.id,
        plan: "individual",
        plan_type: "individual",
        target_level: targetLevel,
        billing_interval: interval,
      },
    },
    automatic_tax: { enabled: true },
    customer_update: { address: "auto", name: "auto" },
    billing_address_collection: "required",
    allow_promotion_codes: true,
    success_url: `${siteConfig.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteConfig.url}/precios?cancelled=1&tab=individual`,
    metadata: {
      student_id: profile.id,
      plan_type: "individual",
      target_level: targetLevel,
    },
  });

  if (!session.url) return { error: "No se pudo crear la sesión de pago." };
  redirect(session.url);
}

/**
 * Abre el Stripe Customer Portal donde el cliente puede:
 *   - Ver facturas
 *   - Actualizar método de pago
 *   - Cambiar plan
 *   - Cancelar suscripción
 */
export async function openBillingPortalAction(
  _prev: CheckoutResult,
  _formData: FormData
): Promise<CheckoutResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, academy_id, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { error: "Perfil no encontrado." };

  const admin = createAdminClient();
  let customerId = profile.stripe_customer_id;
  let returnUrl = `${siteConfig.url}/alumno`;

  // Si es admin de academia, usar customer de la academia
  if (profile.role === "academy_admin" && profile.academy_id) {
    const { data: academy } = await admin
      .from("academies")
      .select("stripe_customer_id")
      .eq("id", profile.academy_id)
      .maybeSingle();
    customerId = academy?.stripe_customer_id ?? customerId;
    returnUrl = `${siteConfig.url}/academia/facturacion`;
  }

  if (!customerId) return { error: "No hay ningún método de pago vinculado todavía." };

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  redirect(session.url);
}
