import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

/**
 * Pantalla mostrada tras completar el checkout de Stripe.
 * El webhook actualiza la suscripción de forma asíncrona, así que aquí
 * solo confirmamos y guiamos al usuario a su dashboard.
 */
export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ok/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-ok" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink">
          ¡Plan activado!
        </h1>
        <p className="mt-4 text-lg text-muted">
          Gracias por confiar en Acertlio. En unos segundos recibirás un email de
          confirmación con los detalles de tu plan.
        </p>
        <p className="mt-2 text-sm text-muted">
          Tu período de prueba ha empezado. No se te ha cobrado nada todavía.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/academia"
            className="inline-flex items-center gap-2 h-11 px-6 rounded bg-navy text-white font-medium hover:bg-navy-600"
          >
            Ir a mi dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/academia/facturacion"
            className="inline-flex items-center gap-2 h-11 px-6 rounded border-2 border-navy text-navy font-medium hover:bg-navy-50"
          >
            Ver mi facturación
          </Link>
        </div>

        {searchParams.session_id && (
          <p className="mt-8 text-xs text-muted font-mono">
            Referencia: {searchParams.session_id.slice(0, 20)}…
          </p>
        )}
      </main>
      <MarketingFooter />
    </>
  );
}
