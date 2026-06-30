import Link from "next/link";
import { Clock, Save, Shield, Volume2, FileText, BarChart3 } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { ExamPreview } from "@/components/marketing/exam-preview";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/lib/site-config";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/favicon.svg`,
  email: siteConfig.email,
  address: { "@type": "PostalAddress", addressCountry: siteConfig.country },
  sameAs: [],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: siteConfig.url,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "39",
    highPrice: "139",
    offerCount: "4",
  },
  audience: {
    "@type": "EducationalAudience",
    audienceType: "Academias de inglés y profesores de Cambridge",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "es-ES",
};

const features = [
  {
    icon: Clock,
    title: "Cronómetro exacto del examen real",
    body: "Cuenta atrás por parte y total. Avisos en el último cuarto. Lo que tu alumno verá el día D.",
  },
  {
    icon: Save,
    title: "Autoguardado real, recuperación garantizada",
    body: "Cada respuesta se guarda cada 5 segundos. Si se cierra el navegador, el alumno retoma donde lo dejó.",
  },
  {
    icon: Volume2,
    title: "Listening con reproducciones controladas",
    body: "Audio protegido contra descarga, contador de reproducciones, temporizador independiente por parte.",
  },
  {
    icon: FileText,
    title: "Writing con corrección manual",
    body: "El profesor corrige con rúbrica Cambridge. Comentarios por párrafo, puntuación por criterio.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas por alumno y por academia",
    body: "Errores más frecuentes, tiempo por parte, evolución, ranking interno y media de aprobados.",
  },
  {
    icon: Shield,
    title: "Datos aislados entre academias",
    body: "Cada academia ve solo lo suyo. Row-level security a nivel de base de datos, no solo en pantalla.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={softwareJsonLd} />
      <MarketingHeader />

      <main>
        {/* HERO */}
        <section className="border-b border-rule overflow-hidden">
          <div className="max-w-site mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-20 grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-saffron mb-5">
                <span className="h-px w-6 bg-saffron" />
                Cambridge Computer-Based · B1, B2, C1
              </p>
              <h1 className="font-semibold text-5xl lg:text-6xl text-ink tracking-tight leading-[1.05]">
                Que tu alumno llegue al examen <span className="text-navy">sintiendo que ya lo ha hecho.</span>
              </h1>
              <p className="mt-6 text-lg text-muted max-w-prose leading-relaxed">
                Acertlio es el simulador online de exámenes Cambridge en formato ordenador, pensado para academias de inglés. Misma interfaz, mismos tiempos, mismas reglas — sin el estrés del día real.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/precios">
                  <Button size="lg">Ver planes y precios</Button>
                </Link>
                <Link href="/academias">
                  <Button variant="secondary" size="lg">Para academias</Button>
                </Link>
              </div>
              <p className="mt-5 text-xs text-muted">
                Sin tarjeta de crédito para probar. Demo en directo para academias.
              </p>
            </div>

            <div className="lg:col-span-7" id="producto">
              <ExamPreview />
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <p className="text-xs uppercase tracking-wider text-muted mb-3">Cómo funciona</p>
                <h2 className="font-semibold text-4xl text-ink tracking-tight leading-tight">
                  Una licencia por alumno. Reutilizable cuando termina.
                </h2>
                <p className="mt-5 text-muted leading-relaxed">
                  No vendemos usuarios permanentes. Vendemos plazas concurrentes: cuando un alumno termina su preparación, liberas su licencia y otro la ocupa. Sin cuotas por estudiante, sin sobresaltos.
                </p>
              </div>
              <div className="lg:col-span-8 grid sm:grid-cols-2 gap-px bg-rule rounded overflow-hidden">
                {[
                  { n: "01", t: "Contratas un plan", b: "Eliges 20, 50 o 100 plazas concurrentes según el tamaño de tu academia." },
                  { n: "02", t: "Creas a tus alumnos", b: "Invitas por email. Cada uno crea su contraseña y entra a su panel. Sin registros públicos." },
                  { n: "03", t: "Asignas simulacros", b: "Tus profesores asignan mocks B1, B2 o C1 a los alumnos que correspondan." },
                  { n: "04", t: "Recibes resultados", b: "Auto-corrección instantánea en Reading, Use of English y Listening. Writing lo corrige el profesor." },
                ].map((step) => (
                  <div key={step.n} className="bg-white p-6">
                    <p className="font-mono text-xs text-saffron mb-3">{step.n}</p>
                    <h3 className="font-medium text-ink">{step.t}</h3>
                    <p className="text-sm text-muted mt-2 leading-relaxed">{step.b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-2xl mb-12">
              <p className="text-xs uppercase tracking-wider text-muted mb-3">Lo que importa el día del examen</p>
              <h2 className="font-semibold text-4xl text-ink tracking-tight leading-tight">
                Construido para acercarse al examen real lo más posible.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule rounded overflow-hidden">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="bg-white p-6">
                    <Icon className="h-5 w-5 text-navy mb-4" strokeWidth={1.5} />
                    <h3 className="font-medium text-ink">{f.title}</h3>
                    <p className="text-sm text-muted mt-2 leading-relaxed">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRICING SUMMARY */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-5">
                <p className="text-xs uppercase tracking-wider text-muted mb-3">Precios transparentes</p>
                <h2 className="font-semibold text-4xl text-ink tracking-tight leading-tight">
                  Empieza desde <span className="text-navy">39 €/mes.</span> Sin permanencia.
                </h2>
                <p className="mt-5 text-muted leading-relaxed">
                  Pagas por plazas concurrentes activas. Cuando un alumno termina, liberas la plaza y la asignas a otro. Tres planes claros y un plan a medida para academias grandes.
                </p>
                <Link href="/precios" className="mt-6 inline-flex">
                  <Button size="md">Comparar planes</Button>
                </Link>
              </div>
              <div className="lg:col-span-7 grid sm:grid-cols-3 gap-3">
                {[
                  { name: "Starter", price: "39", seats: "20 plazas" },
                  { name: "Pro", price: "79", seats: "50 plazas", featured: true },
                  { name: "Business", price: "139", seats: "100 plazas" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className={`rounded border p-5 ${
                      p.featured ? "border-navy bg-navy-50" : "border-rule bg-white"
                    }`}
                  >
                    <p className="text-sm text-muted">{p.name}</p>
                    <p className="mt-2 font-semibold text-3xl text-ink tracking-tight">
                      {p.price} <span className="text-base text-muted">€/mes</span>
                    </p>
                    <p className="text-xs text-muted mt-1">{p.seats}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy text-white">
          <div className="max-w-site mx-auto px-6 py-16 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h2 className="font-semibold text-3xl lg:text-4xl tracking-tight leading-tight">
                ¿Diriges una academia? Cuéntanos cómo trabajáis y te enseñamos Acertlio en directo.
              </h2>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/contacto">
                <Button variant="secondary" size="lg" className="bg-white">
                  Solicitar demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
