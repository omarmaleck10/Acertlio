"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { checkoutAcademyPlanAction, type CheckoutResult } from "@/app/checkout/actions";
import { ACADEMY_PLANS, monthlyEquivalent, yearlyDiscount } from "@/lib/stripe/plans";

const initial: CheckoutResult = { error: null };

/**
 * Componente que muestra los 3 planes de academia y permite iniciar
 * checkout Stripe con un click.
 */
export function AcademyPlanChooser() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [state, formAction] = useFormState(checkoutAcademyPlanAction, initial);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div>
      {/* Toggle mensual/anual */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full border border-rule bg-white p-1 text-sm">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-4 py-1.5 rounded-full font-medium ${
              interval === "monthly" ? "bg-navy text-white" : "text-muted"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`px-4 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5 ${
              interval === "yearly" ? "bg-navy text-white" : "text-muted"
            }`}
          >
            Anual
            <span
              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                interval === "yearly"
                  ? "bg-white/20 text-white"
                  : "bg-saffron/15 text-saffron"
              }`}
            >
              2 meses gratis
            </span>
          </button>
        </div>
      </div>

      {/* Grid de planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(ACADEMY_PLANS).map((plan) => {
          const price =
            interval === "monthly" ? plan.monthly.price : plan.yearly.price;
          const monthly =
            interval === "monthly" ? price : monthlyEquivalent(price);
          const discount =
            interval === "yearly"
              ? yearlyDiscount(plan.monthly.price, plan.yearly.price)
              : 0;

          return (
            <form
              key={plan.key}
              action={formAction}
              onSubmit={() => setSelectedPlan(plan.key)}
              className={`bg-white rounded-lg border-2 p-5 flex flex-col relative ${
                plan.popular ? "border-navy" : "border-rule"
              }`}
            >
              <input type="hidden" name="plan" value={plan.key} />
              <input type="hidden" name="interval" value={interval} />

              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-navy text-white text-xs font-semibold uppercase tracking-wider">
                  Más elegido
                </div>
              )}

              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-ink font-mono tabular-nums">
                  {monthly}
                </span>
                <span className="text-sm text-muted"> €/mes</span>
              </div>
              {interval === "yearly" && (
                <p className="text-xs text-muted">
                  {price} €/año · ahorras {discount}%
                </p>
              )}
              <div className="mt-3 py-2 px-3 rounded bg-paper text-center">
                <p className="text-xs uppercase tracking-wider text-muted">
                  Plazas
                </p>
                <p className="font-mono font-semibold text-navy">{plan.seats}</p>
              </div>
              <ul className="mt-4 space-y-1.5 flex-1 text-xs">
                {plan.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-ink">
                    <Check className="h-3 w-3 text-ok shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <SubmitButton
                plan={plan.key}
                popular={plan.popular}
                selectedPlan={selectedPlan}
              />
            </form>
          );
        })}
      </div>

      {state.error && (
        <div className="mt-4 flex items-start gap-2 rounded border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <p className="mt-4 text-xs text-muted text-center">
        14 días gratis · sin tarjeta hasta el final del periodo de prueba · cancela cuando quieras
      </p>
    </div>
  );
}

function SubmitButton({
  plan,
  popular,
  selectedPlan,
}: {
  plan: string;
  popular?: boolean;
  selectedPlan: string | null;
}) {
  const { pending } = useFormStatus();
  const isThisPlanPending = pending && selectedPlan === plan;
  return (
    <button
      type="submit"
      disabled={pending}
      className={`mt-4 inline-flex items-center justify-center gap-2 h-10 px-4 rounded text-sm font-medium disabled:opacity-50 ${
        popular
          ? "bg-navy text-white hover:bg-navy-600"
          : "border-2 border-navy text-navy hover:bg-navy-50"
      }`}
    >
      {isThisPlanPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparando…
        </>
      ) : (
        "Elegir este plan"
      )}
    </button>
  );
}
