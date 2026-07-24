import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACADEMY_PLANS, type AcademyPlanKey } from "@/lib/stripe/plans";
import { AcademyPlanChooser } from "@/components/academia/academy-plan-chooser";
import { BillingPortalButton } from "@/components/academia/billing-portal-button";

export default async function AcademiaFacturacionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile.role !== "academy_admin" && user.profile.role !== "super_admin") {
    redirect("/");
  }
  if (!user.profile.academy_id) {
    return (
      <div className="px-8 py-8">
        <p className="text-sm text-muted">
          Tu cuenta no está vinculada a ninguna academia.
        </p>
      </div>
    );
  }

  const admin = createAdminClient();

  const [{ data: academy }, { data: subscription }] = await Promise.all([
    admin
      .from("academies")
      .select("id, name, plan, status, stripe_customer_id")
      .eq("id", user.profile.academy_id)
      .maybeSingle(),
    admin
      .from("subscriptions")
      .select("*")
      .eq("academy_id", user.profile.academy_id)
      .maybeSingle(),
  ]);

  if (!academy) {
    return (
      <div className="px-8 py-8">
        <p className="text-sm text-muted">No se encontró tu academia.</p>
      </div>
    );
  }

  const hasActiveSubscription =
    !!subscription &&
    ["active", "trialing", "past_due"].includes(subscription.status);

  return (
    <div className="px-6 md:px-8 py-8 max-w-4xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Facturación</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Plan y pagos
        </h1>
        <p className="text-sm text-muted mt-2">
          Gestiona tu suscripción, método de pago y descarga tus facturas.
        </p>
      </header>

      {hasActiveSubscription ? (
        <ActiveSubscription
          subscription={subscription}
          academy={academy}
        />
      ) : (
        <NoSubscription academy={academy} />
      )}
    </div>
  );
}

// ─── Con suscripción activa ─────────────────────────────────────────
function ActiveSubscription({
  subscription,
  academy,
}: {
  subscription: Record<string, unknown>;
  academy: Record<string, unknown>;
}) {
  const status = subscription.status as string;
  const plan = subscription.plan as string;
  const billingInterval = (subscription.billing_interval as string) ?? "monthly";
  const currentPeriodEnd = subscription.current_period_end as string | null;
  const trialEndsAt = subscription.trial_ends_at as string | null;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end as boolean;

  const planData = ACADEMY_PLANS[plan as AcademyPlanKey];
  const price =
    planData && billingInterval === "monthly"
      ? planData.monthly.price
      : planData?.yearly.price ?? 0;

  const isTrialing = status === "trialing";
  const isPastDue = status === "past_due";
  const isActive = status === "active";

  return (
    <div className="space-y-5">
      {/* Card de plan actual */}
      <div className="bg-white rounded-lg border border-rule p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Plan actual</p>
            <h2 className="text-2xl font-semibold text-ink mt-0.5">
              {planData?.name ?? plan}
            </h2>
            <p className="text-sm text-muted mt-1">
              {price}€/{billingInterval === "monthly" ? "mes" : "año"} + IVA ·{" "}
              {planData?.seats} plazas concurrentes
            </p>
          </div>
          <StatusBadge status={status} cancelAtPeriodEnd={cancelAtPeriodEnd} />
        </div>

        {isTrialing && trialEndsAt && (
          <div className="rounded border border-saffron/30 bg-saffron/5 px-4 py-3 mb-4 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-ink font-medium">Estás en periodo de prueba</p>
              <p className="text-muted mt-0.5">
                Tu prueba termina el{" "}
                {new Date(trialEndsAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                . El primer cobro se hará después.
              </p>
            </div>
          </div>
        )}

        {isPastDue && (
          <div className="rounded border border-bad/30 bg-bad/5 px-4 py-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-bad shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-ink font-medium">Pago pendiente</p>
              <p className="text-muted mt-0.5">
                No pudimos cobrar tu último recibo. Actualiza tu método de pago
                para no perder acceso.
              </p>
            </div>
          </div>
        )}

        {cancelAtPeriodEnd && currentPeriodEnd && (
          <div className="rounded border border-saffron/30 bg-saffron/5 px-4 py-3 mb-4 flex items-start gap-2">
            <Clock className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-ink font-medium">Cancelación programada</p>
              <p className="text-muted mt-0.5">
                Tu suscripción terminará el{" "}
                {new Date(currentPeriodEnd).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                . Puedes reactivarla desde el portal.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-rule">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              Ciclo de facturación
            </p>
            <p className="text-sm text-ink mt-0.5">
              {billingInterval === "monthly" ? "Mensual" : "Anual (2 meses gratis)"}
            </p>
          </div>
          {currentPeriodEnd && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">
                {cancelAtPeriodEnd ? "Termina el" : "Próxima renovación"}
              </p>
              <p className="text-sm text-ink mt-0.5">
                {new Date(currentPeriodEnd).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-rule">
          <BillingPortalButton />
          <p className="text-xs text-muted mt-2">
            Desde el portal puedes actualizar el método de pago, ver facturas,
            cambiar de plan o cancelar la suscripción.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sin suscripción activa ─────────────────────────────────────────
function NoSubscription({ academy }: { academy: Record<string, unknown> }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-navy/20 bg-navy-50/50 p-5 flex items-start gap-3">
        <CreditCard className="h-5 w-5 text-navy shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-ink font-medium">
            Todavía no has activado ninguna suscripción
          </p>
          <p className="text-muted mt-1">
            Elige un plan para empezar. Los primeros 14 días son gratis y no
            necesitas introducir tarjeta hasta el final del periodo de prueba.
          </p>
        </div>
      </div>

      <AcademyPlanChooser />
    </div>
  );
}

// ─── Badge de estado ────────────────────────────────────────────────
function StatusBadge({
  status,
  cancelAtPeriodEnd,
}: {
  status: string;
  cancelAtPeriodEnd: boolean;
}) {
  if (cancelAtPeriodEnd) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-xs font-medium">
        <Clock className="h-3 w-3" />
        Cancela pronto
      </span>
    );
  }
  if (status === "trialing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 border border-navy/30 text-navy text-xs font-medium">
        <Sparkles className="h-3 w-3" />
        En prueba
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ok/10 border border-ok/30 text-ok text-xs font-medium">
        <CheckCircle2 className="h-3 w-3" />
        Activa
      </span>
    );
  }
  if (status === "past_due") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bad/10 border border-bad/30 text-bad text-xs font-medium">
        <AlertTriangle className="h-3 w-3" />
        Pago pendiente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper border border-rule text-muted text-xs font-medium">
      {status}
    </span>
  );
}
