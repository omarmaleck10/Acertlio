"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Clock, User, GraduationCap } from "lucide-react";

interface Plan {
  key: string;
  name: string;
  description: string;
  monthly: { price: number; priceId: string };
  yearly: { price: number; priceId: string };
  seats?: number;
  features: readonly string[];
  popular?: boolean;
}

interface Props {
  startTab: "academies" | "individual";
  academyPlans: Record<string, Plan>;
  enterprisePlan: {
    key: string;
    name: string;
    description: string;
    priceFrom: number;
    features: readonly string[];
  };
  individualPlan: Plan;
  yearlyDiscount: (monthly: number, yearly: number) => number;
  monthlyEquivalent: (yearly: number) => number;
}

export function PricingTabs({
  startTab,
  academyPlans,
  enterprisePlan,
  individualPlan,
  yearlyDiscount,
  monthlyEquivalent,
}: Props) {
  const [tab, setTab] = useState<"academies" | "individual">(startTab);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="mt-10">
      {/* Tabs de tipo de cliente */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-lg border border-rule bg-white p-1">
          <button
            onClick={() => setTab("academies")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded font-medium text-sm transition-colors ${
              tab === "academies"
                ? "bg-navy text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Para academias
          </button>
          <button
            onClick={() => setTab("individual")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded font-medium text-sm transition-colors ${
              tab === "individual"
                ? "bg-navy text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            <User className="h-4 w-4" />
            Para alumnos
          </button>
        </div>
      </div>

      {/* Toggle mensual/anual */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-full border border-rule bg-white p-1 text-sm">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors ${
              interval === "monthly"
                ? "bg-navy text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors inline-flex items-center gap-1.5 ${
              interval === "yearly"
                ? "bg-navy text-white"
                : "text-muted hover:text-ink"
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

      {/* ─── TAB Academias ────────────────────────────────────────── */}
      {tab === "academies" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Object.values(academyPlans).map((plan) => {
              const price =
                interval === "monthly" ? plan.monthly.price : plan.yearly.price;
              const shownPrice =
                interval === "monthly" ? price : monthlyEquivalent(price);
              const discount =
                interval === "yearly"
                  ? yearlyDiscount(plan.monthly.price, plan.yearly.price)
                  : 0;
              return (
                <PlanCard
                  key={plan.key}
                  plan={plan}
                  interval={interval}
                  shownPrice={shownPrice}
                  totalPrice={price}
                  discount={discount}
                  cta="Empezar prueba gratis"
                  ctaHref={`/empezar/academia?plan=${plan.key}&interval=${interval}`}
                  ctaNote="14 días gratis · sin tarjeta"
                />
              );
            })}
          </div>

          {/* Enterprise */}
          <div className="mt-6 rounded-lg border border-rule bg-white p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-navy" />
                <h3 className="text-lg font-semibold text-ink">
                  {enterprisePlan.name}
                </h3>
              </div>
              <p className="text-sm text-muted">
                {enterprisePlan.description} Desde{" "}
                <strong className="text-ink">{enterprisePlan.priceFrom} €/mes</strong>.
              </p>
            </div>
            <Link
              href="/contacto?plan=enterprise"
              className="inline-flex items-center justify-center h-11 px-5 rounded border-2 border-navy text-navy text-sm font-medium hover:bg-navy-50 shrink-0"
            >
              Hablar con ventas
            </Link>
          </div>
        </>
      )}

      {/* ─── TAB Individuales ────────────────────────────────────── */}
      {tab === "individual" && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border-2 border-navy bg-white p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-saffron text-white text-xs font-semibold uppercase tracking-wider">
              <Clock className="h-3 w-3" />
              Próximamente
            </div>

            <h3 className="text-2xl font-semibold text-ink">
              {individualPlan.name}
            </h3>
            <p className="text-sm text-muted mt-1">
              {individualPlan.description}
            </p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-ink font-mono tabular-nums">
                {interval === "monthly"
                  ? individualPlan.monthly.price
                  : monthlyEquivalent(individualPlan.yearly.price)}
                <span className="text-lg text-muted"> €</span>
              </span>
              <span className="text-sm text-muted">
                /mes {interval === "yearly" && "facturado anualmente"}
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              IVA no incluido · sin permanencia · cancela cuando quieras
            </p>

            <ul className="mt-6 space-y-2.5">
              {individualPlan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="h-4 w-4 text-ok shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded border border-saffron/30 bg-saffron/5 p-4">
              <p className="text-sm text-ink font-medium mb-1">
                🚧 Estamos afinando los últimos detalles
              </p>
              <p className="text-xs text-muted leading-relaxed">
                El plan individual llegará en las próximas semanas. Estamos
                afinando el motor de corrección con feedback pedagógico
                personalizado para asegurarte una experiencia a la altura de
                Cambridge. Déjanos tu email y te avisamos el día que abramos.
              </p>
              <div className="mt-3">
                <Link
                  href="/contacto?tipo=alumno-individual"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded bg-navy text-white text-sm font-medium hover:bg-navy-600"
                >
                  Avísame cuando esté listo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Card de plan ────────────────────────────────────────────────────
function PlanCard({
  plan,
  interval,
  shownPrice,
  totalPrice,
  discount,
  cta,
  ctaHref,
  ctaNote,
}: {
  plan: Plan;
  interval: "monthly" | "yearly";
  shownPrice: number;
  totalPrice: number;
  discount: number;
  cta: string;
  ctaHref: string;
  ctaNote?: string;
}) {
  return (
    <div
      className={`rounded-lg border-2 bg-white p-6 flex flex-col relative ${
        plan.popular ? "border-navy" : "border-rule"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-navy text-white text-xs font-semibold uppercase tracking-wider">
          Más elegido
        </div>
      )}

      <h3 className="text-xl font-semibold text-ink">{plan.name}</h3>
      <p className="text-sm text-muted mt-1 min-h-[40px]">{plan.description}</p>

      <div className="mt-5">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-ink font-mono tabular-nums">
            {shownPrice}
            <span className="text-base text-muted"> €</span>
          </span>
          <span className="text-sm text-muted ml-1">/mes</span>
        </div>
        {interval === "yearly" && (
          <p className="text-xs text-muted mt-0.5">
            {totalPrice} €/año · ahorras {discount}%
          </p>
        )}
        {interval === "monthly" && (
          <p className="text-xs text-muted mt-0.5">IVA no incluido</p>
        )}
      </div>

      {plan.seats && (
        <div className="mt-4 py-2 px-3 rounded bg-paper text-center">
          <p className="text-xs uppercase tracking-wider text-muted">
            Plazas concurrentes
          </p>
          <p className="font-mono font-semibold text-navy">{plan.seats}</p>
        </div>
      )}

      <ul className="mt-5 space-y-2 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink">
            <Check className="h-4 w-4 text-ok shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-6 inline-flex items-center justify-center h-11 px-4 rounded text-sm font-medium ${
          plan.popular
            ? "bg-navy text-white hover:bg-navy-600"
            : "border-2 border-navy text-navy hover:bg-navy-50"
        }`}
      >
        {cta}
      </Link>
      {ctaNote && (
        <p className="text-xs text-muted text-center mt-2">{ctaNote}</p>
      )}
    </div>
  );
}
