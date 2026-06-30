import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, FileBarChart2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Para academias de inglés",
  description:
    "Acertlio es el simulador online de Cambridge Computer-Based para academias de inglés. Ahorra horas de corrección, prepara a tus alumnos para el examen real y mide el rendimiento de toda tu academia con datos.",
  alternates: { canonical: "/academias" },
  openGraph: {
    title: "Para academias de inglés — Acertlio",
    description:
      "Plataforma de simulacros Cambridge Computer-Based para academias. Pide demo en directo.",
    url: "/academias",
  },
};

const benefits = [
  {
    icon: Users,
    title: "Tus profesores ahorran horas de corrección",
    body: "Las partes objetivas se corrigen solas. El profesor solo dedica tiempo al Writing, donde realmente aporta valor pedagógico.",
  },
  {
    icon: GraduationCap,
    title: "Tus alumnos pierden el miedo al examen real",
    body: "Después de 3 o 4 simulacros completos en Acertlio, la interfaz del examen oficial deja de ser un obstáculo añadido.",
  },
  {
    icon: FileBarChart2,
    title: "Tú ves el rendimiento de toda la academia",
    body: "Media de aprobados estimados, errores más comunes por nivel, alumnos en riesgo. Decides con datos, no con intuición.",
  },
];

const flow = [
  { n: "01", t: "Compras plazas", b: "Eliges 20, 50 o 100 según tamaño de academia." },
  { n: "02", t: "Asignas a alumnos", b: "Por email. El alumno crea su contraseña y entra." },
  { n: "03", t: "Profesores asignan simulacros", b: "Mocks por nivel, por grupo, o individuales." },
  { n: "04", t: "Liberas plazas al terminar", b: "Cuando un alumno acaba el curso, esa plaza vuelve al pool." },
];

export default function AcademiasPage() {
  return (
    <>
      <MarketingHeader />

      <main>
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 pt-16 pb-16">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3">Para academias de inglés</p>
              <h1 className="font-semibold text-5xl text-ink tracking-tight leading-[1.05]">
                La forma seria de preparar Cambridge Computer-Based.
              </h1>
              <p className="mt-5 text-lg text-muted leading-relaxed">
                Acertlio te da el simulador, los paneles de profesor y alumno, las estadísticas y la facturación. Tú te dedicas a enseñar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contacto"><Button size="lg">Pedir demo en directo</Button></Link>
                <Link href="/precios"><Button variant="secondary" size="lg">Ver planes</Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-rule bg-paper">
          <div className="max-w-site mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-px bg-rule rounded overflow-hidden border border-rule">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="bg-white p-7">
                    <Icon className="h-5 w-5 text-navy mb-4" strokeWidth={1.5} />
                    <h3 className="font-medium text-ink">{b.title}</h3>
                    <p className="text-sm text-muted mt-2 leading-relaxed">{b.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 py-20 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-wider text-muted mb-3">Flujo de uso</p>
              <h2 className="font-semibold text-4xl text-ink tracking-tight leading-tight">
                Cuatro pasos. Sin formación previa.
              </h2>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-px bg-rule rounded overflow-hidden border border-rule">
              {flow.map((s) => (
                <div key={s.n} className="bg-white p-6">
                  <p className="font-mono text-xs text-saffron mb-3">{s.n}</p>
                  <h3 className="font-medium text-ink">{s.t}</h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">{s.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-navy text-white">
          <div className="max-w-site mx-auto px-6 py-16 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h2 className="font-semibold text-3xl lg:text-4xl tracking-tight leading-tight">
                Te enseñamos Acertlio en 30 minutos. Tú decides después.
              </h2>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/contacto">
                <Button variant="secondary" size="lg" className="bg-white">Solicitar demo</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
