import Link from "next/link";
import {
  Check,
  Clock,
  Award,
  BookOpenCheck,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import type { LevelLandingConfig } from "@/lib/level-landings";

interface Props {
  config: LevelLandingConfig;
}

/**
 * Renderiza una landing SEO de nivel Cambridge.
 * Se usa desde las páginas /preparacion-XX-online/page.tsx.
 */
export function LevelLandingPage({ config }: Props) {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-wider text-saffron mb-3">
              {config.hero.kicker}
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink">
              {config.hero.title}
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed">
              {config.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/precios"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded bg-navy text-white font-medium hover:bg-navy-600"
              >
                Ver planes
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/empezar"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded border-2 border-navy text-navy font-medium hover:bg-navy-50"
              >
                Empezar prueba gratis
              </Link>
            </div>
          </div>
        </section>

        {/* Estructura del examen */}
        <section className="bg-white border-y border-rule py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl font-semibold text-ink tracking-tight">
                Estructura del examen {config.levelShort}
              </h2>
              <p className="mt-3 text-muted">
                {config.totalDuration}. Todas las partes se practican con la misma
                interfaz oficial de Cambridge Computer-Based.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.examParts.map((part, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-rule bg-paper p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-ink">{part.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-navy font-medium">
                      <Clock className="h-3 w-3" />
                      {part.duration}
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {part.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl font-semibold text-ink tracking-tight">
              Por qué preparar tu {config.levelShort} con Acertlio
            </h2>
            <p className="mt-3 text-muted">
              Todo lo que necesitas para llegar al examen con confianza.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-ok/10 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-ok" />
                </div>
                <p className="text-sm text-ink leading-relaxed pt-1">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Para quién es */}
        <section className="bg-navy-50/40 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl mb-10">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-navy font-medium mb-2">
                <Users className="h-3 w-3" />
                Para quién es
              </div>
              <h2 className="text-3xl font-semibold text-ink tracking-tight">
                ¿Es Acertlio {config.levelShort} para ti?
              </h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.whoIsItFor.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 bg-white rounded-lg border border-rule p-4"
                >
                  <Check className="h-4 w-4 text-navy shrink-0 mt-0.5" />
                  <span className="text-sm text-ink leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cambridge Scale */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-navy font-medium mb-2">
              <Award className="h-3 w-3" />
              Cómo se evalúa
            </div>
            <h2 className="text-3xl font-semibold text-ink tracking-tight">
              Cambridge English Scale — {config.levelShort}
            </h2>
            <p className="mt-3 text-muted">
              El examen {config.levelShort} se evalúa en la escala Cambridge
              English Scale, de {config.bandScore.min} a {config.bandScore.top} puntos.
              Se aprueba a partir de{" "}
              <strong className="text-ink">{config.bandScore.pass} puntos</strong>.
            </p>
          </div>

          <div className="rounded-lg border border-rule bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Grade</th>
                  <th className="text-left px-5 py-3 font-medium">Puntuación</th>
                  <th className="text-left px-5 py-3 font-medium">
                    Nivel certificado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {config.gradeTable.map((row, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 font-mono font-semibold text-ink">
                      {row.grade}
                    </td>
                    <td className="px-5 py-3 font-mono text-navy">{row.score}</td>
                    <td className="px-5 py-3 text-muted">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-navy py-16 text-white">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <BookOpenCheck className="h-10 w-10 text-saffron mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Empieza a preparar tu {config.levelShort} hoy
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              Prueba gratis 14 días. Sin tarjeta hasta el final del periodo de prueba.
              Cancela cuando quieras.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/precios"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded bg-saffron text-white font-medium hover:bg-saffron/90"
              >
                Ver planes
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/empezar"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded border-2 border-white/40 text-white font-medium hover:bg-white/10"
              >
                <Zap className="h-4 w-4" />
                Empezar prueba gratis
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
