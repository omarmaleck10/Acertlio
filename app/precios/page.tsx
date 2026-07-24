import Link from "next/link";
import type { Metadata } from "next";
import { Check, Sparkles, Clock } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { JsonLd } from "@/components/shared/json-ld";
import {
  ACADEMY_PLANS,
  ENTERPRISE_PLAN,
  INDIVIDUAL_PLAN,
  yearlyDiscount,
  monthlyEquivalent,
} from "@/lib/stripe/plans";
import { PricingTabs } from "@/components/marketing/pricing-tabs";

export const metadata: Metadata = {
  title: "Precios — desde 14,95 €/mes",
  description:
    "Planes para academias de inglés (Starter, Pro, Business, Enterprise) y para alumnos que se preparan por su cuenta. Prueba gratis 14 días sin permanencia.",
  alternates: { canonical: "/precios" },
  openGraph: {
    title: "Precios de Acertlio",
    description:
      "Planes para academias y alumnos. Prueba gratis 14 días, sin permanencia.",
    url: "/precios",
  },
};

export default function PreciosPage({
  searchParams,
}: {
  searchParams: { cancelled?: string; tab?: string };
}) {
  const startTab = searchParams.tab === "individual" ? "individual" : "academies";
  const wasCancelled = searchParams.cancelled === "1";

  return (
    <>
      <MarketingHeader />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-wider text-saffron mb-3">
            Precios
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink">
            Precios claros, sin permanencia
          </h1>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            Elige el plan que mejor encaja: para tu academia o para prepararte por
            tu cuenta. Prueba gratis y cancela cuando quieras.
          </p>
        </div>

        {wasCancelled && (
          <div className="mx-auto max-w-2xl mt-8 rounded border border-saffron/40 bg-saffron/10 px-4 py-3 text-sm text-ink">
            El pago se ha cancelado. Ningún cargo se ha realizado. Cuando estés
            listo, puedes volver a elegir un plan.
          </div>
        )}

        <PricingTabs
          startTab={startTab}
          academyPlans={JSON.parse(JSON.stringify(ACADEMY_PLANS))}
          enterprisePlan={JSON.parse(JSON.stringify(ENTERPRISE_PLAN))}
          individualPlan={JSON.parse(JSON.stringify(INDIVIDUAL_PLAN))}
          yearlyDiscount={(m: number, y: number) => yearlyDiscount(m, y)}
          monthlyEquivalent={(y: number) => monthlyEquivalent(y)}
        />
      </main>

      <MarketingFooter />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Acertlio",
          description:
            "Plataforma de simulacros Cambridge Computer-Based para academias españolas y alumnos individuales.",
          brand: { "@type": "Brand", name: "Acertlio" },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "EUR",
            lowPrice: 14.95,
            highPrice: 149.95,
            offerCount: 5,
          },
        }}
      />
    </>
  );
}
