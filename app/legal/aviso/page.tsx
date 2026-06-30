import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Información legal y condiciones de uso de Acertlio.",
  alternates: { canonical: "/legal/aviso" },
  robots: { index: true, follow: true },
};

export default function AvisoLegalPage() {
  return (
    <>
      <MarketingHeader />
      <main className="border-b border-rule">
        <article className="max-w-prose mx-auto px-6 py-20">
          <p className="text-xs uppercase tracking-wider text-saffron mb-3">Legal</p>
          <h1 className="font-semibold text-4xl text-ink tracking-tight mb-8">
            Aviso legal
          </h1>
          <div className="prose-acertlio text-ink text-base leading-relaxed space-y-4">
            <p className="text-muted">
              Última actualización: pendiente. Este texto se completará antes del lanzamiento en producción con los datos identificativos de la empresa titular de Acertlio (razón social, CIF, domicilio social, e-mail de contacto e inscripción registral correspondiente).
            </p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">1. Titularidad del sitio</h2>
            <p>El sitio web acertlio.com es titularidad de [pendiente de completar], con CIF [pendiente] y domicilio social en [pendiente].</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">2. Condiciones de uso</h2>
            <p>El acceso y uso de Acertlio está sujeto a los términos y condiciones aceptados por las academias en su contrato de suscripción.</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">3. Propiedad intelectual</h2>
            <p>El software, diseño, marca, identidad visual y contenidos didácticos publicados en Acertlio son propiedad de su titular y están protegidos por la legislación vigente en materia de propiedad intelectual.</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">4. Jurisdicción</h2>
            <p>Cualquier controversia derivada del uso de la plataforma se someterá a la jurisdicción de los Juzgados y Tribunales del domicilio del titular.</p>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </>
  );
}
