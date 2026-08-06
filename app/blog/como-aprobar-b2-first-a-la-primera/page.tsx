import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Sparkles,
  ArrowRight,
  Home as HomeIcon,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

// ═════════════════════════════════════════════════════
// SEO — post pilar cluster "Cómo Aprobar"
// ═════════════════════════════════════════════════════
export const metadata: Metadata = {
  title:
    "Cómo aprobar el B2 First a la primera: guía completa 2026 | Acertlio",
  description:
    "Estructura del B2 First, plan de estudio realista de 3 a 6 meses, estrategias por parte (Reading, Use of English, Writing, Listening, Speaking) y los errores más comunes que hacen que se suspenda. Guía escrita por profesores en 2026.",
  alternates: { canonical: "/blog/como-aprobar-b2-first-a-la-primera" },
  keywords: [
    "como aprobar b2 first",
    "b2 first cambridge",
    "aprobar fce a la primera",
    "estructura examen b2 first",
    "consejos b2 first",
    "errores comunes b2 first",
    "nota mínima aprobar b2 first",
    "plan estudio b2 first",
  ],
  openGraph: {
    title:
      "Cómo aprobar el B2 First a la primera: guía completa 2026",
    description:
      "Estructura, plan de estudio, estrategias por parte y errores comunes. Escrito por profesores.",
    url: "/blog/como-aprobar-b2-first-a-la-primera",
    type: "article",
    publishedTime: "2026-08-05T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo aprobar el B2 First a la primera: guía 2026",
    description:
      "Estructura, plan de estudio, estrategias y errores comunes.",
  },
};

// ═════════════════════════════════════════════════════
// Tabla de contenidos (para navegación + SEO)
// ═════════════════════════════════════════════════════
const TOC = [
  { id: "que-es", label: "¿Qué es el B2 First?" },
  { id: "estructura", label: "Estructura del examen" },
  { id: "puntuacion", label: "Cómo se puntúa" },
  { id: "plan-estudio", label: "Plan de estudio realista" },
  { id: "estrategias", label: "Estrategias por parte" },
  { id: "errores", label: "Errores comunes" },
  { id: "ultimos-dias", label: "Los últimos 7 días" },
  { id: "faq", label: "Preguntas frecuentes" },
];

// FAQ Schema.org
const faqs = [
  {
    q: "¿Es difícil aprobar el B2 First a la primera?",
    a: "Aproximadamente el 70% de los candidatos aprueba a la primera según los datos históricos de Cambridge English. La clave está en la preparación estructurada: entender la rúbrica del examen, hacer simulacros regulares, y trabajar los errores frecuentes de hispanohablantes.",
  },
  {
    q: "¿Cuánto tiempo se tarda en preparar el B2 First desde cero?",
    a: "Depende del nivel inicial. Desde un B1 sólido: 4-6 meses con 6-8 horas semanales. Desde un B1 débil: 8-12 meses. Desde B2 aún sin haber preparado el examen específicamente: 2-3 meses de preparación intensiva focused en el formato.",
  },
  {
    q: "¿Cuál es la nota mínima para aprobar el B2 First?",
    a: "Necesitas obtener al menos 160 puntos en la Cambridge English Scale (que va de 140 a 190) para conseguir el certificado con Grade C. Esto equivale aproximadamente al 60% del examen. Grade B es a partir de 173 y Grade A a partir de 180.",
  },
  {
    q: "¿Cuánto vale el examen B2 First en España?",
    a: "Ronda los 220€ para el formato por ordenador y algo similar para el papel, aunque puede variar según el centro examinador. Consulta directamente con el centro donde te vayas a presentar para el precio exacto.",
  },
  {
    q: "¿Cuál es la mejor parte del examen para empezar a preparar?",
    a: "El Writing y el Use of English son las partes donde más suele fallar la gente y donde más puedes ganar puntos con preparación específica. El Reading y el Listening mejoran de forma más orgánica con exposición al inglés. Nuestro consejo: dedica al menos el 40% de tu tiempo de estudio al Writing durante los primeros meses.",
  },
  {
    q: "¿Merece la pena hacer un curso o puedo prepararlo por mi cuenta?",
    a: "Puedes prepararlo por tu cuenta si tienes disciplina y usas materiales oficiales. Un curso ayuda con dos cosas: obliga a mantener un ritmo constante y te da feedback sobre el Writing (que sin corrección es difícil de trabajar). Con plataformas como Acertlio puedes hacer los simulacros por tu cuenta y recibir corrección IA del Writing por menos de un curso.",
  },
  {
    q: "¿Qué hago si suspendo el B2 First?",
    a: "Si suspendes con Grade C-B (147-159 puntos) recibes el certificado del nivel B1 automáticamente, así que no te vas sin nada. Analiza qué parte fallaste (Cambridge te da el desglose), refuerza esa parte específicamente y preséntate en 2-3 meses. No caigas en el error de presentarte a la siguiente convocatoria sin cambiar nada de tu preparación.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline:
        "Cómo aprobar el B2 First a la primera: guía completa 2026",
      description:
        "Estructura del examen, plan de estudio realista, estrategias por parte y los errores más comunes que hacen que se suspenda.",
      author: { "@type": "Organization", name: "Acertlio" },
      publisher: {
        "@type": "Organization",
        name: "Acertlio",
        logo: {
          "@type": "ImageObject",
          url: "https://acertlio.com/logo.png",
        },
      },
      datePublished: "2026-08-05",
      dateModified: "2026-08-05",
      wordCount: 2500,
      articleSection: "Preparación Cambridge",
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
          name: "Blog",
          item: "https://acertlio.com/blog",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Cómo aprobar el B2 First a la primera",
          item: "https://acertlio.com/blog/como-aprobar-b2-first-a-la-primera",
        },
      ],
    },
  ],
};

export default function Post() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingHeader />

      <main>
        {/* Breadcrumbs */}
        <div className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-muted"
            >
              <Link
                href="/"
                className="flex items-center gap-1.5 hover:text-ink"
              >
                <HomeIcon className="h-3 w-3" />
                Acertlio
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/blog" className="hover:text-ink">
                Blog
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-ink">
                Cómo aprobar el B2 First a la primera
              </span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 pt-12 pb-8">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Cómo aprobar Cambridge · B2 First
              </p>
              <h1 className="font-semibold text-4xl md:text-5xl text-ink tracking-tight leading-[1.05]">
                Cómo aprobar el B2 First a la primera: guía completa 2026.
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted">
                <span>5 de agosto de 2026</span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  14 min de lectura
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contenido */}
        <article className="max-w-site mx-auto px-6 py-12 grid lg:grid-cols-12 gap-12">
          {/* TOC lateral */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-4">
                En este artículo
              </p>
              <nav className="space-y-2">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-muted hover:text-navy transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Contenido principal */}
          <div className="lg:col-span-9 order-1 lg:order-2 max-w-3xl">
            {/* Intro */}
            <div className="prose-content space-y-5 text-ink text-lg leading-relaxed">
              <p className="text-xl text-muted">
                El B2 First es el examen más solicitado en España: lo piden
                universidades para dar por acreditado el nivel exigido en
                grados, oposiciones y muchos programas de becas. Según los
                datos históricos de Cambridge English,{" "}
                <strong className="text-ink">
                  aproximadamente el 70% de los candidatos aprueba a la primera
                </strong>
                . El 30% restante suele fallar por las mismas razones:
                subestimar el Writing, no practicar bajo condiciones reales de
                examen, y llegar el día D sin haber visto nunca la interfaz
                computer-based.
              </p>
              <p>
                En esta guía te contamos, punto por punto, qué hay que hacer
                para aprobar a la primera con una preparación de entre 3 y 6
                meses. Está escrita por profesores que llevan más de una década
                preparando alumnos para el B2 First.
              </p>
            </div>

            {/* Sección 1: Qué es */}
            <h2
              id="que-es"
              className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6"
            >
              1. ¿Qué es el B2 First y para qué sirve?
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                El B2 First (antes conocido como First Certificate in English
                o FCE) es el examen oficial de Cambridge English que acredita
                un nivel B2 según el Marco Común Europeo de Referencia (MCER).
                Es el nivel &ldquo;intermedio alto&rdquo;: puedes entender
                textos complejos sobre temas conocidos, expresarte con
                fluidez razonable y producir textos claros sobre una amplia
                variedad de temas.
              </p>
              <p>
                <strong className="text-ink">Para qué te sirve el B2 First:</strong>
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>Universidad</strong>: acreditar el nivel B2 exigido
                  para acceder a grados en universidades españolas.
                </li>
                <li>
                  <strong>Becas</strong>: la mayoría de becas nacionales e
                  internacionales lo aceptan.
                </li>
                <li>
                  <strong>Oposiciones</strong>: puntúa en oposiciones docentes
                  (Secundaria, Formación Profesional) y en otras
                  administraciones.
                </li>
                <li>
                  <strong>Trabajo</strong>: es el certificado más reconocido
                  por empresas en España a nivel B2.
                </li>
                <li>
                  <strong>Erasmus</strong>: cumple el requisito lingüístico
                  para la mayoría de destinos.
                </li>
              </ul>
              <p>
                El certificado es <strong>válido para siempre</strong> (no
                caduca), aunque muchas instituciones prefieren certificados de
                los últimos 2 años. Ojo con esto si haces el examen y luego
                pasan 5 años sin usarlo — algunas oposiciones pueden pedir
                revalidación.
              </p>
            </div>

            {/* Sección 2: Estructura */}
            <h2
              id="estructura"
              className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6"
            >
              2. Estructura del examen: las 4 partes
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                El B2 First se divide en 4 partes que se hacen a lo largo del
                mismo día (excepto el Speaking, que puede ser otro día o
                incluso en otra semana). El examen se puede hacer en{" "}
                <strong>papel o por ordenador (computer-based)</strong> y el
                contenido es idéntico en ambos formatos.
              </p>

              <div className="my-8 overflow-x-auto">
                <table className="w-full text-sm border border-rule rounded overflow-hidden">
                  <thead>
                    <tr className="bg-paper border-b border-rule">
                      <th className="text-left p-3 font-semibold text-ink">
                        Parte
                      </th>
                      <th className="text-left p-3 font-semibold text-ink">
                        Duración
                      </th>
                      <th className="text-left p-3 font-semibold text-ink">
                        Peso
                      </th>
                      <th className="text-left p-3 font-semibold text-ink">
                        Qué se evalúa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">
                        Reading &amp; Use of English
                      </td>
                      <td className="p-3">75 min</td>
                      <td className="p-3 tabular-nums">40%</td>
                      <td className="p-3">
                        Comprensión lectora + gramática y vocabulario
                      </td>
                    </tr>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">Writing</td>
                      <td className="p-3">80 min</td>
                      <td className="p-3 tabular-nums">20%</td>
                      <td className="p-3">
                        Dos textos: essay obligatorio + una tarea a elegir
                      </td>
                    </tr>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">Listening</td>
                      <td className="p-3">40 min</td>
                      <td className="p-3 tabular-nums">20%</td>
                      <td className="p-3">
                        Comprensión auditiva en 4 partes
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-3 font-medium">Speaking</td>
                      <td className="p-3">14 min</td>
                      <td className="p-3 tabular-nums">20%</td>
                      <td className="p-3">
                        Entrevista oral en parejas (con otro candidato)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Fíjate en un detalle importante: el{" "}
                <strong>Reading + Use of English pesa el 40%</strong> del
                total. Por eso es la parte donde más rentable resulta
                prepararse a fondo. Un buen Reading puede compensar un Writing
                mediocre, pero al revés es casi imposible.
              </p>
            </div>

            {/* Sección 3: Puntuación */}
            <h2
              id="puntuacion"
              className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6"
            >
              3. Cómo se puntúa el B2 First
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                Cambridge English usa una escala propia llamada Cambridge
                English Scale, que va de 140 a 190 puntos. La equivalencia con
                los grados que aparecen en el certificado es esta:
              </p>

              <div className="my-6 grid sm:grid-cols-3 gap-3">
                <div className="rounded border-2 border-ok bg-ok/5 p-4">
                  <p className="font-mono text-3xl font-bold text-ok tabular-nums">
                    180-190
                  </p>
                  <p className="text-sm font-semibold text-ink mt-2">
                    Grade A
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Certificado de nivel C1
                  </p>
                </div>
                <div className="rounded border-2 border-navy bg-navy/5 p-4">
                  <p className="font-mono text-3xl font-bold text-navy tabular-nums">
                    173-179
                  </p>
                  <p className="text-sm font-semibold text-ink mt-2">
                    Grade B
                  </p>
                  <p className="text-xs text-muted mt-1">B2 con nota alta</p>
                </div>
                <div className="rounded border-2 border-saffron bg-saffron/5 p-4">
                  <p className="font-mono text-3xl font-bold text-saffron tabular-nums">
                    160-172
                  </p>
                  <p className="text-sm font-semibold text-ink mt-2">
                    Grade C
                  </p>
                  <p className="text-xs text-muted mt-1">
                    B2 aprobado (mínimo)
                  </p>
                </div>
              </div>

              <p>
                Si suspendes con puntuación entre 147 y 159, recibes
                automáticamente un certificado de nivel B1. No te vas sin nada,
                pero obviamente no es lo que buscabas. Por debajo de 147, no
                hay certificado.
              </p>
              <p>
                La puntuación final es la <strong>media aritmética</strong> de
                las 4 partes. Es decir, no hay un mínimo obligatorio en cada
                parte por separado: puedes compensar un Writing regular con un
                Reading excelente. Pero cuidado, si suspendes catastróficamente
                una parte, es difícil recuperar puntos suficientes en las otras.
              </p>
            </div>

            {/* Sección 4: Plan de estudio */}
            <h2
              id="plan-estudio"
              className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6"
            >
              4. Plan de estudio realista (3 o 6 meses)
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                Antes de proponerte un plan, mide honestamente en qué punto
                estás. Haz un mock inicial completo, sin trampas, en las
                condiciones más reales que puedas simular. Compara la nota con
                los rangos de arriba y sabrás cuántos meses te hacen falta.
              </p>

              <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
                Si sacas menos de 140 en el mock inicial
              </h3>
              <p>
                Tu nivel es B1 débil. Necesitas <strong>8-12 meses</strong> con
                8-10 horas semanales, y probablemente conviene apoyarte en un
                curso o academia. Trabaja primero el nivel general antes de
                centrarte en el formato del examen.
              </p>

              <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
                Si sacas entre 140 y 155 en el mock inicial
              </h3>
              <p>
                Estás cerca. Necesitas <strong>4-6 meses</strong> con 6-8 horas
                semanales. Divide el tiempo así:
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>40% Writing y Use of English</strong>: las partes más
                  técnicas y donde más margen tienes
                </li>
                <li>
                  <strong>25% Reading</strong>: dos textos largos por semana +
                  técnica de skimming/scanning
                </li>
                <li>
                  <strong>20% Listening</strong>: escuchar podcasts en inglés
                  todos los días + ejercicios oficiales del formato
                </li>
                <li>
                  <strong>15% Speaking</strong>: conversar en inglés dos veces
                  por semana (mínimo)
                </li>
              </ul>

              <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
                Si sacas 155 o más en el mock inicial
              </h3>
              <p>
                Ya casi lo tienes. Necesitas{" "}
                <strong>6-10 semanas</strong> de preparación intensiva
                centrada en el <strong>formato específico</strong> del examen:
                practicar exactamente los tipos de tareas del Writing (essay,
                letter, review, article, report), memorizar phrasal verbs y
                collocations típicas de las Parts 1-4 del Use of English, y
                hacer 2-3 mocks completos bajo condiciones reales.
              </p>
            </div>

            {/* CTA in-content */}
            <div className="mt-12 rounded-lg border-2 border-navy bg-navy/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-navy" />
                  <p className="text-xs uppercase tracking-wider text-navy font-semibold">
                    Simulacros gratis 7 días
                  </p>
                </div>
                <p className="text-ink font-medium leading-snug">
                  Haz tu primer mock B2 First para saber por dónde empezar
                </p>
                <p className="text-sm text-muted mt-2">
                  Formato computer-based idéntico al examen oficial. Con
                  corrección IA del Writing en 30 segundos.
                </p>
              </div>
              <Link href="/preparacion-b2-first-online" className="flex-shrink-0">
                <Button size="lg">Ver simulacros B2 First</Button>
              </Link>
            </div>

            {/* Sección 5: Estrategias */}
            <h2
              id="estrategias"
              className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6"
            >
              5. Estrategias por parte
            </h2>

            <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
              Reading &amp; Use of English (75 min)
            </h3>
            <div className="prose-content space-y-4 text-ink leading-relaxed">
              <p>
                Son 7 partes en 75 minutos. Aproximadamente{" "}
                <strong>10 minutos por parte</strong>. Las partes 1-4 son Use
                of English (gramática y vocabulario) y las 5-7 son Reading
                (comprensión).
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>Part 1 (Multiple choice cloze)</strong>: mide
                  vocabulario. Los distractores son sinónimos parciales, pero
                  solo uno colloca correctamente. Aprende collocations, no
                  palabras sueltas.
                </li>
                <li>
                  <strong>Part 2 (Open cloze)</strong>: mide gramática. Casi
                  siempre son artículos, preposiciones, pronombres relativos,
                  conjunciones. Practica esos elementos específicamente.
                </li>
                <li>
                  <strong>Part 3 (Word formation)</strong>: te dan una palabra
                  raíz y tienes que derivar. Estudia sufijos (-tion, -ment,
                  -able) y prefijos (un-, dis-, mis-).
                </li>
                <li>
                  <strong>Part 4 (Key word transformations)</strong>: la más
                  odiada. Requiere reformular usando entre 2 y 5 palabras. Mira
                  ejemplos oficiales — hay estructuras que se repiten (reported
                  speech, conditionals, passive).
                </li>
                <li>
                  <strong>Part 5 (Multiple choice, texto largo)</strong>: 6
                  preguntas sobre un texto de 550-650 palabras. Lee primero las
                  preguntas y subraya lo relevante en el texto.
                </li>
                <li>
                  <strong>Part 6 (Gapped text)</strong>: te faltan 6 frases y
                  hay 7 opciones. La técnica: fíjate en los conectores
                  lingüísticos y en la referencia (pronombres, temas).
                </li>
                <li>
                  <strong>Part 7 (Multiple matching)</strong>: 4 textos
                  cortos, 10 preguntas. Scanning puro: buscas información
                  específica sin leer todo.
                </li>
              </ul>
            </div>

            <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
              Writing (80 min, 2 textos de 140-190 palabras)
            </h3>
            <div className="prose-content space-y-4 text-ink leading-relaxed">
              <p>
                Es la parte que más suspende. Y sin embargo, es donde más
                puedes mejorar con práctica dirigida.
              </p>
              <p>
                <strong>Part 1 obligatoria: Essay</strong>. Te dan una pregunta
                sobre un tema (medio ambiente, tecnología, viajes...) y dos
                puntos a desarrollar. Debes añadir un tercer punto propio. La
                estructura estándar: introducción con posicionamiento, 3
                párrafos (uno por cada punto) y conclusión reforzando tu
                opinión. Registro semi-formal.
              </p>
              <p>
                <strong>Part 2 a elegir</strong>: letter/email, review, article,
                report. Elige lo que mejor domines. Si no tienes preferencia,
                el review y el article suelen ser los más asequibles porque
                permiten más creatividad. Los reports (formal, con headings) y
                letters formales requieren registro estricto.
              </p>
              <p>
                <strong>Qué evalúa la rúbrica oficial</strong>: 4 criterios
                (Content, Communicative Achievement, Organisation, Language)
                cada uno de 0 a 5 puntos. La correlación con la nota final es
                fuerte, así que trabajar los 4 explícitamente es la mejor
                inversión.
              </p>
            </div>

            <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
              Listening (40 min, 4 partes)
            </h3>
            <div className="prose-content space-y-4 text-ink leading-relaxed">
              <p>
                Los audios se escuchan <strong>dos veces</strong> (excepto
                Part 3 en algunas versiones). La técnica clave es{" "}
                <strong>usar la primera escucha para captar el sentido
                general</strong> y la segunda para confirmar detalles concretos.
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>Part 1</strong>: 8 conversaciones cortas, multiple
                  choice. Presta atención a los conectores adversativos
                  (however, but, although) — suelen contener la respuesta.
                </li>
                <li>
                  <strong>Part 2</strong>: monólogo de 3 minutos, rellenar
                  huecos. Escribe exactamente lo que oigas — no parafrasees.
                </li>
                <li>
                  <strong>Part 3</strong>: 5 monólogos cortos con relación
                  entre sí, matching. Se puede volver a escuchar solo una vez
                  la secuencia completa.
                </li>
                <li>
                  <strong>Part 4</strong>: entrevista larga, multiple choice.
                  Lee las preguntas antes de empezar y subraya palabras clave.
                </li>
              </ul>
            </div>

            <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
              Speaking (14 min, en pareja)
            </h3>
            <div className="prose-content space-y-4 text-ink leading-relaxed">
              <p>
                Es la parte más corta pero pesa lo mismo que el Writing (20%).
                Se hace <strong>en pareja</strong> con otro candidato al azar y
                hay dos examinadores presentes.
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>Part 1 (2 min)</strong>: preguntas personales. Ten
                  respuestas preparadas para las típicas (family, hobbies,
                  studies, hometown). Extiende las respuestas — nada de
                  monosílabos.
                </li>
                <li>
                  <strong>Part 2 (4 min)</strong>: comparar 2 fotos durante 1
                  minuto cada uno. La clave: comparar (both, whereas), no
                  describir. Usa vocabulario de speculation (they might be...,
                  it looks like...).
                </li>
                <li>
                  <strong>Part 3 (4 min)</strong>: interacción con tu
                  compañero. Debatís opciones. Aquí importa mucho la
                  interacción real: haz preguntas, discrepa, propon. Los
                  examinadores puntúan si sabes gestionar una conversación.
                </li>
                <li>
                  <strong>Part 4 (4 min)</strong>: preguntas más profundas
                  relacionadas con Part 3. Da opinión con matices, no en
                  blanco/negro.
                </li>
              </ul>
              <p>
                <strong>Consejo crítico</strong>: no compitas con tu compañero.
                Los examinadores no comparan entre vosotros — cada uno tiene su
                puntuación. Si tu compañero es peor, no ganas nada aplastándolo;
                al contrario, muestras mala interacción. Ayúdale a hablar más:
                harás mejor Speaking Part 3 y 4.
              </p>
            </div>

            {/* Sección 6: Errores */}
            <h2
              id="errores"
              className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6"
            >
              6. Errores comunes que hacen que se suspenda
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>Los recurrentes en alumnos españoles:</p>
              <ul className="ml-6 space-y-3 list-disc marker:text-saffron">
                <li>
                  <strong>Confundir countable/uncountable</strong>: &ldquo;an
                  advice&rdquo; (mal, es uncountable → &ldquo;a piece of
                  advice&rdquo;), &ldquo;less people&rdquo; (mal → &ldquo;fewer
                  people&rdquo;), &ldquo;informations&rdquo; (mal, uncountable).
                </li>
                <li>
                  <strong>Omitir el subject/it</strong>: influencia del
                  español. &ldquo;Is raining&rdquo; (mal → &ldquo;It is
                  raining&rdquo;), &ldquo;Depends&rdquo; (mal → &ldquo;It
                  depends&rdquo;).
                </li>
                <li>
                  <strong>Usar mal los tiempos verbales</strong>: especialmente
                  present perfect vs past simple. &ldquo;I lived in London 2
                  years&rdquo; (ambiguo — si sigues viviendo: &ldquo;I have
                  been living...&rdquo;).
                </li>
                <li>
                  <strong>Word order en preguntas indirectas</strong>: &ldquo;I
                  wonder where is he&rdquo; (mal → &ldquo;where he is&rdquo;).
                </li>
                <li>
                  <strong>Falsos amigos</strong>: actually (en realidad, no
                  actualmente), library (biblioteca, no librería), sensible
                  (razonable, no sensible), assist (ayudar, no asistir).
                </li>
                <li>
                  <strong>Preposiciones fijas</strong>: depend ON, agree WITH,
                  arrive AT/IN, listen TO. Aprender por bloques, no memorizar
                  reglas.
                </li>
                <li>
                  <strong>Repetir vocabulario</strong>: usar &ldquo;important
                  important important&rdquo; en 3 párrafos baja Language.
                  Sinónimos: crucial, essential, vital, key, significant.
                </li>
              </ul>
              <p>
                Errores de estrategia (no de gramática) igual de mortales:
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>No leer las instrucciones</strong>: en el Writing te
                  piden 140-190 palabras. 130 penaliza. 210 también (pierdes
                  Content por no ajustarte).
                </li>
                <li>
                  <strong>Dejar preguntas en blanco</strong>: no hay penalización
                  por respuesta incorrecta. Siempre responde.
                </li>
                <li>
                  <strong>Confiar en el borrador el día del examen</strong>:
                  para Writing, escribe directamente en limpio. No tienes
                  tiempo de pasar a limpio 2 textos en 80 minutos.
                </li>
                <li>
                  <strong>Practicar sin timing real</strong>: es la
                  diferencia entre saber inglés y aprobar el B2 First. Hazlo
                  siempre con reloj.
                </li>
              </ul>
            </div>

            {/* Sección 7: últimos 7 días */}
            <h2
              id="ultimos-dias"
              className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6"
            >
              7. Los últimos 7 días antes del examen
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                <strong>Lo que SÍ hay que hacer</strong>:
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  1-2 simulacros completos bajo condiciones reales de examen
                  (mismos tiempos, sin diccionario, sin pausas).
                </li>
                <li>
                  Repasar tu carpeta de errores frecuentes — no aprender cosas
                  nuevas, consolidar lo que ya sabes.
                </li>
                <li>
                  Escuchar podcasts o series en inglés para mantener el oído
                  &ldquo;caliente&rdquo;.
                </li>
                <li>
                  Repasar phrasal verbs y collocations típicos del Use of
                  English.
                </li>
                <li>
                  Preparar la logística: ubicación del centro, DNI, hora exacta
                  de llegada.
                </li>
                <li>
                  El día anterior: dormir 8 horas. Sin resacas, sin salir hasta
                  tarde.
                </li>
              </ul>
              <p>
                <strong>Lo que NO hay que hacer</strong>:
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  Aprender gramática nueva. Si no lo sabes ya, en 7 días no lo
                  vas a interiorizar. Consolida.
                </li>
                <li>
                  Hacer maratones de 10 horas de estudio. Producen ansiedad y
                  cansancio, no aprendizaje.
                </li>
                <li>
                  Compararte con foros de otras personas que hicieron el
                  examen. Cada uno tiene su ritmo.
                </li>
                <li>
                  Buscar &ldquo;preguntas del examen del año pasado&rdquo;: no
                  se repiten, es tiempo perdido.
                </li>
              </ul>
            </div>

            {/* FAQ */}
            <h2
              id="faq"
              className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6"
            >
              8. Preguntas frecuentes
            </h2>
            <div className="divide-y divide-rule border-y border-rule">
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

            {/* Conclusión + CTA final */}
            <h2 className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              Conclusión: aprobar es cuestión de método
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                El B2 First no premia a los que saben más inglés en abstracto,
                sino a los que dominan{" "}
                <strong>el formato específico del examen</strong>. Aprobar es
                cuestión de método: conocer las 7 partes del Reading + Use of
                English, dominar las 4 rúbricas del Writing, practicar el
                Speaking con conversación real, y hacer al menos 3-5 simulacros
                completos bajo condiciones idénticas al día D.
              </p>
              <p>
                Los alumnos que fallan a la primera son casi siempre los que
                subestiman esta segunda parte. Saben inglés, pero llegan al
                examen sin haberlo practicado en su formato real. No caigas en
                ese error.
              </p>
            </div>

            {/* CTA final destacado */}
            <div className="mt-12 rounded-lg bg-navy text-white p-8 md:p-10">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                  <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
                    Empezar hoy
                  </p>
                </div>
                <h3 className="font-semibold text-2xl md:text-3xl leading-tight">
                  Practica el B2 First con simulacros reales y corrección IA
                  del Writing.
                </h3>
                <p className="mt-4 text-white/80 leading-relaxed">
                  7 días gratis. 3 mocks completos incluidos. Formato
                  computer-based idéntico al examen oficial. Corrección IA del
                  Writing con rúbrica Cambridge en 30 segundos.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/empezar">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white text-ink"
                    >
                      Empezar gratis 7 días
                    </Button>
                  </Link>
                  <Link href="/preparacion-b2-first-online">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-white border border-white/30"
                    >
                      Ver simulacros B2 First
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Volver al blog */}
            <div className="mt-16 pt-8 border-t border-rule">
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-6">
                Sigue leyendo
              </p>
              <Link
                href="/blog/que-es-el-b2-first-guia-completa"
                className="group flex items-start gap-4 rounded-lg border border-rule p-6 hover:border-navy transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-2">
                    Info Niveles
                  </p>
                  <h3 className="font-semibold text-lg text-ink group-hover:text-navy transition-colors">
                    Qué es el B2 First: estructura, usos y cómo prepararlo
                  </h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">
                    Guía informativa sobre el B2 First (antes FCE):
                    definición, estructura, puntuación, usos y precio.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted group-hover:text-navy transition-colors flex-shrink-0 mt-1" />
              </Link>

              <div className="mt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-navy hover:gap-2.5 transition-all"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Volver al blog
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>

      <MarketingFooter />
    </>
  );
}
