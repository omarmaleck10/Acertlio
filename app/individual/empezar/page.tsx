import Link from "next/link";
import { ArrowLeft, GraduationCap, CheckCircle2 } from "lucide-react";
import { INDIVIDUAL_PLAN } from "@/lib/stripe/plans";
import { IndividualRegistrationForm } from "@/components/individual/registration-form";

interface Props {
  searchParams: { interval?: string; cancelled?: string };
}

export const metadata = {
  title: "Empieza tu prueba gratis — Acertlio Individual",
  description:
    "Preparación Cambridge con simulacros Computer-Based auténticos. Empieza con 7 días de prueba y hasta 3 simulacros gratis.",
};


function fmtPrice(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}


export default function IndividualEmpezarPage({ searchParams }: Props) {
  const defaultInterval =
    searchParams.interval === "yearly" ? "yearly" : "monthly";
  const wasCancelled = searchParams.cancelled === "1";

  const monthly = fmtPrice(INDIVIDUAL_PLAN.monthly.price);
  const yearly = fmtPrice(INDIVIDUAL_PLAN.yearly.price);
  const yearlyMonthly = fmtPrice(INDIVIDUAL_PLAN.yearly.price / 12);

  return (
    <div className="min-h-screen bg-paper">
      {/* Header simple */}
      <header className="border-b border-rule bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-ink tracking-tight">
            Acertl<span className="text-saffron">i</span>o
          </Link>
          <Link
            href="/precios"
            className="text-xs text-muted hover:text-ink transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Ver todos los planes
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          {/* Columna izquierda: formulario */}
          <div>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-navy font-medium">
                Plan Individual · Cambridge Computer-Based
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight mt-1">
                Empieza tu preparación
              </h1>
              <p className="text-sm text-muted mt-3 max-w-xl">
                Rellena estos datos y en menos de 2 minutos tendrás acceso a
                simulacros oficiales del nivel Cambridge que elijas.
              </p>
            </div>

            {wasCancelled && (
              <div className="mb-6 rounded border border-saffron/40 bg-saffron/10 p-3 text-sm text-ink">
                Cancelaste el pago. Puedes volver a intentarlo cuando quieras
                (tus datos siguen aquí).
              </div>
            )}

            <IndividualRegistrationForm
              defaultInterval={defaultInterval}
              monthlyPrice={monthly}
              yearlyPrice={yearly}
              yearlyMonthlyEquivalent={`${yearlyMonthly}/mes`}
            />
          </div>

          {/* Columna derecha: benefits (sticky) */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-lg border border-rule bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-saffron" />
                <p className="text-sm font-semibold text-ink">
                  Qué incluye tu plan
                </p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok flex-shrink-0 mt-0.5" />
                  <span className="text-ink">
                    Simulacros ilimitados del nivel elegido
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok flex-shrink-0 mt-0.5" />
                  <span className="text-ink">
                    Interfaz idéntica al examen oficial Computer-Based
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok flex-shrink-0 mt-0.5" />
                  <span className="text-ink">
                    Autocorrección instantánea de Reading
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok flex-shrink-0 mt-0.5" />
                  <span className="text-ink">
                    Guarda tus respuestas de Writing para futura corrección
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok flex-shrink-0 mt-0.5" />
                  <span className="text-ink">
                    Cancela cuando quieras, sin permanencia
                  </span>
                </li>
              </ul>

              <hr className="my-5 border-rule" />

              <p className="text-xs text-muted leading-relaxed">
                <strong className="text-ink">7 días de prueba gratis</strong>{" "}
                con hasta 3 simulacros. Sin cobro hasta el día 8.
              </p>
            </div>

            <p className="text-xs text-muted text-center mt-4">
              ¿Eres de una academia?{" "}
              <Link
                href="/precios"
                className="text-navy underline hover:text-ink"
              >
                Ver planes para academias
              </Link>
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
