import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Clock,
  BookOpenCheck,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Prepara Cambridge por tu cuenta — Acertlio",
  description:
    "Acertlio Individual: simulacros Cambridge Computer-Based reales para alumnos. Interfaz idéntica al examen oficial, autocorrección instantánea y 7 días de prueba gratis.",
  alternates: { canonical: "/alumnos" },
  openGraph: {
    title: "Prepara Cambridge por tu cuenta — Acertlio",
    description:
      "Simulacros Cambridge Computer-Based con interfaz oficial y autocorrección instantánea. 7 días gratis.",
    url: "/alumnos",
  },
};


const benefits = [
  {
    icon: Monitor,
    title: "Practica con la interfaz oficial",
    body: "La misma pantalla, los mismos botones, el mismo formato de preguntas que verás el día del examen. Sin sorpresas.",
  },
  {
    icon: Clock,
    title: "Autocorrección instantánea del Reading",
    body: "Terminas el simulacro y ves tu nota al momento, con revisión pregunta a pregunta y la respuesta correcta al lado.",
  },
  {
    icon: BookOpenCheck,
    title: "Escribe Writing y guardamos tu respuesta",
    body: "Practica también las tareas de Writing con textarea y contador de palabras. Guardamos tu texto para futura corrección con IA.",
  },
];

const flow = [
  {
    n: "01",
    t: "Elige tu nivel",
    b: "A2, B1, B2, C1 o C2. Solo verás simulacros de tu nivel para no dispersarte.",
  },
  {
    n: "02",
    t: "Empieza tu prueba gratis",
    b: "7 días con hasta 3 simulacros. Sin cobro hasta el día 8.",
  },
  {
    n: "03",
    t: "Simula el examen",
    b: "Timer real, autoguardado, pausa cuando quieras. Como si fuera el examen oficial.",
  },
  {
    n: "04",
    t: "Aprende de tus errores",
    b: "Ve las respuestas correctas, tu progreso por Part y evolución en el tiempo.",
  },
];


export default function AlumnosPage() {
  return (
    <>
      <MarketingHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 pt-16 pb-16">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3">
                Para alumnos que preparan Cambridge
              </p>
              <h1 className="font-semibold text-5xl text-ink tracking-tight leading-[1.05]">
                Practica el examen real. En serio.
              </h1>
              <p className="mt-5 text-lg text-muted leading-relaxed">
                La misma interfaz Computer-Based que Cambridge, con simulacros
                oficiales del nivel que estés preparando. Ideal si vas por libre
                o quieres reforzar lo que haces en tu academia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/individual/empezar">
                  <Button size="lg">Empezar prueba gratis</Button>
                </Link>
                <Link href="/precios?tab=individual">
                  <Button variant="secondary" size="lg">
                    Ver planes y precios
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted">
                7 días gratis · Hasta 3 simulacros · Sin cobro hasta el día 8
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-px bg-rule rounded overflow-hidden border border-rule">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="bg-white p-7">
                    <Icon
                      className="h-5 w-5 text-navy mb-4"
                      strokeWidth={1.5}
                    />
                    <h3 className="font-medium text-ink">{b.title}</h3>
                    <p className="text-sm text-muted mt-2 leading-relaxed">
                      {b.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Flow */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-wider text-muted mb-3">
                Así funciona
              </p>
              <h2 className="font-semibold text-4xl text-ink tracking-tight leading-tight">
                En 2 minutos estás practicando.
              </h2>
              <p className="mt-4 text-sm text-muted leading-relaxed">
                Sin apps que instalar. Sin curva de aprendizaje. Todo desde el
                navegador de tu ordenador.
              </p>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-px bg-rule rounded overflow-hidden border border-rule">
              {flow.map((s) => (
                <div key={s.n} className="bg-white p-6">
                  <p className="font-mono text-xs text-saffron mb-3">{s.n}</p>
                  <h3 className="font-medium text-ink">{s.t}</h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">
                    {s.b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Confianza / preview */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-muted mb-3">
                Qué incluye
              </p>
              <h2 className="font-semibold text-3xl text-ink tracking-tight leading-tight mb-6">
                Todo lo que necesitas para preparar el Computer-Based.
              </h2>
              <ul className="space-y-3 text-sm text-ink">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-ok mt-0.5 flex-shrink-0" />
                  <span>
                    Simulacros ilimitados durante toda tu suscripción activa.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-ok mt-0.5 flex-shrink-0" />
                  <span>
                    Reading, Use of English y Writing (Speaking y Listening no
                    incluidos por ahora).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-ok mt-0.5 flex-shrink-0" />
                  <span>
                    Timer real, autoguardado, pausa y continúa cuando quieras.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-ok mt-0.5 flex-shrink-0" />
                  <span>
                    Sin permanencia. Cancela cuando quieras desde tu panel.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-navy text-white">
          <div className="max-w-site mx-auto px-6 py-16 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h2 className="font-semibold text-3xl lg:text-4xl tracking-tight leading-tight">
                Empieza tu prueba gratis y ve por dentro cómo es.
              </h2>
              <p className="text-white/80 text-sm mt-3">
                7 días · Hasta 3 simulacros · Sin cobro hasta el día 8
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/individual/empezar">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-ink hover:bg-white/90"
                >
                  Empezar ahora
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
