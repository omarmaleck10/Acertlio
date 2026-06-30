import Link from "next/link";
import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = {
  title: "Precios — desde 39 €/mes",
  description:
    "Planes de suscripción para academias de inglés: Starter (20 plazas), Pro (50), Business (100) y Enterprise (250+). Pago por plazas concurrentes, sin permanencia y con 16 % de descuento anual.",
  alternates: { canonical: "/precios" },
  openGraph: {
    title: "Precios de Acertlio — desde 39 €/mes",
    description:
      "Planes para academias de inglés. Pago por plazas concurrentes, sin permanencia.",
    url: "/precios",
  },
};

const plans = [
  {
    name: "Starter",
    price: 39,
    yearly: 390,
    seats: 20,
    description: "Para academias pequeñas y profesores particulares.",
    cta: "Empezar",
  },
  {
    name: "Pro",
    price: 79,
    yearly: 790,
    seats: 50,
    description: "El plan más elegido. Para academias en crecimiento.",
    cta: "Empezar",
    featured: true,
  },
  {
    name: "Business",
    price: 139,
    yearly: 1390,
    seats: 100,
    description: "Para academias con varios centros o gran volumen.",
    cta: "Empezar",
  },
  {
    name: "Enterprise",
    price: null,
    yearly: null,
    seats: 250,
    description: "250+ plazas, SSO, facturación a medida, soporte dedicado.",
    cta: "Hablamos",
  },
];

const featureRows: Array<{
  feature: string;
  values: Array<boolean | string>;
}> = [
  { feature: "Simulacros B1, B2 y C1", values: [true, true, true, true] },
  { feature: "Reading · Use of English · Listening · Writing", values: [true, true, true, true] },
  { feature: "Auto-corrección instantánea (R/UoE/L)", values: [true, true, true, true] },
  { feature: "Corrección manual de Writing", values: [true, true, true, true] },
  { feature: "Estadísticas por alumno", values: [true, true, true, true] },
  { feature: "Estadísticas globales academia", values: [true, true, true, true] },
  { feature: "Profesores ilimitados", values: [true, true, true, true] },
  { feature: "Soporte por email", values: [true, true, true, true] },
  { feature: "Soporte prioritario", values: [false, true, true, true] },
  { feature: "Onboarding personalizado", values: [false, false, true, true] },
  { feature: "Facturación con CIF anual", values: [true, true, true, true] },
  { feature: "Single Sign-On (SSO)", values: [false, false, false, true] },
];

const faqs = [
  {
    q: "¿Qué es una «plaza concurrente»?",
    a: "Es un alumno con licencia activa a la vez. Cuando un alumno termina su curso, liberas su licencia y otro alumno la ocupa. No pagas por usuarios permanentes, pagas por capacidad simultánea.",
  },
  {
    q: "¿Puedo cambiar de plan?",
    a: "Sí, en cualquier momento. Subir es inmediato y prorrateamos. Bajar entra en vigor en el siguiente ciclo de facturación.",
  },
  {
    q: "¿Hay periodo de prueba?",
    a: "Sí. Te montamos una demo en directo con un mock real para que veas el simulador, los paneles y el flujo de licencias antes de contratar.",
  },
  {
    q: "¿El IVA está incluido?",
    a: "No. Los precios mostrados son sin IVA. Facturamos con tu CIF y aplicamos el 21% correspondiente a servicios digitales en España.",
  },
  {
    q: "¿Y si quiero más de 100 plazas?",
    a: "Para 250+ plazas tenemos plan Enterprise con condiciones a medida. Escríbenos desde la página de contacto.",
  },
];

export default function PreciosPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const offerCatalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Planes de Acertlio",
    itemListElement: plans
      .filter((p) => p.price !== null)
      .map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: String(p.price),
        priceCurrency: "EUR",
        description: p.description,
        category: "Subscription",
      })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={offerCatalogJsonLd} />
      <MarketingHeader />

      <main className="border-b border-rule">
        <section className="max-w-site mx-auto px-6 pt-16 pb-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-wider text-saffron mb-3">Precios</p>
            <h1 className="font-semibold text-5xl text-ink tracking-tight leading-[1.05]">
              Paga por plazas, no por alumnos.
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed">
              Suscripción mensual o anual con un 16 % de descuento al pagar año por adelantado. Sin permanencia, sin cuotas por estudiante.
            </p>
          </div>
        </section>

        <section className="max-w-site mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded border p-6 flex flex-col ${
                  p.featured ? "border-navy bg-navy-50" : "border-rule bg-white"
                }`}
              >
                {p.featured && (
                  <p className="text-[10px] uppercase tracking-wider text-navy font-medium mb-2">
                    Más elegido
                  </p>
                )}
                <h2 className="font-semibold text-2xl text-ink tracking-tight">{p.name}</h2>
                <p className="text-sm text-muted mt-1 min-h-[2.5rem]">{p.description}</p>

                <div className="mt-5 mb-4">
                  {p.price !== null ? (
                    <>
                      <span className="font-semibold text-4xl text-ink tracking-tight">
                        {p.price}
                      </span>
                      <span className="text-base text-muted"> €/mes</span>
                      <p className="text-xs text-muted mt-1 font-mono">
                        o {p.yearly} €/año
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-3xl text-ink tracking-tight">
                        A medida
                      </span>
                      <p className="text-xs text-muted mt-1">Hablamos contigo</p>
                    </>
                  )}
                </div>

                <div className="border-t border-rule pt-4 mb-5">
                  <p className="text-xs uppercase tracking-wider text-muted">Plazas concurrentes</p>
                  <p className="font-semibold text-xl text-ink tracking-tight mt-1">
                    {p.seats}+
                  </p>
                </div>

                <div className="mt-auto">
                  <Link href={p.name === "Enterprise" ? "/contacto" : "/empezar"} className="block">
                    <Button
                      variant={p.featured ? "primary" : "secondary"}
                      className="w-full"
                    >
                      {p.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabla comparativa */}
        <section className="max-w-site mx-auto px-6 pb-20">
          <h2 className="font-semibold text-3xl text-ink tracking-tight mb-8">
            Qué incluye cada plan
          </h2>
          <div className="border border-rule rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper">
                <tr>
                  <th className="text-left font-medium text-muted px-4 py-3 w-1/3">Función</th>
                  {plans.map((p) => (
                    <th
                      key={p.name}
                      className="text-left font-medium text-ink px-4 py-3"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureRows.map((row) => (
                  <tr key={row.feature} className="border-t border-rule">
                    <td className="px-4 py-3 text-ink">{row.feature}</td>
                    {row.values.map((v, idx) => (
                      <td key={idx} className="px-4 py-3">
                        {v === true ? (
                          <Check className="h-4 w-4 text-navy" />
                        ) : v === false ? (
                          <Minus className="h-4 w-4 text-muted" />
                        ) : (
                          <span className="text-ink">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-site mx-auto px-6 pb-24">
          <h2 className="font-semibold text-3xl text-ink tracking-tight mb-8">
            Preguntas frecuentes
          </h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-medium text-ink mb-2">{f.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
