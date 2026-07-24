import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { findPlanByPriceId } from "@/lib/stripe/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook handler de Stripe.
 * Procesa eventos de suscripción y actualiza subscriptions + academies + profiles.
 *
 * Eventos escuchados:
 *   - checkout.session.completed → crea/activa suscripción tras primer pago
 *   - customer.subscription.updated → cambios de plan, renovaciones
 *   - customer.subscription.deleted → cancelación
 *   - invoice.payment_failed → marca como past_due
 *
 * Configuración en Stripe Dashboard:
 *   URL: https://acertlio.com/api/stripe/webhook
 *   Eventos: los 4 anteriores
 *   Secret: guardar en STRIPE_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: `Webhook signature: ${msg}` }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, admin);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub, admin);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub, admin);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, admin);
        break;
      }
      default:
        // Ignorar eventos que no nos interesan
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    // Devolvemos 200 igualmente para que Stripe no reintente indefinidamente
    // Un fallo puntual se puede reprocesar manualmente
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers ────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  admin: ReturnType<typeof createAdminClient>
) {
  const metadata = session.metadata ?? {};
  const planType = metadata.plan_type;

  if (!session.subscription || typeof session.subscription !== "string") return;

  // Obtener detalle completo de la suscripción
  const sub = await stripe.subscriptions.retrieve(session.subscription);
  await handleSubscriptionUpdated(sub, admin);

  // Si es academy, marcar la academia como activa
  if (planType === "academy" && metadata.academy_id) {
    await admin
      .from("academies")
      .update({ status: "active" })
      .eq("id", metadata.academy_id);
  }
}

async function handleSubscriptionUpdated(
  sub: Stripe.Subscription,
  admin: ReturnType<typeof createAdminClient>
) {
  const metadata = sub.metadata ?? {};
  const planType = (metadata.plan_type as "academy" | "individual" | undefined) ?? "academy";
  const priceId = sub.items.data[0]?.price.id ?? "";
  const planLookup = findPlanByPriceId(priceId);
  const plan = (metadata.plan as string) ?? planLookup?.planKey ?? "starter";
  const billingInterval =
    (metadata.billing_interval as "monthly" | "yearly" | undefined) ??
    planLookup?.interval ??
    "monthly";
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Mapear estado Stripe → nuestro enum
  const status = mapStripeStatus(sub.status);

  const commonFields = {
    stripe_subscription_id: sub.id,
    stripe_customer_id: customerId,
    status,
    plan_type: planType,
    plan,
    billing_interval: billingInterval,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  if (planType === "academy" && metadata.academy_id) {
    await admin.from("subscriptions").upsert(
      {
        ...commonFields,
        academy_id: metadata.academy_id,
        student_id: null,
      },
      { onConflict: "stripe_subscription_id" }
    );

    // Si la suscripción está activa/trialing, la academia queda 'active'
    if (status === "active" || status === "trialing") {
      await admin
        .from("academies")
        .update({ status: "active", plan })
        .eq("id", metadata.academy_id);
    }
  } else if (planType === "individual" && metadata.student_id) {
    await admin.from("subscriptions").upsert(
      {
        ...commonFields,
        student_id: metadata.student_id,
        academy_id: null,
        target_level: metadata.target_level ?? null,
      },
      { onConflict: "stripe_subscription_id" }
    );

    // Actualizar level del perfil del alumno
    if (metadata.target_level) {
      await admin
        .from("profiles")
        .update({ level: metadata.target_level })
        .eq("id", metadata.student_id);
    }
  }
}

async function handleSubscriptionDeleted(
  sub: Stripe.Subscription,
  admin: ReturnType<typeof createAdminClient>
) {
  await admin
    .from("subscriptions")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", sub.id);

  const metadata = sub.metadata ?? {};
  if (metadata.plan_type === "academy" && metadata.academy_id) {
    await admin
      .from("academies")
      .update({ status: "cancelled" })
      .eq("id", metadata.academy_id);
  }
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  admin: ReturnType<typeof createAdminClient>
) {
  const subId = typeof invoice.subscription === "string" ? invoice.subscription : null;
  if (!subId) return;
  await admin
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subId);
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "cancelled";
    case "incomplete":
    case "incomplete_expired":
      return "trialing";
    case "paused":
      return "paused";
    default:
      return "trialing";
  }
}
