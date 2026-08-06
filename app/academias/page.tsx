import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Sparkles,
  BarChart3,
  Users,
  ClipboardCheck,
  Shield,
  Check,
  X,
} from "lucide-react";

// ═════════════════════════════════════════════════════
// SEO metadata — extraído del Excel de estrategia SEO
// ═════════════════════════════════════════════════════
export const metadata: Metadata = {
  title:
    "Simulacros Cambridge para academias con corrección IA | Acertlio",
  description:
    "La plataforma de simulacros Cambridge Computer-Based para academias de idiomas. Ahorra 10h/semana en corrección de Writings con IA. Panel del profesor, gestión multi-grupo, informes de progreso. Solicita una demo gratis.",
  alternates: { canonical: "/academias" },
  keywords: [
    "plataforma simulacros academia inglés",
    "software academia inglés cambridge",
    "material examen cambridge academias",
    "corrección writing profesor ia",
    "simulacros cambridge para profesores",
    "herramientas profesores cambridge",
  ],
  openGraph: {
    title:
      "La plataforma de simulacros Cambridge para tu academia — Acertlio",
    description:
      "Ahorra 10h/semana corrigiendo Writings con IA. Panel del profesor + gestión multi-grupo. Solicita demo gratuita.",
    url: "/academias",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulacros Cambridge para academias con corrección IA",
    description:
      "Ahorra tiempo corrigiendo Writings. Panel del profesor + multi-grupo. Solicita demo.",
  },
};

// ═════════════════════════════════════════════════════
// Contenido: beneficios (H2 — sección "solución")
// ═════════════════════════════════════════════════════
const benefits = [
  {
    icon: Clock,
    title: "Ahorra 10 horas a la semana por profesor",
    body: "El Reading, Use of English y Listening se corrigen solos. El Writing, con IA en 30 segundos usando la rúbrica oficial Cambridge. Tus profesores se dedican a enseñar, no a poner cruces.",
  },
  {
    icon: Sparkles,
    title: "Corrección de Writing con IA — rúbrica oficial",
    body: "Content, Communicative Achievement, Organisation y Language. Puntuación 0–20 según rúbrica Cambridge, con feedback específico en español y sugerencias de mejora.",
  },
  {
    icon: BarChart3,
    title: "Informes de progreso reales, no intuiciones",
    body: "Ranking de alumnos, evolución por nivel, errores más comunes, alumnos en riesgo de suspenso. Datos que ayudan al profesor y al director a tomar decisiones.",
  },
  {
    icon: Users,
    title: "Multi-profesor, multi-grupo, multi-nivel",
    body: "Cada profesor ve solo sus alumnos. Cada grupo tiene su plan. El director ve toda la academia. Sin líos de permisos ni de cuentas compartidas.",
  },
  {
    icon: ClipboardCheck,
    title: "Formato idéntico al examen real por ordenador",
    body: "Interfaz computer-based clavada al examen oficial. Cuando tus alumnos lleguen al día D, la pantalla no será una sorpresa. Bajan los nervios, sube la nota.",
  },
  {
    icon: Shield,
    title: "Datos en Europa, GDPR-compliant",
    body: "Servidores en Frankfurt (Supabase). Datos de menores protegidos según normativa española. Tus profesores nunca ven datos de otras academias.",
  },
];

// ═════════════════════════════════════════════════════
// Flujo — cómo funciona en 4 pasos
// ═════════════════════════════════════════════════════
const flow = [
  {
    n: "01",
    t: "Contratas un plan",
    b: "Starter (50 plazas), Pro (50), Business (100) o Enterprise (250+). Pago mensual o anual con 2 meses gratis.",
  },
  {
    n: "02",
    t: "Invitas a profesores y alumnos",
    b: "Por email desde el panel. Cada uno crea su contraseña y accede. Sin instalaciones, sin configuraciones.",
  },
  {
    n: "03",
    t: "Los profesores asignan mocks",
    b: "Por grupo o individualmente. Los alumnos hacen el simulacro cuando quieran. Se corrige solo (menos el Writing, que va a la IA).",
  },
  {
    n: "04",
    t: "Ves los resultados",
    b: "El profesor ve las notas al momento. El director ve la evolución de toda la academia. Sin Excel, sin hojas de cálculo.",
  },
];

// ═════════════════════════════════════════════════════
// Comparativa: método tradicional vs Acertlio
// ═════════════════════════════════════════════════════
const comparison = [
  {
    task: "Corregir un Writing (B2 First)",
    before: "15–20 minutos por escrito",
    after: "30 segundos con IA (rúbrica Cambridge)",
  },
  {
    task: "Preparar un mock completo",
    before: "2–3 horas buscando material fresco",
    after: "Ya está: 13+ mocks A2, B1, B2, C1, C2 listos",
  },
  {
    task: "Ver progreso de un alumno",
    before: "Repasar cuaderno o Excel manual",
    after: "1 clic en el panel del profesor",
  },
  {
    task: "Simular examen por ordenador",
    before: "Reservar aula de informática + gestionar",
    after: "Cada alumno lo hace desde su casa",
  },
  {
    task: "Feedback específico al alumno",
    before: "Depende del tiempo del profesor",
    after: "Automático + editable por el profesor",
  },
];

// ═════════════════════════════════════════════════════
// FAQ — preguntas frecuentes de directores de academia
// ═════════════════════════════════════════════════════
const faqs = [
  {
    q: "¿Cómo se integra Acertlio con nuestra academia actual?",
    a: "No sustituimos tu software de gestión (LangLion, OfiELE, Kydemy…). Somos complementarios: nosotros ponemos el contenido y la corrección; ellos gestionan matrículas, pagos y horarios. La integración se hace por invitación email — cada alumno solo necesita crear una contraseña la primera vez.",
  },
  {
    q: "¿Los profesores necesitan formación?",
    a: "No. La onboarding son 30 minutos de demo en directo con nosotros. El panel es autoexplicativo. Los profesores pueden asignar el primer mock en menos de 5 minutos desde que entran por primera vez.",
  },
  {
    q: "¿La IA reemplaza al profesor corrigiendo Writings?",
    a: "No, lo asiste. La IA da una primera corrección con puntuación por criterio y sugerencias. El profesor puede validarla tal cual, editarla o rehacerla. El objetivo no es prescindir del profesor, sino que el tiempo del profesor se use en pedagogía, no en poner comas.",
  },
  {
    q: "¿Se ajusta a nuestro método pedagógico?",
    a: "El material sigue la rúbrica oficial Cambridge, que es el estándar universal. Los profesores pueden añadir sus propias notas, corregir la IA y adaptar el feedback al estilo de la academia. No imponemos método, damos herramientas.",
  },
  {
    q: "¿Qué pasa con la privacidad de datos de menores?",
    a: "Cumplimos GDPR y LOPD-GDD. Servidores en Frankfurt (Supabase, con cifrado en reposo y en tránsito). Los datos de cada academia están aislados de las demás. Los datos de menores requieren consentimiento del tutor legal en el alta, gestionado desde el panel del director.",
  },
  {
    q: "¿Y si un mes no lo usamos apenas?",
    a: "La suscripción es mensual y se puede pausar en cualquier momento. Si contratas 50 plazas y solo usas 20, no las pierdes: siguen disponibles. Cuando un alumno termina el curso, esa plaza se libera y vuelve al pool para otro alumno.",
  },
  {
    q: "¿Puedo probar antes de contratar?",
    a: "Sí. Solicitas una demo (30 minutos por videollamada) y te damos acceso a la plataforma durante 7 días con 3 mocks de prueba para que la enseñes a tu equipo. Sin tarjeta, sin compromiso.",
  },
  {
    q: "¿Qué niveles Cambridge cubrís?",
    a: "A2 Key, B1 Preliminary, B2 First, C1 Advanced y C2 Proficiency. Con al menos 3 mocks completos por nivel — muy pronto ampliamos con Listening.",
  },
];

// ═════════════════════════════════════════════════════
// Schema.org: Product + FAQPage + Organization
// ═════════════════════════════════════════════════════
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "Acertlio para academias",
      description:
        "Plataforma de simulacros Cambridge Computer-Based con corrección de Writing por IA para academias de idiomas.",
      brand: { "@type": "Brand", name: "Acertlio" },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: "49.95",
        highPrice: "250.00",
        offerCount: "4",
      },
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
      "@type": "Organization",
      name: "Acertlio",
      url: "https://acertlio.com",
      logo: "https://acertlio.com/logo.png",
    },
  ],
};

export default function AcademiasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingHeader />

      <main>
        {/* ═══════════════════════════════════
            HERO — H1 con keyword principal
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 pt-20 pb-20">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Para academias de idiomas
              </p>
              <h1 className="font-semibold text-4xl md:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.05]">
                La plataforma de simulacros Cambridge para tu academia.
              </h1>
              <p className="mt-6 text-lg text-muted leading-relaxed max-w-2xl">
                Simulacros oficiales de A2 a C2 en formato computer-based, con
                corrección de Writing por IA usando la rúbrica Cambridge. Tus
                profesores ahorran 10 horas a la semana. Tus alumnos aprueban
                con más nota.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contacto">
                  <Button size="lg">Solicitar demo gratuita</Button>
                </Link>
                <Link href="/precios">
                  <Button variant="secondary" size="lg">
                    Ver planes desde 49,95€/mes
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-ok" />
                  Sin permanencia
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-ok" />
                  Datos en Europa (GDPR)
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-ok" />
                  Onboarding en 30 minutos
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-ok" />
                  13+ mocks listos
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            PROBLEMA — dolor real de academias
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                El problema
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Tus profesores no dan más de sí corrigiendo Writings.
              </h2>
              <div className="mt-6 space-y-4 text-muted leading-relaxed">
                <p>
                  Un Writing de B2 First bien corregido tarda entre{" "}
                  <strong className="text-ink">15 y 20 minutos</strong>: leer,
                  puntuar Content/Communicative/Organisation/Language, escribir
                  feedback específico, revisar. Multiplícalo por 4 grupos, 2
                  writings por semana y 8 alumnos por grupo:{" "}
                  <strong className="text-ink">
                    16 horas semanales por profesor.
                  </strong>
                </p>
                <p>
                  Y encima, cuando llega el examen oficial, resulta que tus
                  alumnos se estrellan con el formato por ordenador porque en la
                  academia han practicado con papel.
                </p>
                <p>
                  La solución no es contratar más profesores. Es{" "}
                  <strong className="text-ink">
                    darles herramientas para que su tiempo cuente.
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            SOLUCIÓN — 6 beneficios (H2)
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                La solución
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Simulacros listos, corrección IA y datos que sirven.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-px bg-rule rounded overflow-hidden border border-rule">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="bg-white p-7 md:p-8">
                    <Icon
                      className="h-6 w-6 text-navy mb-4"
                      strokeWidth={1.5}
                    />
                    <h3 className="font-semibold text-ink text-lg leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-sm text-muted mt-3 leading-relaxed">
                      {b.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            COMPARATIVA — antes vs Acertlio
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Antes y después
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                El día a día del profesor cambia radicalmente.
              </h2>
            </div>

            <div className="overflow-hidden rounded border border-rule bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule">
                    <th className="text-left p-4 font-medium text-ink">
                      Tarea
                    </th>
                    <th className="text-left p-4 font-medium text-muted">
                      Sin Acertlio
                    </th>
                    <th className="text-left p-4 font-medium text-navy">
                      Con Acertlio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((c, i) => (
                    <tr
                      key={i}
                      className={
                        i < comparison.length - 1
                          ? "border-b border-rule"
                          : ""
                      }
                    >
                      <td className="p-4 font-medium text-ink">{c.task}</td>
                      <td className="p-4 text-muted">
                        <span className="flex items-start gap-2">
                          <X className="h-4 w-4 text-bad flex-shrink-0 mt-0.5" />
                          {c.before}
                        </span>
                      </td>
                      <td className="p-4 text-ink">
                        <span className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-ok flex-shrink-0 mt-0.5" />
                          {c.after}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            FLUJO — 4 pasos
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Cómo funciona
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Cuatro pasos. Sin formación previa.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Desde que firmas hasta que tus profesores están usando la
                plataforma pasan menos de 24 horas.
              </p>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-px bg-rule rounded overflow-hidden border border-rule">
              {flow.map((s) => (
                <div key={s.n} className="bg-white p-6 md:p-7">
                  <p className="font-mono text-xs text-saffron mb-3">{s.n}</p>
                  <h3 className="font-semibold text-ink">{s.t}</h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">
                    {s.b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            PRECIOS — tabla resumen
            ═══════════════════════════════════ */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Planes y precios
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Un precio por plaza. Sin sorpresas.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Pagas por alumno activo. Cuando un alumno termina el curso, esa
                plaza se libera y vuelve al pool.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-px bg-rule rounded overflow-hidden border border-rule">
              {[
                {
                  name: "Starter",
                  plazas: "50 plazas",
                  price: "49,95€",
                  best: "Academia pequeña",
                },
                {
                  name: "Pro",
                  plazas: "50 plazas",
                  price: "89,95€",
                  best: "Academia con IA writing",
                  highlight: true,
                },
                {
                  name: "Business",
                  plazas: "100 plazas",
                  price: "149,95€",
                  best: "Academia mediana",
                },
                {
                  name: "Enterprise",
                  plazas: "250+ plazas",
                  price: "Desde 250€",
                  best: "Franquicia / red",
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`bg-white p-7 ${
                    p.highlight ? "border-2 border-navy" : ""
                  }`}
                >
                  {p.highlight && (
                    <p className="text-xs uppercase tracking-wider text-saffron font-semibold mb-2">
                      Más elegido
                    </p>
                  )}
                  <h3 className="font-semibold text-ink text-lg">{p.name}</h3>
                  <p className="text-sm text-muted mt-1">{p.plazas}</p>
                  <p className="text-3xl font-bold text-ink mt-4 tabular-nums">
                    {p.price}
                    <span className="text-sm font-normal text-muted">/mes</span>
                  </p>
                  <p className="text-sm text-muted mt-4">{p.best}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted mt-6 text-center">
              Pago anual con 2 meses gratis. Cambia de plan cuando quieras.{" "}
              <Link
                href="/precios"
                className="text-navy underline hover:no-underline"
              >
                Ver todos los detalles
              </Link>
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════
            FAQ — schema.org integrado
            ═══════════════════════════════════ */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 font-medium">
                Preguntas frecuentes
              </p>
              <h2 className="font-semibold text-3xl md:text-4xl text-ink tracking-tight leading-tight">
                Lo que preguntan otros directores de academia.
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
            CTA final — demo
            ═══════════════════════════════════ */}
        <section className="bg-navy text-white">
          <div className="max-w-site mx-auto px-6 py-20 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h2 className="font-semibold text-3xl md:text-4xl tracking-tight leading-tight">
                Te enseñamos Acertlio en 30 minutos.
              </h2>
              <p className="mt-4 text-white/80 leading-relaxed max-w-2xl">
                Videollamada. Sin PowerPoint. Te mostramos el panel del
                profesor, la corrección IA y cómo asignar mocks. Después
                decides si te sirve.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/contacto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-ink"
                >
                  Solicitar demo gratuita
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
