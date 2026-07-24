import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

/**
 * Pantalla mostrada cuando el usuario cancela el checkout de Stripe.
 * Ningún cargo se ha realizado. Guiamos de vuelta a precios.
 */
export default function CheckoutCancelledPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-saffron/10 mb-6">
          <XCircle className="h-10 w-10 text-saffron" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink">
          Pago cancelado
        </h1>
        <p className="mt-4 text-lg text-muted">
          No se ha realizado ningún cargo. Cuando estés listo, puedes volver a
          elegir un plan.
        </p>
        <p className="mt-2 text-sm text-muted">
          Si tienes dudas sobre qué plan te conviene, escríbenos y te ayudamos.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/precios"
            className="inline-flex items-center gap-2 h-11 px-6 rounded bg-navy text-white font-medium hover:bg-navy-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a precios
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 h-11 px-6 rounded border-2 border-navy text-navy font-medium hover:bg-navy-50"
          >
            Hablar con nosotros
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
