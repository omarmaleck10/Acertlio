"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Building2, Building, Crown, ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OptionId = "alumno" | "academia-pequena" | "academia-grande" | "enterprise";

const options: Array<{
  id: OptionId;
  icon: typeof User;
  title: string;
  description: string;
  hint: string;
  href: string;
}> = [
  {
    id: "alumno",
    icon: User,
    title: "Soy un alumno",
    description: "Quiero prepararme yo mismo para mi examen Cambridge.",
    hint: "Acceso individual",
    href: "/empezar/alumno",
  },
  {
    id: "academia-pequena",
    icon: Building2,
    title: "Tengo una academia pequeña",
    description: "Hasta 50 alumnos preparando Cambridge al año.",
    hint: "Plan Starter o Pro · desde 39 €/mes",
    href: "/precios#starter",
  },
  {
    id: "academia-grande",
    icon: Building,
    title: "Tengo una academia grande",
    description: "Entre 50 y 250 alumnos preparando Cambridge al año.",
    hint: "Plan Business · 139 €/mes",
    href: "/precios#business",
  },
  {
    id: "enterprise",
    icon: Crown,
    title: "Cadena o academia muy grande",
    description: "Más de 250 alumnos, varios centros, integraciones a medida.",
    hint: "Plan Enterprise · hablamos contigo",
    href: "/contacto",
  },
];

export default function EmpezarPage() {
  const [selected, setSelected] = useState<OptionId | null>(null);
  const selectedOption = options.find((o) => o.id === selected);

  return (
    <main className="min-h-screen bg-paper">
      <header className="px-6 py-6 max-w-site mx-auto">
        <Link href="/" aria-label="Volver al inicio">
          <Logo />
        </Link>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs uppercase tracking-wider text-saffron mb-3">Empezar con Acertlio</p>
        <h1 className="text-4xl font-semibold text-ink tracking-tight leading-tight">
          ¿Cómo vas a usar Acertlio?
        </h1>
        <p className="mt-4 text-lg text-muted leading-relaxed">
          Cuéntanos quién eres y te llevamos al plan que mejor encaja. Cambiar después es fácil.
        </p>

        <div className="mt-10 space-y-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={cn(
                  "w-full text-left rounded border p-5 transition-all flex items-start gap-4",
                  isSelected
                    ? "border-navy bg-white ring-2 ring-navy/10"
                    : "border-rule bg-white hover:border-navy/40"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded flex items-center justify-center shrink-0",
                    isSelected ? "bg-navy text-white" : "bg-paper text-muted"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-semibold text-ink">{opt.title}</h2>
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                        isSelected ? "border-navy" : "border-rule"
                      )}
                    >
                      {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-navy" />}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">{opt.description}</p>
                  <p
                    className={cn(
                      "text-xs mt-2 font-mono",
                      isSelected ? "text-navy" : "text-muted"
                    )}
                  >
                    {opt.hint}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted hover:text-ink">
            ← Volver
          </Link>
          {selectedOption ? (
            <Link href={selectedOption.href}>
              <Button size="lg">
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" disabled>
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="mt-8 text-xs text-muted text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-navy hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
