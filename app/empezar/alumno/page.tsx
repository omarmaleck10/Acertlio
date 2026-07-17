import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Mail } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Acceso individual — próximamente",
  description:
    "Acertlio abrirá pronto un plan para alumnos individuales que se preparan por su cuenta. Déjanos tu email y te avisamos cuando esté disponible.",
  alternates: { canonical: "/empezar/alumno" },
};

export default function EmpezarAlumnoPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="px-6 py-6 max-w-site mx-auto">
        <Link href="/" aria-label="Volver al inicio">
          <Logo />
        </Link>
      </header>

      <section className="max-w-xl mx-auto px-6 py-12">
        <Link
          href="/empezar"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <p className="text-xs uppercase tracking-wider text-saffron mb-3">
          Alumno individual
        </p>
        <h1 className="text-4xl font-semibold text-ink tracking-tight leading-tight">
          Estamos preparando el acceso individual.
        </h1>
        <p className="mt-4 text-lg text-muted leading-relaxed">
          Acertlio está hoy diseñado para academias, pero abriremos pronto un plan
          para alumnos que se preparan por su cuenta. Déjanos tu email y te avisamos
          en cuanto esté listo.
        </p>

        <form className="mt-10 rounded border border-rule bg-white p-6 space-y-4">
          <div>
            <Label htmlFor="email">Tu email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="level">¿Qué examen preparas?</Label>
            <select
              id="level"
              className="h-10 w-full rounded border border-rule bg-white px-3 text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            >
              <option>A2 Key</option>
              <option>B1 Preliminary</option>
              <option>B2 First</option>
              <option>C1 Advanced</option>
              <option>C2 Proficiency</option>
              <option>Aún no lo sé</option>
            </select>
          </div>
          <Button type="button" className="w-full" size="lg">
            <Mail className="h-4 w-4" />
            Avísame cuando esté disponible
          </Button>
          <p className="text-xs text-muted">
            Sin spam. Solo un email cuando el plan individual esté listo.
          </p>
        </form>

        <div className="mt-10 p-6 rounded border border-rule bg-navy-50">
          <p className="text-xs uppercase tracking-wider text-navy mb-2">
            ¿Eres profesor o tienes una academia pequeña?
          </p>
          <p className="text-sm text-ink mb-4">
            Si das clases particulares o tienes una academia, ya puedes empezar con el plan Starter desde 39 €/mes (20 plazas).
          </p>
          <Link href="/precios">
            <Button size="sm">Ver planes para academias</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
