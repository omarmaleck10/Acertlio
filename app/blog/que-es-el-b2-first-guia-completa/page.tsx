import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ArrowRight,
  Home as HomeIcon,
  ChevronRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

// ═════════════════════════════════════════════════════
// SEO — post pilar cluster "Info Niveles"
// ═════════════════════════════════════════════════════
export const metadata: Metadata = {
  title:
    "Qué es el B2 First: estructura, usos y cómo prepararlo (guía 2026) | Acertlio",
  description:
    "El B2 First (antes FCE) es el examen Cambridge más solicitado en España. Explicamos qué es, qué acredita, cómo se estructura, cuánto cuesta y para qué sirve.",
  alternates: { canonical: "/blog/que-es-el-b2-first-guia-completa" },
  keywords: [
    "que es el b2 first",
    "b2 first cambridge",
    "que es el fce",
    "b2 first para que sirve",
    "estructura b2 first",
    "cambridge english scale",
    "b2 first precio",
    "diferencia b2 first c1 advanced",
  ],
  openGraph: {
    title:
      "Qué es el B2 First: estructura, usos y cómo prepararlo (guía 2026)",
    description:
      "Guía informativa sobre el B2 First (FCE): estructura, puntuación, usos y precio.",
    url: "/blog/que-es-el-b2-first-guia-completa",
    type: "article",
    publishedTime: "2026-08-06T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qué es el B2 First: guía completa 2026",
    description:
      "Estructura, puntuación, para qué sirve y cómo prepararlo.",
  },
};

// ═════════════════════════════════════════════════════
// TOC
// ═════════════════════════════════════════════════════
const TOC = [
  { id: "definicion", label: "Qué es y qué acredita" },
  { id: "estructura", label: "Estructura del examen" },
  { id: "puntuacion", label: "Cómo se puntúa" },
  { id: "usos", label: "Para qué sirve" },
  { id: "vs-otros", label: "B2 First vs otros exámenes" },
  { id: "precio", label: "Precio y dónde presentarse" },
  { id: "preparacion", label: "Cómo prepararlo" },
  { id: "faq", label: "Preguntas frecuentes" },
];

// FAQ Schema.org
const faqs = [
  {
    q: "¿Qué diferencia hay entre B2 First y FCE?",
    a: "Ninguna. El FCE (First Certificate in English) es el nombre antiguo del mismo examen. Desde 2016, Cambridge lo rebautizó como 'B2 First' para alinearlo con el Marco Común Europeo (MCER). Si alguien te habla del FCE, se refiere exactamente al mismo examen con el mismo contenido.",
  },
  {
    q: "¿El certificado B2 First caduca?",
    a: "No, el certificado es válido para siempre. Sin embargo, muchas instituciones (universidades, empresas) prefieren certificados con menos de 2 años. Si vas a usarlo mucho más tarde, algunas oposiciones pueden pedirte una revalidación. Cambridge oficialmente lo define como 'lifetime validity'.",
  },
  {
    q: "¿Es lo mismo el B2 First que el B2 First for Schools?",
    a: "El nivel y la puntuación son idénticos y el certificado que recibes tiene el mismo valor legal. Cambia el tono de los materiales: el 'for Schools' usa temas cercanos a adolescentes (estudios, redes sociales, música juvenil) y el B2 First estándar usa temas más adultos (trabajo, viajes, medio ambiente). Si tienes menos de 18 años, elige la versión for Schools.",
  },
  {
    q: "¿Puedo hacer el B2 First por internet desde casa?",
    a: "No exactamente. El examen se debe hacer en un centro autorizado por Cambridge, con supervisión presencial. Sí puedes elegir el formato ordenador (computer-based) en el centro, pero necesitas ir físicamente a un centro examinador oficial.",
  },
  {
    q: "¿Con qué edad se puede hacer el B2 First?",
    a: "No hay edad mínima oficial. En la práctica, un alumno con nivel B2 real (que no muy común antes de los 14 años en un contexto no bilingüe) puede presentarse. Cambridge recomienda la versión 'for Schools' hasta los 18 años.",
  },
  {
    q: "¿Qué me interesa más, B2 First o IELTS?",
    a: "Depende de para qué lo necesites. B2 First es preferido en España para universidades españolas, oposiciones y empresas nacionales — es un certificado por niveles con validez permanente. IELTS es preferido para universidades extranjeras (UK, Australia, Canadá) o inmigración — es una escala numérica con validez de 2 años. Si es para España, casi siempre B2 First.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline:
        "Qué es el B2 First: estructura, usos y cómo prepararlo (guía 2026)",
      description:
        "El B2 First (antes FCE) es el examen Cambridge más solicitado en España. Explicamos qué es, cómo se estructura y para qué sirve.",
      author: { "@type": "Organization", name: "Acertlio" },
      publisher: {
        "@type": "Organization",
        name: "Acertlio",
        logo: {
          "@type": "ImageObject",
          url: "https://acertlio.com/logo.png",
        },
      },
      datePublished: "2026-08-06",
      dateModified: "2026-08-06",
      wordCount: 2000,
      articleSection: "Info Niveles",
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
        { "@type": "ListItem", position: 1, name: "Acertlio", item: "https://acertlio.com" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://acertlio.com/blog" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Qué es el B2 First",
          item: "https://acertlio.com/blog/que-es-el-b2-first-guia-completa",
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
              <Link href="/" className="flex items-center gap-1.5 hover:text-ink">
                <HomeIcon className="h-3 w-3" />
                Acertlio
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/blog" className="hover:text-ink">Blog</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-ink">Qué es el B2 First</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 pt-12 pb-8">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Info Niveles · B2 First
              </p>
              <h1 className="font-semibold text-4xl md:text-5xl text-ink tracking-tight leading-[1.05]">
                Qué es el B2 First: estructura, usos y cómo prepararlo.
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted">
                <span>6 de agosto de 2026</span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  11 min de lectura
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
                Si te estás planteando sacar un certificado de inglés para la
                universidad, para una oposición o para tu trabajo, es muy
                probable que hayas oído hablar del{" "}
                <strong className="text-ink">B2 First</strong>. Es el examen
                oficial de Cambridge más solicitado en España, con miles de
                candidatos cada año en más de 300 centros examinadores.
              </p>
              <p>
                En esta guía te explicamos <strong>qué es exactamente el B2
                First</strong>, cómo se estructura, cómo se puntúa, para qué
                sirve y en qué se diferencia de otros exámenes como el IELTS.
                Al final tendrás una idea clara de si es lo que necesitas.
              </p>
            </div>

            {/* Sección 1 */}
            <h2 id="definicion" className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              1. Qué es el B2 First y qué acredita
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                El B2 First es un{" "}
                <strong>examen oficial de la Universidad de Cambridge</strong>{" "}
                (a través de su departamento Cambridge English) que acredita
                un nivel de inglés B2 según el{" "}
                <strong>Marco Común Europeo de Referencia (MCER)</strong>. Ese
                nivel se conoce coloquialmente como &ldquo;intermedio
                alto&rdquo;: puedes entender textos complejos sobre temas
                conocidos, expresarte con fluidez razonable y producir textos
                claros sobre una amplia variedad de temas.
              </p>
              <p>
                Antes del año 2016, este mismo examen se llamaba{" "}
                <strong>FCE (First Certificate in English)</strong>. Cambridge
                lo renombró como &ldquo;B2 First&rdquo; para alinear el nombre
                con el nivel MCER que certifica. Si oyes hablar de &ldquo;FCE
                Cambridge&rdquo;, es exactamente el mismo examen — solo que con
                el nombre antiguo.
              </p>
              <p>
                Existen dos versiones del examen con el mismo valor legal:
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>B2 First</strong> (para adultos): temas más
                  &ldquo;maduros&rdquo; — trabajo, viajes, tecnología, medio
                  ambiente.
                </li>
                <li>
                  <strong>B2 First for Schools</strong> (para menores de 18):
                  mismo formato y dificultad, pero con temas cercanos a
                  adolescentes.
                </li>
              </ul>
              <p>
                Ambas versiones dan el mismo certificado con el mismo peso
                legal ante universidades, empresas y administraciones.
              </p>
            </div>

            {/* Sección 2 */}
            <h2 id="estructura" className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              2. Estructura del examen: las 4 partes
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                El B2 First consta de <strong>4 partes</strong> que se hacen el
                mismo día (excepto el Speaking, que puede ser otro día). El
                examen se puede hacer en <strong>papel o por ordenador</strong>{" "}
                — el contenido es idéntico en ambos formatos.
              </p>

              <div className="my-8 overflow-x-auto">
                <table className="w-full text-sm border border-rule rounded overflow-hidden">
                  <thead>
                    <tr className="bg-paper border-b border-rule">
                      <th className="text-left p-3 font-semibold text-ink">Parte</th>
                      <th className="text-left p-3 font-semibold text-ink">Duración</th>
                      <th className="text-left p-3 font-semibold text-ink">Peso</th>
                      <th className="text-left p-3 font-semibold text-ink">Contenido</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">Reading &amp; Use of English</td>
                      <td className="p-3">75 min</td>
                      <td className="p-3 tabular-nums">40%</td>
                      <td className="p-3">7 partes: 3 de reading, 4 de gramática/vocabulario</td>
                    </tr>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">Writing</td>
                      <td className="p-3">80 min</td>
                      <td className="p-3 tabular-nums">20%</td>
                      <td className="p-3">2 textos de 140–190 palabras</td>
                    </tr>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">Listening</td>
                      <td className="p-3">40 min</td>
                      <td className="p-3 tabular-nums">20%</td>
                      <td className="p-3">4 partes con audios (se escuchan 2 veces)</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-3 font-medium">Speaking</td>
                      <td className="p-3">14 min</td>
                      <td className="p-3 tabular-nums">20%</td>
                      <td className="p-3">Entrevista en pareja con otro candidato</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                <strong>Detalle importante</strong>: el Reading &amp; Use of
                English pesa el <strong>40%</strong> del total. Es la parte más
                técnica y la que más margen deja para mejorar con preparación
                dirigida. El Writing y el Listening pesan un 20% cada uno, y
                el Speaking otro 20% — aunque solo dura 14 minutos, tiene el
                mismo peso que 40 minutos de Listening.
              </p>
              <p>
                Si te interesa el detalle exacto de qué se hace en cada parte,
                lo cubrimos con profundidad en{" "}
                <Link
                  href="/blog/como-aprobar-b2-first-a-la-primera"
                  className="text-navy underline hover:no-underline font-medium"
                >
                  la guía completa de estrategias por parte
                </Link>
                .
              </p>
            </div>

            {/* Sección 3 */}
            <h2 id="puntuacion" className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              3. Cómo se puntúa: la Cambridge English Scale
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                Cambridge usa una escala propia llamada{" "}
                <strong>Cambridge English Scale</strong>, común a todos sus
                exámenes (A2 Key, B1 Preliminary, B2 First, C1 Advanced, C2
                Proficiency). En el B2 First, esta escala va de{" "}
                <strong>140 a 190 puntos</strong>. La puntuación final es la
                media aritmética de las 4 partes.
              </p>

              <div className="my-6 grid sm:grid-cols-3 gap-3">
                <div className="rounded border-2 border-ok bg-ok/5 p-4">
                  <p className="font-mono text-3xl font-bold text-ok tabular-nums">180-190</p>
                  <p className="text-sm font-semibold text-ink mt-2">Grade A</p>
                  <p className="text-xs text-muted mt-1">Certificado de nivel C1</p>
                </div>
                <div className="rounded border-2 border-navy bg-navy/5 p-4">
                  <p className="font-mono text-3xl font-bold text-navy tabular-nums">173-179</p>
                  <p className="text-sm font-semibold text-ink mt-2">Grade B</p>
                  <p className="text-xs text-muted mt-1">B2 con nota alta</p>
                </div>
                <div className="rounded border-2 border-saffron bg-saffron/5 p-4">
                  <p className="font-mono text-3xl font-bold text-saffron tabular-nums">160-172</p>
                  <p className="text-sm font-semibold text-ink mt-2">Grade C</p>
                  <p className="text-xs text-muted mt-1">B2 aprobado (mínimo)</p>
                </div>
              </div>

              <p>
                Un dato curioso: si sacas Grade A (180-190 puntos), Cambridge
                te da el certificado con nivel <strong>C1</strong>, no B2. Es
                decir, con el mismo examen puedes acabar acreditando un nivel
                superior si lo bordas.
              </p>
              <p>
                Y al revés: si suspendes con una puntuación entre 140 y 159,
                Cambridge te da un certificado de <strong>nivel B1</strong>{" "}
                automáticamente. No te vas sin nada — obviamente no es lo que
                buscabas, pero al menos tienes algo que acredite tu nivel real.
              </p>
              <p>
                Por debajo de 140, ya no hay certificado. En ese caso conviene
                haberte presentado directamente al B1 Preliminary.
              </p>
            </div>

            {/* CTA in-content */}
            <div className="mt-12 rounded-lg border-2 border-navy bg-navy/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-navy" />
                  <p className="text-xs uppercase tracking-wider text-navy font-semibold">
                    Averigua tu nivel
                  </p>
                </div>
                <p className="text-ink font-medium leading-snug">
                  Haz un simulacro B2 First gratis y descubre en qué nota estás
                </p>
                <p className="text-sm text-muted mt-2">
                  7 días de trial. Sin tarjeta. Formato computer-based
                  idéntico al examen oficial.
                </p>
              </div>
              <Link href="/preparacion-b2-first-online" className="flex-shrink-0">
                <Button size="lg">Empezar simulacro</Button>
              </Link>
            </div>

            {/* Sección 4 */}
            <h2 id="usos" className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              4. Para qué sirve el B2 First
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                El B2 First es el certificado de inglés más aceptado en España
                por debajo del nivel C1. Estos son los usos principales:
              </p>

              <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
                Universidad
              </h3>
              <p>
                La mayoría de universidades españolas exigen un nivel B2
                acreditado para acceder a algunos grados y sobre todo para
                graduarse. El B2 First cumple ese requisito. También cubre el
                requisito de idioma para el TFG en la mayoría de universidades
                públicas. Y en máster, oposiciones docentes, doctorado o
                similares, el B2 First tiene reconocimiento casi universal.
              </p>

              <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
                Becas
              </h3>
              <p>
                Prácticamente todas las becas Erasmus+ nacionales, así como
                las becas del Ministerio, del ICEX, del SEPE y de fundaciones
                privadas (La Caixa, Bancaja, Rafael del Pino) aceptan el B2
                First. Para becas más selectivas (Fulbright, Chevening, Rhodes)
                suele ser necesario el C1 Advanced.
              </p>

              <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
                Oposiciones
              </h3>
              <p>
                En oposiciones docentes (Secundaria, FP), un B2 First puntúa
                normalmente 1 punto en el baremo. En oposiciones a policía
                nacional, policía local, ejército y otras administraciones,
                también suele puntuar. Consulta la convocatoria específica de
                tu oposición porque el peso varía.
              </p>

              <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
                Trabajo
              </h3>
              <p>
                Es el certificado más reconocido por empresas españolas a
                nivel B2. Añadirlo en el CV es una señal clara de que puedes
                mantener conversaciones profesionales en inglés, leer emails y
                documentación técnica, y participar en reuniones. En procesos
                de selección de multinacionales y consultoras, el B2 First es
                el mínimo esperado.
              </p>

              <h3 className="font-semibold text-xl text-ink mt-8 mb-3">
                Enseñanza (concertados y privados)
              </h3>
              <p>
                Para dar clases en colegios concertados o privados bilingües,
                muchos centros exigen al menos un B2 First al profesorado no
                especialista en inglés (matemáticas, ciencias, sociales, etc.).
                Para ser profesor de inglés propiamente dicho, se pide C1
                Advanced o superior.
              </p>
            </div>

            {/* Sección 5 */}
            <h2 id="vs-otros" className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              5. B2 First vs otros exámenes internacionales
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                Es la duda más frecuente: ¿me interesa más el B2 First, el
                IELTS o el TOEFL? Depende de para qué.
              </p>

              <div className="my-6 overflow-x-auto">
                <table className="w-full text-sm border border-rule rounded overflow-hidden">
                  <thead>
                    <tr className="bg-paper border-b border-rule">
                      <th className="text-left p-3 font-semibold text-ink">Examen</th>
                      <th className="text-left p-3 font-semibold text-ink">Formato</th>
                      <th className="text-left p-3 font-semibold text-ink">Validez</th>
                      <th className="text-left p-3 font-semibold text-ink">Mejor para</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">B2 First</td>
                      <td className="p-3">Por niveles (A-C)</td>
                      <td className="p-3">Permanente</td>
                      <td className="p-3">España, universidad nacional</td>
                    </tr>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">IELTS Academic</td>
                      <td className="p-3">Escala 1-9</td>
                      <td className="p-3">2 años</td>
                      <td className="p-3">UK, Australia, Canadá</td>
                    </tr>
                    <tr className="border-b border-rule bg-white">
                      <td className="p-3 font-medium">TOEFL iBT</td>
                      <td className="p-3">Escala 0-120</td>
                      <td className="p-3">2 años</td>
                      <td className="p-3">EEUU, universidades USA</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-3 font-medium">CAE (C1 Advanced)</td>
                      <td className="p-3">Por niveles (A-C)</td>
                      <td className="p-3">Permanente</td>
                      <td className="p-3">Nivel superior al B2</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                <strong>Regla simple</strong>: si es para España, casi siempre
                B2 First. Si es para estudiar fuera, IELTS o TOEFL según país.
                Si ya tienes un B2 sólido y buscas subir a C1, entonces el
                C1 Advanced es el siguiente paso natural.
              </p>
            </div>

            {/* Sección 6 */}
            <h2 id="precio" className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              6. Cuánto cuesta y dónde presentarse
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                El precio del B2 First en España oscila entre{" "}
                <strong>210€ y 230€</strong> según el centro examinador. Es
                similar en papel y en ordenador. Algunos centros pueden hacer
                descuentos en convocatorias específicas o para grupos.
              </p>
              <p>
                Puedes presentarte en cualquier{" "}
                <strong>centro autorizado por Cambridge English</strong>. En
                España hay más de 300 centros: academias, escuelas oficiales de
                idiomas, institutos y universidades. Puedes consultar el listado
                actualizado en cambridgeenglish.org filtrando por tu ciudad.
              </p>
              <p>
                Fechas: las convocatorias en papel son fijas y hay unas 4-6 al
                año. Las de ordenador (computer-based) son mucho más flexibles
                — algunos centros tienen convocatorias cada semana o incluso
                varias veces por semana.
              </p>
              <p>
                Los resultados llegan en:
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>Formato ordenador</strong>: entre 2 y 3 semanas
                  después del examen.
                </li>
                <li>
                  <strong>Formato papel</strong>: entre 4 y 6 semanas después.
                </li>
              </ul>
              <p>
                El certificado físico llega en 2-3 semanas más, aunque el
                certificado digital (con validez oficial) suele estar
                disponible en el mismo email de resultados.
              </p>
            </div>

            {/* Sección 7 */}
            <h2 id="preparacion" className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              7. Cómo prepararlo
            </h2>
            <div className="prose-content space-y-5 text-ink leading-relaxed">
              <p>
                El tiempo de preparación depende mucho de tu nivel actual:
              </p>
              <ul className="ml-6 space-y-2 list-disc marker:text-saffron">
                <li>
                  <strong>Nivel A2 sólido</strong>: 12-18 meses de estudio.
                </li>
                <li>
                  <strong>Nivel B1 sólido</strong>: 4-6 meses de preparación
                  específica.
                </li>
                <li>
                  <strong>Ya tienes nivel B2</strong>: 6-10 semanas de
                  preparación centrada en el formato del examen.
                </li>
              </ul>
              <p>
                Hay 3 formas principales de prepararlo, con ventajas y
                desventajas:
              </p>
              <ol className="ml-6 space-y-3 list-decimal marker:text-saffron">
                <li>
                  <strong>Academia presencial</strong>: buena si necesitas
                  disciplina y feedback humano constante. Cara (60-120€/mes),
                  poco flexible.
                </li>
                <li>
                  <strong>Profesor particular</strong>: máximo control y
                  feedback. Muy caro (40-60€/hora), depende de disponibilidad.
                </li>
                <li>
                  <strong>Plataforma online + autoaprendizaje</strong>: barata
                  (14-30€/mes), flexible. Necesita disciplina propia. Con IA
                  para corregir el Writing, el feedback es casi tan bueno como
                  el humano por una fracción del precio.
                </li>
              </ol>
              <p>
                Sea cual sea el método que elijas, hay una cosa no negociable:{" "}
                <strong>hacer simulacros completos bajo condiciones reales</strong>.
                Sin eso, no importa cuánto inglés sepas — llegarás al examen
                sin dominar el formato y perderás puntos por errores tontos.
              </p>
              <p>
                Si quieres profundizar en la estrategia de preparación, tenemos
                una{" "}
                <Link
                  href="/blog/como-aprobar-b2-first-a-la-primera"
                  className="text-navy underline hover:no-underline font-medium"
                >
                  guía específica sobre cómo aprobar el B2 First a la primera
                </Link>
                {" "}con plan de estudio detallado y estrategias por parte.
              </p>
            </div>

            {/* FAQ */}
            <h2 id="faq" className="font-semibold text-3xl text-ink tracking-tight leading-tight mt-16 mb-6">
              8. Preguntas frecuentes
            </h2>
            <div className="divide-y divide-rule border-y border-rule">
              {faqs.map((f, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="font-medium text-ink text-base pr-4">{f.q}</h3>
                    <span className="text-muted text-2xl group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted leading-relaxed pr-8">{f.a}</p>
                </details>
              ))}
            </div>

            {/* CTA final */}
            <div className="mt-16 rounded-lg bg-navy text-white p-8 md:p-10">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                  <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
                    Empezar hoy
                  </p>
                </div>
                <h3 className="font-semibold text-2xl md:text-3xl leading-tight">
                  Ya sabes qué es el B2 First. Ahora empieza a practicarlo.
                </h3>
                <p className="mt-4 text-white/80 leading-relaxed">
                  7 días de trial gratis. 3 mocks completos incluidos.
                  Corrección IA del Writing con rúbrica Cambridge en 30
                  segundos.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/empezar">
                    <Button variant="secondary" size="lg" className="bg-white text-ink">
                      Empezar gratis 7 días
                    </Button>
                  </Link>
                  <Link href="/preparacion-b2-first-online">
                    <Button variant="ghost" size="lg" className="text-white border border-white/30">
                      Ver simulacros B2 First
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Posts relacionados */}
            <div className="mt-16 pt-8 border-t border-rule">
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-6">
                Sigue leyendo
              </p>
              <Link
                href="/blog/como-aprobar-b2-first-a-la-primera"
                className="group flex items-start gap-4 rounded-lg border border-rule p-6 hover:border-navy transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-2">
                    Cómo Aprobar
                  </p>
                  <h3 className="font-semibold text-lg text-ink group-hover:text-navy transition-colors">
                    Cómo aprobar el B2 First a la primera: guía completa 2026
                  </h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">
                    Estructura del examen, plan de estudio realista,
                    estrategias por parte y los errores que hacen que se
                    suspenda a la primera.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted group-hover:text-navy transition-colors flex-shrink-0 mt-1" />
              </Link>
            </div>

            {/* Volver */}
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
        </article>
      </main>

      <MarketingFooter />
    </>
  );
}
