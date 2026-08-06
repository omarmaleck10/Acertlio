import Link from "next/link";
import type { Metadata } from "next";
import {
  Sparkles,
  Monitor,
  Clock,
  BookOpen,
  Users,
  BarChart3,
  Shield,
  CheckCircle2,
  Check,
  ArrowRight,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { ExamPreview } from "@/components/marketing/exam-preview";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/lib/site-config";

// ═════════════════════════════════════════════════════
// SEO metadata — brief SEO del Excel (Hoja 4)
// ═════════════════════════════════════════════════════
export const metadata: Metadata = {
  title:
    "Simulacros Cambridge online con corrección IA del Writing | Acertlio",
  description:
    "Prepara tu B2 First, C1 Advanced o C2 Proficiency con simulacros reales Computer-Based y corrección IA del Writing en 30 segundos según rúbrica oficial Cambridge. Para alumnos y academias. Trial 7 días gratis.",
  alternates: { canonical: "/" },
  keywords: [
    "simulacros cambridge online",
    "simulacros b2 first online",
    "simulacros c1 advanced online",
    "corrección writing cambridge",
    "cambridge computer based",
    "examen cambridge por ordenador",
    "plataforma preparar cambridge",
    "simulacro fce online",
    "simulacro cae online",
  ],
  openGraph: {
    title:
      "Simulacros Cambridge Computer-Based con corrección IA — Acertlio",
    description:
      "Prepara Cambridge con simulacros reales por ordenador. Corrección IA del Writing en 30 segundos. Trial 7 días.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Simulacros Cambridge online con corrección IA — Acertlio",
    description:
      "Simulacros oficiales A2-C2 en formato computer-based. Corrección IA del Writing en 30 segundos.",
  },
};

// ═════════════════════════════════════════════════════
// Schema.org — Organization + WebSite + Product + FAQ
// ═════════════════════════════════════════════════════
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "es-ES",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/simulacros?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "Plataforma de simulacros Cambridge Computer-Based con corrección IA del Writing. Para alumnos individuales y academias de idiomas.",
  url: siteConfig.url,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "14.95",
    highPrice: "250.00",
    offerCount: "5",
  },
  audience: {
    "@type": "EducationalAudience",
    audienceType: "Estudiantes Cambridge y academias de idiomas",
  },
};

// ═════════════════════════════════════════════════════
// Los 5 niveles Cambridge cubiertos
// ═════════════════════════════════════════════════════
const levels = [
  {
    code: "A2",
    name: "Key (KET)",
    tag: "Elemental",
    mocks: "3 mocks",
    href: "/preparacion-a2-key-online",
    description: "Nivel elemental A2. Ideal para primeras certificaciones.",
  },
  {
    code: "B1",
    name: "Preliminary (PET)",
    tag: "Intermedio",
    mocks: "3 mocks",
    href: "/preparacion-b1-preliminary-online",
    description: "Nivel intermedio B1. Base sólida para estudios y trabajo.",
  },
  {
    code: "B2",
    name: "First (FCE)",
    tag: "Upper-int.",
    mocks: "3 mocks",
    href: "/preparacion-b2-first-online",
    description: "El certificado más demandado en España. Universidad, trabajo, oposiciones.",
    featured: true,
  },
  {
    code: "C1",
    name: "Advanced (CAE)",
    tag: "Avanzado",
    mocks: "3 mocks",
    href: "/preparacion-c1-advanced-online",
    description: "Nivel avanzado C1. Requerido para muchos másteres y trabajos.",
  },
  {
    code: "C2",
    name: "Proficiency (CPE)",
    tag: "Dominio",
    mocks: "1 mock",
    href: "/preparacion-c2-proficiency-online",
    description: "Nivel de dominio C2. Equivalente a nativo cualificado.",
  },
];

// ═════════════════════════════════════════════════════
// Features clave del producto
// ═════════════════════════════════════════════════════
const features = [
  {
    icon: Monitor,
    title: "Formato idéntico al examen real",
    body: "Interfaz computer-based clavada al oficial de Cambridge. Cuando tus alumnos lleguen al día D, la pantalla no será una sorpresa.",
  },
  {
    icon: Sparkles,
    title: "Corrección IA del Writing en 30 segundos",
    body: "Rúbrica oficial Cambridge (Content, Communicative, Organisation, Language). Feedback específico en español. Sin esperar 24-48h.",
  },
  {
    icon: Clock,
    title: "Cronómetro exacto por parte",
    body: "Tiempos oficiales del examen por sección. Avisos en el último cuarto. Reading, Use of English y Listening auto-corregidos al instante.",
  },
  {
    icon: BarChart3,
    title: "Informes de progreso reales",
    body: "Ranking, evolución por nivel, errores más comunes, alumnos en riesgo. Datos para tomar decisiones, no intuiciones.",
  },
  {
    icon: Users,
    title: "Panel del profesor multi-grupo",
    body: "Cada profesor ve sus alumnos. Cada grupo tiene su plan. El director ve toda la academia. Sin líos de permisos.",
  },
  {
    icon: Shield,
    title: "GDPR y datos en Europa",
    body: "Servidores en Frankfurt. Cifrado en reposo y en tránsito. Datos de menores protegidos según LOPD-GDD.",
  },
];

// ═════════════════════════════════════════════════════
// FAQ — schema.org
// ═════════════════════════════════════════════════════
const faqs = [
  {
    q: "¿Qué niveles Cambridge cubre Acertlio?",
    a: "A2 Key, B1 Preliminary, B2 First, C1 Advanced y C2 Proficiency. Todos los niveles principales del sistema Cambridge English con al menos 3 mocks completos (C2 con 1, ampliándose).",
  },
  {
    q: "¿Los simulacros son iguales al examen oficial de Cambridge?",
    a: "El formato, la interfaz y los tiempos son idénticos al examen Computer-Based oficial. El contenido es original de Acertlio (no reproducimos exámenes oficiales) pero sigue estrictamente la estructura, los tipos de pregunta y la rúbrica de puntuación oficial.",
  },
  {
    q: "¿Cómo funciona la corrección IA del Writing?",
    a: "En cuanto envías el Writing, la IA lo analiza siguiendo la rúbrica oficial Cambridge sobre 4 criterios (Content, Communicative Achievement, Organisation, Language). En 30 segundos te da puntuación de 0-20 y feedback específico en español con sugerencias de mejora.",
  },
  {
    q: "¿Puedo usarlo si soy un alumno individual sin academia?",
    a: "Sí. El plan Individual son 14,95€/mes e incluye acceso a todos los mocks y correcciones IA ilimitadas del Writing. Trial 7 días gratis sin tarjeta.",
  },
  {
    q: "¿Y si tengo una academia?",
    a: "Los planes para academias empiezan en 49,95€/mes (50 plazas). Incluyen panel del profesor, gestión multi-grupo, informes de progreso y corrección IA validada por el profesor. Consulta la página /academias para más detalles.",
  },
  {
    q: "¿Cuánto tarda en corregir un Writing la IA?",
    a: "Entre 15 y 45 segundos según la longitud. En un mismo simulacro puedes tener las 2 correcciones de Writing (Part 1 y Part 2) listas en menos de 1 minuto.",
  },
  {
    q: "¿Se puede probar sin pagar?",
    a: "Sí. 7 días de trial gratuito con 3 mocks completos (incluyendo 6 correcciones IA de Writing). Sin tarjeta de crédito, sin permanencia.",
  },
  {
    q: "¿Dónde se alojan los datos?",
    a: "En Frankfurt (Alemania), servidor de Supabase. Cifrado en reposo y en tránsito, cumplimiento GDPR y LOPD-GDD. Los datos de menores requieren consentimiento del tutor legal.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={softwareJsonLd} />
      <JsonLd data={faqJsonLd} />
      <MarketingHeader />

      <main>
        {/* ═══════════════════════════════════
            HERO — H1 con keywords principales
            ═══════════════════════════════════ */}
        <section className="border-b border-rule overflow-hidden">
          <div className="max-w-site mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-20 grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-saffron mb-5 font-medium">
                <span className="h-px w-6 bg-saffron" />
                Cambridge Computer-Based · A2 a C2
              </p>
              <h1 className="font-semibold text-4xl md:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.05]">
                Simulacros Cambridge online por ordenador, con{" "}
                <span className="text-navy">corrección IA del Writing.</span>
              </h1>
              <p className="mt-6 text-lg text-muted max-w-prose leading-relaxed">
                Prepara tu <strong className="text-ink">B2 First</strong>,{" "}
                <strong className="text-ink">C1 Advanced</strong> o{" "}
                <strong className="text-ink">C2 Proficiency</strong> con
                simulacros reales en formato computer-based. La IA corrige tus
                Writings en <strong className="text-ink">30 segundos</strong>{" "}
                con la rúbrica oficial Cambridge. Trial 7 días gratis, sin
                tarjeta.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/empezar">
                  <Button size="lg">Empezar gratis 7 días</Button>
                </Link>
                <Link href="/academias">
                  <Button variant="secondary" size="lg">
                    Soy academia
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-ok" />
                  Sin tarjeta
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-ok" />
                  13+ mocks listos
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-ok" />
                  GDPR
                </span>
              </div>
            </div>

            <div className="lg:col-span-7" id="producto">
              <ExamPreview />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            NIVELES — 5 niveles con links a landings
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Simulacros oficiales por nivel
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Simulacros Cambridge de A2 a C2 — todos los niveles.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Cada nivel con mocks completos, formato computer-based idéntico
                al examen oficial y corrección IA del Writing (B1 en adelante).
                Elige tu nivel y empieza a practicar hoy.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {levels.map((l) => (
                <Link
                  key={l.code}
                  href={l.href}
                  className={`group rounded-lg border p-6 bg-white hover:border-navy transition-colors ${
                    l.featured ? "border-navy" : "border-rule"
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-mono text-2xl font-bold text-navy">
                      {l.code}
                    </span>
                    <span className="text-xs text-muted">{l.mocks}</span>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-1">
                    {l.tag}
                  </p>
                  <h3 className="font-semibold text-ink text-sm mb-2">
                    {l.name}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-4">
                    {l.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-navy font-medium group-hover:gap-2 transition-all">
                    Ver simulacros
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            COMPUTER-BASED — diferenciador cluster 2
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5">
                <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                  Formato del examen
                </p>
                <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                  Cambridge Computer-Based — cero sorpresas el día D.
                </h2>
                <p className="mt-4 text-muted leading-relaxed">
                  Cada vez más alumnos hacen el examen Cambridge por ordenador.
                  Nuestros simulacros replican exactamente esa interfaz:
                  temporizador, arrastrar respuestas, marcar preguntas para
                  revisar, editar en el teclado. Cuando llegues al examen real,
                  ya lo habrás usado 10 veces.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Interfaz idéntica al examen oficial computer-based",
                    "Temporizador visible con auto-envío al terminar",
                    "Editor de Writing con contador de palabras",
                    "Marcado de preguntas para revisar al final",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-ink"
                    >
                      <CheckCircle2 className="h-5 w-5 text-ok flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/examen-cambridge-computer-based">
                    <Button size="md" variant="secondary">
                      Cómo es el examen por ordenador
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mockup pantalla Reading computer-based */}
              <div className="lg:col-span-7">
                <div className="rounded-lg border border-rule bg-white shadow-sm overflow-hidden">
                  {/* Barra superior estilo examen */}
                  <div className="bg-navy text-white px-5 py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4" />
                      <span className="font-medium">
                        B2 First · Reading Part 5
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 tabular-nums">
                        <Clock className="h-3.5 w-3.5" />
                        01:12:45
                      </span>
                      <span className="text-white/60">
                        Pregunta 25 de 42
                      </span>
                    </div>
                  </div>

                  {/* Contenido: pregunta ejemplo */}
                  <div className="p-6">
                    <p className="text-xs text-muted uppercase tracking-wider mb-3 font-medium">
                      Pregunta 25
                    </p>
                    <p className="text-sm text-ink leading-relaxed mb-5">
                      What does the writer suggest about young musicians in
                      the second paragraph?
                    </p>

                    <div className="space-y-2">
                      {[
                        { l: "A", t: "They are more likely to succeed if they start early.", sel: false },
                        { l: "B", t: "They need to focus on developing their own unique style.", sel: true },
                        { l: "C", t: "They should follow the advice of established artists.", sel: false },
                        { l: "D", t: "They benefit most from formal music education.", sel: false },
                      ].map((opt) => (
                        <div
                          key={opt.l}
                          className={`rounded border p-3 flex items-start gap-3 text-sm ${
                            opt.sel
                              ? "border-navy bg-navy/5"
                              : "border-rule bg-white"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center font-semibold text-xs ${
                              opt.sel
                                ? "bg-navy text-white"
                                : "bg-paper text-muted"
                            }`}
                          >
                            {opt.l}
                          </span>
                          <span className={opt.sel ? "text-ink" : "text-muted"}>
                            {opt.t}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Barra inferior */}
                  <div className="border-t border-rule bg-paper px-5 py-3 flex items-center justify-between text-xs">
                    <button className="text-muted hover:text-ink">
                      ← Anterior
                    </button>
                    <button className="text-navy font-medium">Siguiente →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            CORRECCIÓN IA — diferenciador clave
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                  Diferenciador
                </p>
                <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                  Corrección de Writing con IA — rúbrica oficial Cambridge.
                </h2>
                <p className="mt-4 text-muted leading-relaxed">
                  El único servicio en español que aplica la rúbrica oficial
                  Cambridge sobre los 4 criterios (Content, Communicative
                  Achievement, Organisation, Language) y devuelve puntuación
                  por criterio en 30 segundos.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Puntuación 0-20 según Cambridge Scale",
                    "Feedback específico en español (no genérico)",
                    "Sugerencias de mejora accionables",
                    "Correlación >85% con puntuaciones de examiners humanos",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-ink"
                    >
                      <CheckCircle2 className="h-5 w-5 text-ok flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/correccion-writing-ia">
                    <Button size="md">Cómo funciona la corrección IA</Button>
                  </Link>
                </div>
              </div>

              {/* Mockup del output visual (igual que en /correccion-writing-ia) */}
              <div className="lg:col-span-6">
                <div className="rounded-lg border border-rule bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-ok" />
                    <p className="text-xs uppercase tracking-wider text-ok font-semibold">
                      Writing corregido
                    </p>
                  </div>
                  <p className="text-xs text-muted mb-1">Nota del Writing</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-navy tabular-nums">
                      15
                    </span>
                    <span className="text-lg text-navy">/ 20</span>
                    <span className="text-sm text-muted ml-2">
                      (75% · Grade B)
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { l: "Content", v: 4 },
                      { l: "Comm.", v: 4 },
                      { l: "Org.", v: 4 },
                      { l: "Lang.", v: 3 },
                    ].map((c) => (
                      <div
                        key={c.l}
                        className="text-center rounded border border-rule bg-paper p-2"
                      >
                        <p className="text-xs text-muted mb-1">{c.l}</p>
                        <p className="text-lg font-semibold text-ink tabular-nums">
                          {c.v}
                        </p>
                        <p className="text-xs text-muted">/ 5</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted mb-2 font-medium">
                    Feedback:
                  </p>
                  <p className="text-xs text-ink leading-relaxed">
                    Buen essay con estructura clara. Uso adecuado de
                    conectores. Vocabulario relevante al tema. Corregir:
                    &ldquo;less cars&rdquo; → &ldquo;fewer cars&rdquo;.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            FEATURES — 6 tarjetas
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Lo que importa el día del examen
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Construido para acercarse al examen real al máximo.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule rounded overflow-hidden">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="bg-white p-6">
                    <Icon
                      className="h-5 w-5 text-navy mb-4"
                      strokeWidth={1.5}
                    />
                    <h3 className="font-semibold text-ink">{f.title}</h3>
                    <p className="text-sm text-muted mt-2 leading-relaxed">
                      {f.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            2 CAMINOS — Individual vs Academia
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Para quién es
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Dos caminos, un mismo producto.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Individual */}
              <div className="rounded-lg border border-rule bg-white p-8">
                <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-2">
                  Individual
                </p>
                <h3 className="font-semibold text-2xl text-ink mb-3">
                  Preparo Cambridge por mi cuenta.
                </h3>
                <p className="text-muted leading-relaxed mb-6">
                  Acceso a todos los mocks disponibles + correcciones IA
                  ilimitadas del Writing. Ideal si no quieres depender de una
                  academia o si complementas tu preparación en una.
                </p>
                <ul className="space-y-2 text-sm text-ink mb-6">
                  {[
                    "Todos los mocks A2-C2",
                    "Correcciones IA ilimitadas",
                    "Historial de progreso",
                    "14,95€/mes",
                  ].map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-ok" />
                      {i}
                    </li>
                  ))}
                </ul>
                <Link href="/empezar">
                  <Button size="md">Empezar gratis 7 días</Button>
                </Link>
              </div>

              {/* Academia */}
              <div className="rounded-lg border border-rule bg-white p-8">
                <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-2">
                  Academia
                </p>
                <h3 className="font-semibold text-2xl text-ink mb-3">
                  Tengo una academia de idiomas.
                </h3>
                <p className="text-muted leading-relaxed mb-6">
                  Panel del profesor, gestión multi-grupo, informes de
                  progreso, corrección IA validada por el profesor. Ahorra 10h
                  a la semana por profesor corrigiendo Writings.
                </p>
                <ul className="space-y-2 text-sm text-ink mb-6">
                  {[
                    "Panel del profesor",
                    "Gestión multi-grupo y multi-profesor",
                    "Informes por alumno y grupo",
                    "Desde 49,95€/mes (50 plazas)",
                  ].map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-ok" />
                      {i}
                    </li>
                  ))}
                </ul>
                <Link href="/academias">
                  <Button size="md">Ver planes para academias</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            PRECIOS resumen
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-5">
                <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                  Precios transparentes
                </p>
                <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                  Desde <span className="text-navy">14,95€/mes</span> para ti.
                </h2>
                <p className="mt-5 text-muted leading-relaxed">
                  Individual, o planes para academias por plaza (Starter, Pro,
                  Business, Enterprise). Sin permanencia, pago mensual o anual
                  con 2 meses gratis.
                </p>
                <Link href="/precios" className="mt-6 inline-flex">
                  <Button size="md">Comparar todos los planes</Button>
                </Link>
              </div>
              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
                {[
                  { name: "Individual", price: "14,95", tag: "Para ti" },
                  { name: "Starter", price: "49,95", tag: "20 plazas" },
                  {
                    name: "Pro",
                    price: "89,95",
                    tag: "50 plazas",
                    featured: true,
                  },
                  { name: "Business", price: "149,95", tag: "100 plazas" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className={`rounded-lg border p-5 ${
                      p.featured
                        ? "border-navy bg-white"
                        : "border-rule bg-white"
                    }`}
                  >
                    {p.featured && (
                      <p className="text-xs uppercase tracking-wider text-saffron font-semibold mb-1">
                        Más elegido
                      </p>
                    )}
                    <p className="text-sm text-muted">{p.name}</p>
                    <p className="mt-2 font-semibold text-3xl text-ink tracking-tight tabular-nums">
                      {p.price}{" "}
                      <span className="text-base text-muted font-normal">
                        €/mes
                      </span>
                    </p>
                    <p className="text-xs text-muted mt-1">{p.tag}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            FAQ (schema.org)
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Preguntas frecuentes
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Todo lo que necesitas saber antes de empezar.
              </h2>
            </div>

            <div className="max-w-3xl divide-y divide-rule border-y border-rule">
              {faqs.map((f, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="font-medium text-ink text-base pr-4">
                      {f.q}
                    </h3>
                    <span className="text-muted text-2xl group-open:rotate-45 transition-transform flex-shrink-0">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted leading-relaxed pr-8">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            CTA FINAL
            ═══════════════════════════════════ */}
        <section className="bg-navy text-white">
          <div className="max-w-site mx-auto px-6 py-16 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h2 className="font-semibold text-3xl md:text-4xl tracking-tight leading-tight">
                Empieza a preparar Cambridge hoy mismo.
              </h2>
              <p className="mt-4 text-white/80 leading-relaxed max-w-2xl">
                7 días gratis. Sin tarjeta. Sin permanencia. Cancela cuando
                quieras.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/empezar">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-ink"
                >
                  Empezar gratis 7 días
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
