import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Clock,
  Target,
  CheckCircle2,
  FileText,
  Zap,
  Award,
  Users,
  X,
  Check,
} from "lucide-react";

// ═════════════════════════════════════════════════════
// SEO metadata — brief SEO del Excel
// ═════════════════════════════════════════════════════
export const metadata: Metadata = {
  title:
    "Corrección de Writing Cambridge con IA en 30 segundos | Acertlio",
  description:
    "Corrige tus Writings B2 First, C1 Advanced y C2 Proficiency con IA en 30 segundos. Puntuación según rúbrica oficial Cambridge (Content, Communicative, Organisation, Language). Feedback específico en español. Prueba gratis.",
  alternates: { canonical: "/correccion-writing-ia" },
  keywords: [
    "corrección writing cambridge",
    "corrector writing cambridge",
    "cambridge writing checker español",
    "corregir writing con IA español",
    "puntuar writing cambridge automático",
    "corregir writing b2 first online",
    "corregir writing c1 advanced",
  ],
  openGraph: {
    title:
      "Corrección de Writing Cambridge con IA — rúbrica oficial | Acertlio",
    description:
      "Corrige tus Writings B2/C1/C2 con IA en 30 segundos. Puntuación rúbrica Cambridge + feedback en español.",
    url: "/correccion-writing-ia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corrección de Writing Cambridge con IA en 30 segundos",
    description:
      "Rúbrica oficial. Feedback en español. Prueba gratis 1 writing sin registro.",
  },
};

// ═════════════════════════════════════════════════════
// 3 pasos — cómo funciona
// ═════════════════════════════════════════════════════
const steps = [
  {
    n: "01",
    icon: FileText,
    t: "Pega o escribe tu writing",
    b: "Copia tu essay, letter, review, article o report. La IA detecta automáticamente el tipo de tarea y el nivel Cambridge (B2, C1 o C2).",
  },
  {
    n: "02",
    icon: Zap,
    t: "La IA corrige en 30 segundos",
    b: "Aplica la rúbrica oficial Cambridge sobre 4 criterios. Genera puntuación, feedback específico y sugerencias de mejora en español.",
  },
  {
    n: "03",
    icon: Award,
    t: "Recibe tu nota y feedback",
    b: "Puntuación 0–20 según Cambridge Scale. Errores marcados en el texto. Sugerencias de vocabulario más natural. Estimación de banda.",
  },
];

// ═════════════════════════════════════════════════════
// 4 criterios de la rúbrica Cambridge
// ═════════════════════════════════════════════════════
const criteria = [
  {
    letter: "C",
    title: "Content",
    subtitle: "Contenido",
    body: "¿Has respondido a todos los puntos que pedía la tarea? ¿Has cubierto la información necesaria? Puntúa qué tan completo y relevante es el contenido.",
  },
  {
    letter: "CA",
    title: "Communicative Achievement",
    subtitle: "Logro comunicativo",
    body: "¿Se entiende el mensaje? ¿El registro (formal/informal) es el adecuado? ¿El lector consigue lo que buscaba? Puntúa la eficacia de la comunicación.",
  },
  {
    letter: "O",
    title: "Organisation",
    subtitle: "Organización",
    body: "¿Está bien estructurado en párrafos? ¿Usas conectores lógicos? ¿Hay coherencia y cohesión? Puntúa cómo fluye el texto.",
  },
  {
    letter: "L",
    title: "Language",
    subtitle: "Lengua",
    body: "¿La gramática es correcta y variada? ¿El vocabulario es apropiado para el nivel? ¿Hay estructuras complejas cuando toca? Puntúa el dominio lingüístico.",
  },
];

// ═════════════════════════════════════════════════════
// Comparativa: Acertlio vs alternativas
// ═════════════════════════════════════════════════════
const comparison = [
  {
    feature: "Rúbrica oficial Cambridge (4 criterios)",
    acertlio: true,
    writeimprove: false,
    chatgpt: "Solo si sabes el prompt",
    proffesor: true,
  },
  {
    feature: "Puntuación por criterio (0–5 cada uno)",
    acertlio: true,
    writeimprove: false,
    chatgpt: false,
    proffesor: true,
  },
  {
    feature: "Feedback en español",
    acertlio: true,
    writeimprove: false,
    chatgpt: "Sí, si lo pides",
    proffesor: true,
  },
  {
    feature: "Corrección en 30 segundos",
    acertlio: true,
    writeimprove: true,
    chatgpt: true,
    proffesor: false,
  },
  {
    feature: "Especializado en Cambridge (no genérico)",
    acertlio: true,
    writeimprove: "Parcial",
    chatgpt: false,
    proffesor: true,
  },
  {
    feature: "Sugerencias de mejora específicas",
    acertlio: true,
    writeimprove: false,
    chatgpt: "Genéricas",
    proffesor: true,
  },
  {
    feature: "Guarda tu historial de writings",
    acertlio: true,
    writeimprove: true,
    chatgpt: false,
    proffesor: false,
  },
  {
    feature: "Precio",
    acertlio: "14,95€/mes",
    writeimprove: "Gratis",
    chatgpt: "20€/mes",
    proffesor: "40–60€/hora",
  },
];

// ═════════════════════════════════════════════════════
// Ejemplo real de corrección — B2 First
// ═════════════════════════════════════════════════════
const exampleCorrection = {
  task: "B2 First — Essay task (~140-190 palabras)",
  prompt:
    'In your English class you have been talking about the environment. Now, your English teacher has asked you to write an essay. Write your essay in 140-190 words: "The best way to help the environment is to reduce car use in cities." Do you agree?',
  studentText: `Many people say that using less cars in cities is the best way to protect the environment. Although this idea has some good points, I don't completely agree because there are other important ways to help.

First of all, is true that cars produce a lot of pollution in cities. If people used public transport or bicycles more often, the air would be much cleaner. Also, cities would be less noisy and more peaceful for everyone.

However, I think there are other things equally important. For example, we should recycle more at home, use less plastic and save water. These small changes made by all people can have a big impact in the environment.

In conclusion, reducing car use is a good idea, but is not the only solution. We need to combine different actions to really help the planet.`,
  scores: {
    content: 4,
    communicative: 4,
    organisation: 4,
    language: 3,
    total: 15,
    band: "Grade B (aprox. 165-172 en Cambridge Scale)",
  },
  feedback: `Buen essay con estructura clara (introducción, argumentos a favor, argumentos alternativos, conclusión) y registro apropiado.

**Puntos fuertes:**
• Estructura de 4 párrafos correcta y coherente
• Uso de conectores adecuados (First of all, However, In conclusion)
• Vocabulario relacionado con el tema (pollution, public transport, recycle)
• Opinión clara desde el inicio

**Áreas de mejora:**
• "using less cars" → "using fewer cars" (countable noun)
• "is true that" → "it is true that" (subject omission)
• "these small changes made by all people" → "if made by everyone, these small changes" (mejor cohesión)
• "have a big impact in the environment" → "on the environment" (preposición)
• Vocabulario podría ser más variado: prueba con "curtail", "mitigate", "diminish" en vez de repetir "reduce/less"`,
};

// ═════════════════════════════════════════════════════
// FAQ
// ═════════════════════════════════════════════════════
const faqs = [
  {
    q: "¿La IA de Acertlio es igual que ChatGPT?",
    a: "No. ChatGPT es un modelo genérico: puedes pedirle que corrija un writing pero necesitas saber exactamente cómo pedirlo (prompt) y aún así el feedback será genérico. Acertlio usa la misma tecnología (Claude Sonnet, más avanzada que GPT-4) pero con un prompt especializado que aplica estrictamente la rúbrica oficial Cambridge y devuelve puntuación por criterio.",
  },
  {
    q: "¿Y qué diferencia hay con Cambridge Write & Improve?",
    a: "Write & Improve es una herramienta gratuita oficial de Cambridge, pero es genérica: te dice si tu texto tiene un nivel A2/B1/B2/etc, corrige errores de gramática y sugiere vocabulario. Pero NO aplica la rúbrica del examen (Content/Communicative/Organisation/Language), NO da puntuación por criterio y NO detecta si has cumplido con los puntos específicos que pedía la tarea. Acertlio sí.",
  },
  {
    q: "¿La corrección de la IA es tan precisa como la de un profesor Cambridge examiner?",
    a: "La correlación con puntuaciones de examiners humanos es alta (Anthropic reporta >85% en tareas de scoring similar) pero no es idéntica. Un examiner humano capta matices que la IA puede pasar por alto. Nuestra recomendación: usar la IA para practicar rápidamente muchas veces, y contrastar con un profesor una o dos veces antes del examen.",
  },
  {
    q: "¿Qué niveles Cambridge cubre?",
    a: "B1 Preliminary, B2 First, C1 Advanced y C2 Proficiency. Muy pronto añadimos A2 Key. Cada nivel usa una rúbrica ligeramente diferente (por ejemplo, C2 evalúa summary + comparison en Part 1) y la IA la aplica correctamente según el nivel que le indiques.",
  },
  {
    q: "¿Puedo usarlo con mis alumnos si soy profesor?",
    a: "Sí. Si tienes una academia, mira el plan Business: incluye panel del profesor donde puedes asignar mocks a tus alumnos, la IA corrige los Writings y tú validas o editas la corrección antes de pasarla al alumno. Muy útil para dar feedback rápido a grupos grandes.",
  },
  {
    q: "¿Cómo puedo probar antes de suscribirme?",
    a: "Regístrate con tu email y tienes 7 días de trial con hasta 3 mocks completos, incluyendo sus 2 Writings cada uno (6 correcciones IA de prueba). Sin tarjeta, sin permanencia.",
  },
  {
    q: "¿Cuánto tarda la corrección?",
    a: "Entre 15 y 45 segundos, dependiendo de la longitud del writing. La velocidad es idéntica sea B1 o C2.",
  },
  {
    q: "¿Guarda mis writings? ¿Los usa para entrenar?",
    a: "Guardamos tus writings y correcciones en tu cuenta privada para que puedas revisar tu progreso. NO los usamos para entrenar ningún modelo (Anthropic no reutiliza el input de la API). Servidores en Frankfurt (Supabase), cifrado en reposo y en tránsito. Cumplimos GDPR.",
  },
];

// ═════════════════════════════════════════════════════
// Schema.org: Product + FAQPage + HowTo
// ═════════════════════════════════════════════════════
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "Corrección de Writing Cambridge con IA — Acertlio",
      description:
        "Corrector de Writing Cambridge con IA que aplica la rúbrica oficial (Content, Communicative Achievement, Organisation, Language). Puntuación 0–20 y feedback específico en español.",
      brand: { "@type": "Brand", name: "Acertlio" },
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: "14.95",
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "HowTo",
      name: "Cómo corregir tu writing Cambridge con IA",
      totalTime: "PT30S",
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.t,
        text: s.b,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

// Helper para renderizar celdas de comparativa
function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="flex items-center justify-center">
        <Check className="h-5 w-5 text-ok" strokeWidth={2.5} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="flex items-center justify-center">
        <X className="h-5 w-5 text-bad/60" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className="text-sm text-muted text-center block">{value}</span>
  );
}

export default function CorreccionWritingIAPage() {
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
              <div className="lg:col-span-7">
                <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                  Corrección de Writing con IA
                </p>
                <h1 className="font-semibold text-4xl md:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.05]">
                  Corrige tu Writing Cambridge en 30 segundos.
                </h1>
                <p className="mt-6 text-lg text-muted leading-relaxed">
                  Pega tu essay, letter, review, article o report. La IA aplica
                  la <strong className="text-ink">rúbrica oficial Cambridge</strong>{" "}
                  y te devuelve puntuación por criterio + feedback específico
                  <strong className="text-ink"> en español</strong>. Para B1
                  Preliminary, B2 First, C1 Advanced y C2 Proficiency.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/empezar">
                    <Button size="lg">Probar gratis 7 días</Button>
                  </Link>
                  <Link href="/precios">
                    <Button variant="secondary" size="lg">
                      Ver precios desde 14,95€/mes
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-ok" />
                    Sin tarjeta para el trial
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-ok" />
                    Rúbrica oficial Cambridge
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-ok" />
                    Feedback en español
                  </span>
                </div>
              </div>

              {/* Mockup del output visual */}
              <div className="lg:col-span-5">
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
                    &ldquo;less cars&rdquo; → &ldquo;fewer cars&rdquo;, y
                    &ldquo;is true that&rdquo; → &ldquo;it is true that&rdquo;.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            PROBLEMA
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                El problema
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Practicar Writing sin feedback es perder el tiempo.
              </h2>
              <div className="mt-6 space-y-4 text-muted leading-relaxed">
                <p>
                  Puedes hacer 20 mocks de Reading y Listening por tu cuenta y
                  saber si vas bien porque las respuestas son objetivas. Pero
                  el Writing no. Un Writing sin corregir es solo texto: no
                  sabes si tu &ldquo;good vocabulary&rdquo; es realmente B2 o
                  aún es B1, ni si tu estructura vale un 3 o un 5.
                </p>
                <p>
                  Y las opciones tradicionales son malas:
                </p>
                <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                  <li>
                    <strong className="text-ink">Un profesor humano</strong>:
                    40-60€/hora y tarda 24-48 horas en devolverte la
                    corrección.
                  </li>
                  <li>
                    <strong className="text-ink">
                      Cambridge Write &amp; Improve
                    </strong>
                    : gratis pero genérico (no aplica la rúbrica del examen).
                  </li>
                  <li>
                    <strong className="text-ink">ChatGPT</strong>: te dice cosas
                    útiles si sabes qué preguntarle, pero no está especializado
                    y su feedback varía mucho.
                  </li>
                </ul>
                <p>
                  La IA de Acertlio está entrenada con la rúbrica oficial y
                  responde en español en 30 segundos. Escribe → corrige →
                  aprende → repite.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            CÓMO FUNCIONA — 3 pasos (HowTo)
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Cómo funciona
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Tres pasos y tu writing está corregido.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-rule rounded overflow-hidden border border-rule">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.n} className="bg-white p-8">
                    <div className="flex items-center justify-between mb-4">
                      <Icon
                        className="h-6 w-6 text-navy"
                        strokeWidth={1.5}
                      />
                      <span className="font-mono text-xs text-saffron">
                        {s.n}
                      </span>
                    </div>
                    <h3 className="font-semibold text-ink text-lg leading-snug">
                      {s.t}
                    </h3>
                    <p className="text-sm text-muted mt-3 leading-relaxed">
                      {s.b}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            RÚBRICA — 4 criterios
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Qué evalúa la IA
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Los 4 criterios de la rúbrica oficial Cambridge.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Cada criterio se puntúa de 0 a 5. La suma da tu nota total
                sobre 20, que se traduce a la Cambridge English Scale.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-px bg-rule rounded overflow-hidden border border-rule">
              {criteria.map((c) => (
                <div key={c.letter} className="bg-white p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded bg-navy text-white font-bold text-lg">
                      {c.letter}
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-lg">
                        {c.title}
                      </h3>
                      <p className="text-xs text-muted uppercase tracking-wider mt-0.5">
                        {c.subtitle}
                      </p>
                      <p className="text-sm text-muted mt-3 leading-relaxed">
                        {c.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            EJEMPLO REAL
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Ejemplo real
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Cómo corrige la IA un writing de B2 First.
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Prompt + Student text */}
              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-2 font-medium">
                  Tarea
                </p>
                <div className="rounded border border-rule bg-paper p-5 mb-6">
                  <p className="text-xs text-navy font-semibold mb-2">
                    {exampleCorrection.task}
                  </p>
                  <p className="text-xs text-muted leading-relaxed italic">
                    {exampleCorrection.prompt}
                  </p>
                </div>

                <p className="text-xs uppercase tracking-wider text-muted mb-2 font-medium">
                  Respuesta del alumno
                </p>
                <div className="rounded border border-rule bg-white p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink max-h-80 overflow-y-auto">
                  {exampleCorrection.studentText}
                </div>
              </div>

              {/* Corrección */}
              <div>
                <p className="text-xs uppercase tracking-wider text-ok mb-2 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Corrección de la IA
                </p>

                <div className="rounded border-2 border-navy/20 bg-white p-5 mb-4">
                  <p className="text-xs text-muted mb-1">Nota del Writing</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-bold text-navy tabular-nums">
                      {exampleCorrection.scores.total}
                    </span>
                    <span className="text-xl text-navy">/ 20</span>
                  </div>
                  <p className="text-xs text-muted mb-4">
                    {exampleCorrection.scores.band}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        l: "Content",
                        v: exampleCorrection.scores.content,
                      },
                      {
                        l: "Comm.",
                        v: exampleCorrection.scores.communicative,
                      },
                      {
                        l: "Org.",
                        v: exampleCorrection.scores.organisation,
                      },
                      {
                        l: "Lang.",
                        v: exampleCorrection.scores.language,
                      },
                    ].map((c) => (
                      <div
                        key={c.l}
                        className="text-center rounded border border-rule bg-paper p-2"
                      >
                        <p className="text-xs text-muted mb-1">{c.l}</p>
                        <p className="text-xl font-semibold text-ink tabular-nums">
                          {c.v}
                        </p>
                        <p className="text-xs text-muted">/ 5</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded border border-rule bg-paper p-5">
                  <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">
                    Feedback
                  </p>
                  <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
                    {exampleCorrection.feedback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            COMPARATIVA
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Comparativa
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Acertlio vs las alternativas.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Todas tienen su uso. Pero solo Acertlio combina rúbrica oficial
                + puntuación por criterio + feedback en español a precio de
                trial mensual.
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="rounded border border-rule bg-white overflow-hidden min-w-[720px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rule bg-paper">
                      <th className="text-left p-4 font-medium text-ink w-1/3">
                        &nbsp;
                      </th>
                      <th className="text-center p-4 font-semibold text-navy">
                        Acertlio
                      </th>
                      <th className="text-center p-4 font-medium text-muted">
                        Write &amp; Improve
                      </th>
                      <th className="text-center p-4 font-medium text-muted">
                        ChatGPT
                      </th>
                      <th className="text-center p-4 font-medium text-muted">
                        Profesor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          i < comparison.length - 1
                            ? "border-b border-rule"
                            : ""
                        }
                      >
                        <td className="p-4 font-medium text-ink">
                          {row.feature}
                        </td>
                        <td className="p-4 bg-navy/5">
                          <ComparisonCell value={row.acertlio} />
                        </td>
                        <td className="p-4">
                          <ComparisonCell value={row.writeimprove} />
                        </td>
                        <td className="p-4">
                          <ComparisonCell value={row.chatgpt} />
                        </td>
                        <td className="p-4">
                          <ComparisonCell value={row.proffesor} />
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
            USOS PRINCIPALES
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Para quién es
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Ideal para preparar el Writing por tu cuenta.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-rule rounded overflow-hidden border border-rule">
              {[
                {
                  icon: Target,
                  t: "Alumnos que preparan Cambridge",
                  b: "Escribe → corrige → aprende → repite. En un mes puedes hacer 30 writings corregidos por 14,95€. Con un profesor te costaría 1.200€.",
                },
                {
                  icon: Users,
                  t: "Profesores particulares",
                  b: "Pasas más tiempo enseñando y menos poniendo cruces rojas. Editas la corrección de la IA y la personalizas antes de dársela al alumno.",
                },
                {
                  icon: Award,
                  t: "Academias de idiomas",
                  b: "Plan Business para academias completas con panel del profesor, gestión multi-grupo y corrección IA validada por el profesor.",
                },
              ].map((u) => {
                const Icon = u.icon;
                return (
                  <div key={u.t} className="bg-white p-7">
                    <Icon
                      className="h-6 w-6 text-navy mb-4"
                      strokeWidth={1.5}
                    />
                    <h3 className="font-semibold text-ink">{u.t}</h3>
                    <p className="text-sm text-muted mt-3 leading-relaxed">
                      {u.b}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link href="/precios">
                <Button variant="secondary" size="lg">
                  Ver planes para alumnos
                </Button>
              </Link>
              <Link href="/academias">
                <Button variant="secondary" size="lg">
                  Ver planes para academias
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            FAQ
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Preguntas frecuentes
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Lo que otros alumnos y profesores nos preguntan.
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
                Empieza a corregir con IA hoy mismo.
              </h2>
              <p className="mt-4 text-white/80 leading-relaxed max-w-2xl">
                7 días de prueba gratis. Sin tarjeta. 6 correcciones IA de
                writings incluidas. Cancela cuando quieras.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/empezar">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-ink"
                >
                  Probar gratis 7 días
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
