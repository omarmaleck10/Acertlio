import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Clock,
  Zap,
  MousePointer,
  Bookmark,
  Type,
  RefreshCw,
  CheckCircle2,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

// ═════════════════════════════════════════════════════
// SEO metadata — brief del Excel
// ═════════════════════════════════════════════════════
export const metadata: Metadata = {
  title:
    "Examen Cambridge por ordenador (Computer-Based): guía y simulacros | Acertlio",
  description:
    "Todo sobre el examen Cambridge por ordenador: qué es, diferencias con el formato papel, ventajas del computer-based y cómo prepararte con simulacros idénticos al formato oficial. B1, B2, C1 y C2.",
  alternates: { canonical: "/examen-cambridge-computer-based" },
  keywords: [
    "examen cambridge por ordenador",
    "cambridge computer based practice",
    "simulacro cambridge formato digital",
    "cambridge digital practice test",
    "como es el examen cambridge por ordenador",
    "diferencias cambridge papel ordenador",
    "b2 first computer based simulacro",
    "c1 advanced computer based practice",
  ],
  openGraph: {
    title:
      "Examen Cambridge por ordenador — guía completa y simulacros | Acertlio",
    description:
      "Diferencias con el papel, ventajas del formato digital y simulacros idénticos al examen oficial.",
    url: "/examen-cambridge-computer-based",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Examen Cambridge por ordenador: guía y simulacros",
    description:
      "Diferencias con papel, ventajas y simulacros con formato idéntico. B1 a C2.",
  },
};

// ═════════════════════════════════════════════════════
// Contenido
// ═════════════════════════════════════════════════════

// Diferencias papel vs ordenador
const differences = [
  {
    aspect: "Formato de respuestas",
    paper: "Boligrafo sobre papel — pasas a hoja de respuestas al final",
    computer: "Clicas directamente sobre la opción — sin transcripción",
  },
  {
    aspect: "Reading & Use of English",
    paper: "Papel + hoja de respuestas separada",
    computer: "Todo en una pantalla — texto a la izquierda, preguntas a la derecha",
  },
  {
    aspect: "Writing",
    paper: "Escrito a mano en cuadernillo",
    computer: "Teclado, contador de palabras, borrar sin tachar",
  },
  {
    aspect: "Listening",
    paper: "Escuchas + escribes en papel + transcribes al final",
    computer: "Escuchas y clicas — sin tiempo de transcripción",
  },
  {
    aspect: "Speaking",
    paper: "En persona, cara a cara con examinador",
    computer: "En persona, cara a cara con examinador (igual)",
  },
  {
    aspect: "Resultados",
    paper: "Tardan 4-6 semanas",
    computer: "En 2 semanas — más rápido",
  },
  {
    aspect: "Fechas disponibles",
    paper: "Fechas fijas cada 2-3 meses",
    computer: "Fechas mucho más flexibles — casi cada semana",
  },
  {
    aspect: "Marcar preguntas para revisar",
    paper: "Anotar en papel, luego buscar",
    computer: "Botón 'mark for review' — vas directo",
  },
];

// Ventajas del formato computer-based
const advantages = [
  {
    icon: Clock,
    title: "Resultados en 2 semanas",
    body: "En vez de 4-6 semanas del papel. Puedes saber tu nota mucho antes y planear el siguiente paso.",
  },
  {
    icon: RefreshCw,
    title: "Fechas casi cada semana",
    body: "El papel tiene pocas convocatorias al año. El ordenador se hace en centros con disponibilidad continua.",
  },
  {
    icon: Type,
    title: "Writing más rápido y limpio",
    body: "Borras sin tachar, contador de palabras integrado, teclado más rápido que escribir a mano. Ganas 5-10 minutos en el Writing.",
  },
  {
    icon: Bookmark,
    title: "Marcar preguntas para revisar",
    body: "Botón 'flag' en cada pregunta. Al final, ves un resumen y vas directamente a las que marcaste. En papel esto es mucho más engorroso.",
  },
  {
    icon: Zap,
    title: "Reading sin transcripción",
    body: "En papel escribes en el cuadernillo y pasas al final a la hoja de respuestas. Aquí clicas y listo — 10 minutos ahorrados que puedes dedicar a otras preguntas.",
  },
  {
    icon: MousePointer,
    title: "Interfaz cómoda",
    body: "Texto a la izquierda, preguntas a la derecha (Reading). Puedes ampliar el tamaño de letra. Todo pensado para no perder tiempo moviéndote.",
  },
];

// FAQs
const faqs = [
  {
    q: "¿Es más difícil el examen Cambridge por ordenador?",
    a: "No. El contenido y las preguntas son idénticos al papel. Cambridge garantiza la misma dificultad. Lo que cambia es solo el formato de interacción (clic vs papel).",
  },
  {
    q: "¿Debo elegir ordenador o papel?",
    a: "Casi siempre ordenador si tienes soltura con el teclado. Ventajas: resultados en 2 semanas (vs 4-6), fechas casi cada semana, no pierdes tiempo transcribiendo respuestas, y el Writing es más rápido. La única excepción: si tu tipeo en inglés es muy lento o te pones nervioso con las pantallas, el papel puede ser mejor.",
  },
  {
    q: "¿Cuánto vale el examen Cambridge por ordenador?",
    a: "El precio suele ser el mismo o incluso ligeramente inferior al papel. Ronda los 220€ para B2 First, 240€ para C1 Advanced y 260€ para C2 Proficiency (2026, España). Puede variar según el centro examinador.",
  },
  {
    q: "¿Dónde puedo hacer el examen por ordenador?",
    a: "En centros oficiales autorizados por Cambridge en toda España. La red de centros que hacen computer-based crece cada año. Consulta cambridgeenglish.org y filtra por 'computer-based' + tu ciudad.",
  },
  {
    q: "¿Necesito saber usar el ordenador para el examen?",
    a: "Habilidades básicas: usar el ratón, escribir con teclado (mayúsculas, tildes, puntuación), navegar entre pantallas. No necesitas nada avanzado. Cambridge te da un tutorial de 5 minutos al empezar. Practicar con simulacros en formato ordenador (como los nuestros) te quita todo el estrés.",
  },
  {
    q: "¿La corrección es diferente en ordenador vs papel?",
    a: "El Reading, Use of English y Listening se corrigen igual: son objetivos. El Writing se corrige exactamente con la misma rúbrica oficial Cambridge — la única diferencia es que el examiner lee tu texto tecleado en vez de manuscrito. Nada más.",
  },
  {
    q: "¿Puedo practicar el formato ordenador en casa?",
    a: "Sí. Nuestros simulacros reproducen exactamente la interfaz oficial: temporizador, editor de Writing con contador de palabras, marcado de preguntas, navegación entre partes. Cuando llegues al examen real, la pantalla no será ninguna sorpresa.",
  },
  {
    q: "¿Y si me quedo sin batería o falla el ordenador durante el examen?",
    a: "Los centros usan ordenadores fijos con SAI (fuente de alimentación ininterrumpida). Tus respuestas se guardan automáticamente cada pocos segundos. Si hubiera un fallo, se retomaría desde el último punto guardado. El personal del centro está entrenado para gestionar cualquier incidencia.",
  },
];

// Niveles
const levels = [
  {
    code: "A2",
    name: "A2 Key",
    href: "/preparacion-a2-key-online",
    description: "Nivel elemental — ideal para primeras oposiciones y colegios",
  },
  {
    code: "B1",
    name: "B1 Preliminary",
    href: "/preparacion-b1-preliminary-online",
    description: "Nivel intermedio — requisito frecuente para universidad",
  },
  {
    code: "B2",
    name: "B2 First (FCE)",
    href: "/preparacion-b2-first-online",
    description: "El más solicitado en España — grado, becas, oposiciones",
    featured: true,
  },
  {
    code: "C1",
    name: "C1 Advanced (CAE)",
    href: "/preparacion-c1-advanced-online",
    description: "Nivel alto — másteres internacionales, promociones",
  },
  {
    code: "C2",
    name: "C2 Proficiency (CPE)",
    href: "/preparacion-c2-proficiency-online",
    description: "Nivel de dominio — enseñanza, traducción, universidad UK",
  },
];

// ═════════════════════════════════════════════════════
// Schema.org: Article + FAQPage + BreadcrumbList
// ═════════════════════════════════════════════════════
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline:
        "Examen Cambridge por ordenador (Computer-Based): guía completa y simulacros",
      description:
        "Todo sobre el examen Cambridge por ordenador: diferencias con el formato papel, ventajas del computer-based y cómo prepararte con simulacros idénticos.",
      author: {
        "@type": "Organization",
        name: "Acertlio",
      },
      publisher: {
        "@type": "Organization",
        name: "Acertlio",
        logo: {
          "@type": "ImageObject",
          url: "https://acertlio.com/logo.png",
        },
      },
      datePublished: "2026-01-15",
      dateModified: new Date().toISOString().split("T")[0],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Acertlio",
          item: "https://acertlio.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Examen Cambridge por ordenador",
          item: "https://acertlio.com/examen-cambridge-computer-based",
        },
      ],
    },
  ],
};

export default function ComputerBasedPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingHeader />

      <main>
        {/* ═══════════════════════════════════
            HERO
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 pt-20 pb-20">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                  Formato del examen Cambridge
                </p>
                <h1 className="font-semibold text-4xl md:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.05]">
                  Examen Cambridge por ordenador: guía y simulacros.
                </h1>
                <p className="mt-6 text-lg text-muted leading-relaxed">
                  Cada vez más alumnos hacen el examen{" "}
                  <strong className="text-ink">
                    Cambridge en formato computer-based
                  </strong>
                  . Aquí te contamos qué es, en qué se diferencia del papel,
                  qué ventajas tiene y cómo practicar con simulacros idénticos
                  al formato oficial.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/empezar">
                    <Button size="lg">
                      Probar un simulacro gratis
                    </Button>
                  </Link>
                  <a href="#diferencias">
                    <Button variant="secondary" size="lg">
                      Ver diferencias vs papel
                    </Button>
                  </a>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-ok" />
                    Interfaz idéntica al oficial
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-ok" />
                    B1, B2, C1 y C2
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-ok" />
                    Sin instalaciones
                  </span>
                </div>
              </div>

              {/* Mockup pantalla examen */}
              <div className="lg:col-span-6">
                <div className="rounded-lg border border-rule bg-white shadow-sm overflow-hidden">
                  {/* Barra superior */}
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
                        25 / 42
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <p className="text-xs text-muted uppercase tracking-wider mb-3 font-medium">
                      Pregunta 25
                    </p>
                    <p className="text-sm text-ink leading-relaxed mb-5">
                      What does the writer suggest about young musicians in the
                      second paragraph?
                    </p>

                    <div className="space-y-2">
                      {[
                        {
                          l: "A",
                          t: "They are more likely to succeed if they start early.",
                          sel: false,
                        },
                        {
                          l: "B",
                          t: "They need to focus on developing their own unique style.",
                          sel: true,
                        },
                        {
                          l: "C",
                          t: "They should follow the advice of established artists.",
                          sel: false,
                        },
                        {
                          l: "D",
                          t: "They benefit most from formal music education.",
                          sel: false,
                        },
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
                          <span
                            className={opt.sel ? "text-ink" : "text-muted"}
                          >
                            {opt.t}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Barra inferior */}
                  <div className="border-t border-rule bg-paper px-5 py-3 flex items-center justify-between text-xs">
                    <button className="text-muted">← Anterior</button>
                    <div className="flex items-center gap-3">
                      <button className="text-muted flex items-center gap-1.5">
                        <Bookmark className="h-3.5 w-3.5" />
                        Marcar para revisar
                      </button>
                      <button className="text-navy font-medium">
                        Siguiente →
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted mt-3 text-center italic">
                  Mockup real de la interfaz de nuestros simulacros
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            QUÉ ES
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Empecemos por lo básico
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                ¿Qué es el examen Cambridge por ordenador?
              </h2>
              <div className="mt-6 space-y-4 text-muted leading-relaxed">
                <p>
                  Cambridge English lleva ofreciendo{" "}
                  <strong className="text-ink">
                    dos formatos del mismo examen
                  </strong>{" "}
                  desde hace años: el clásico en papel y el nuevo por ordenador
                  (computer-based). El contenido es idéntico, la puntuación es
                  idéntica y el certificado que recibes es exactamente el
                  mismo. Lo único que cambia es cómo interactúas con el examen
                  el día D.
                </p>
                <p>
                  En el <strong className="text-ink">papel</strong>, respondes
                  con boli sobre un cuadernillo y luego transcribes tus
                  respuestas a una hoja aparte. En el{" "}
                  <strong className="text-ink">ordenador</strong>, respondes
                  clicando o tecleando directamente sobre la pantalla. Ambos
                  formatos se hacen en un centro examinador oficial, con
                  supervisión presencial.
                </p>
                <p>
                  El formato computer-based está disponible en{" "}
                  <strong className="text-ink">
                    B1 Preliminary, B2 First, C1 Advanced y C2 Proficiency
                  </strong>
                  , tanto en la versión adulto como en la for Schools (para
                  menores de 18 años). El Speaking sigue siendo presencial cara
                  a cara con el examinador — eso es igual en ambos formatos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            DIFERENCIAS — tabla comparativa
            ═══════════════════════════════════ */}
        <section
          id="diferencias"
          className="border-b border-rule"
        >
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Comparativa
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Diferencias entre Cambridge en papel y por ordenador.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                8 puntos concretos que cambian entre los dos formatos.
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="rounded border border-rule bg-white overflow-hidden min-w-[720px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rule bg-paper">
                      <th className="text-left p-4 font-medium text-ink w-1/4">
                        Aspecto
                      </th>
                      <th className="text-left p-4 font-medium text-muted">
                        En papel
                      </th>
                      <th className="text-left p-4 font-medium text-navy">
                        Por ordenador
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {differences.map((d, i) => (
                      <tr
                        key={i}
                        className={
                          i < differences.length - 1
                            ? "border-b border-rule"
                            : ""
                        }
                      >
                        <td className="p-4 font-medium text-ink">
                          {d.aspect}
                        </td>
                        <td className="p-4 text-muted">
                          <span className="flex items-start gap-2">
                            <X className="h-4 w-4 text-muted/50 flex-shrink-0 mt-0.5" />
                            {d.paper}
                          </span>
                        </td>
                        <td className="p-4 text-ink">
                          <span className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-ok flex-shrink-0 mt-0.5" />
                            {d.computer}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            VENTAJAS
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Por qué elegirlo
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                6 ventajas del formato computer-based.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Si tienes soltura con el teclado, hay pocos motivos para elegir
                el formato papel.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule rounded overflow-hidden border border-rule">
              {advantages.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="bg-white p-6">
                    <Icon
                      className="h-6 w-6 text-navy mb-4"
                      strokeWidth={1.5}
                    />
                    <h3 className="font-semibold text-ink">{a.title}</h3>
                    <p className="text-sm text-muted mt-3 leading-relaxed">
                      {a.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            CÓMO PREPARARTE — nuestros simulacros
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Cómo prepararte
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Simulacros con formato idéntico al examen real.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                La única forma de estar preparado para el formato computer-based
                es practicar con esa interfaz. En Acertlio replicamos cada
                detalle: temporizador visible, editor de Writing con contador,
                marcado de preguntas para revisar, navegación entre partes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  n: "01",
                  t: "Elige tu nivel",
                  b: "B1, B2, C1 o C2. Cada nivel con mocks completos incluidos.",
                },
                {
                  n: "02",
                  t: "Haz simulacros con la interfaz oficial",
                  b: "Formato idéntico al examen real. Timing real, editor completo, todo.",
                },
                {
                  n: "03",
                  t: "Recibe corrección + feedback",
                  b: "Reading y Listening automáticos. Writing con IA en 30 segundos.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-lg border border-rule bg-white p-6"
                >
                  <p className="font-mono text-xs text-saffron mb-3">{s.n}</p>
                  <h3 className="font-semibold text-ink">{s.t}</h3>
                  <p className="text-sm text-muted mt-3 leading-relaxed">
                    {s.b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            NIVELES — links a landings
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Nuestros simulacros
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Simulacros Cambridge por ordenador por nivel.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Todos los niveles Cambridge en formato computer-based. Elige el
                tuyo y empieza a practicar.
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
                  </div>
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
            FAQ
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Preguntas frecuentes
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Todo lo que preguntan sobre el examen por ordenador.
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
          <div className="max-w-site mx-auto px-6 py-20 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h2 className="font-semibold text-3xl md:text-4xl tracking-tight leading-tight">
                Practica el formato computer-based hoy.
              </h2>
              <p className="mt-4 text-white/80 leading-relaxed max-w-2xl">
                7 días de trial gratis con 3 mocks completos. Sin tarjeta. Cuando
                llegues al examen real, la pantalla no será ninguna sorpresa.
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
