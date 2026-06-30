import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Acertlio trata los datos personales conforme al RGPD y la LOPDGDD.",
  alternates: { canonical: "/legal/privacidad" },
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <>
      <MarketingHeader />
      <main className="border-b border-rule">
        <article className="max-w-prose mx-auto px-6 py-20">
          <p className="text-xs uppercase tracking-wider text-saffron mb-3">Legal</p>
          <h1 className="font-semibold text-4xl text-ink tracking-tight mb-8">
            Política de privacidad
          </h1>
          <div className="text-ink text-base leading-relaxed space-y-4">
            <p className="text-muted">Última actualización: pendiente. Este documento se completará con asesoría legal antes del lanzamiento en producción.</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">Responsable del tratamiento</h2>
            <p>[Pendiente] es el responsable del tratamiento de los datos personales recogidos a través de Acertlio conforme al Reglamento (UE) 2016/679 (RGPD) y la LOPDGDD.</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">Datos que tratamos</h2>
            <p>Tratamos los datos estrictamente necesarios para prestar el servicio: identificativos (nombre, email), académicos (resultados de simulacros, respuestas, tiempo invertido) y de uso (logs, IP, dispositivo).</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">Finalidad</h2>
            <p>La gestión del servicio contratado por la academia, la corrección de simulacros y la facturación. No vendemos ni cedemos datos personales a terceros.</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">Derechos</h2>
            <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, portabilidad y limitación escribiendo a privacidad@acertlio.com.</p>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </>
  );
}
