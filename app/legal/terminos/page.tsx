/**
 * /legal/terminos
 *
 * Términos y Condiciones B2C.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones · Acertlio",
  description: "Términos y Condiciones de uso de Acertlio.",
  alternates: { canonical: "https://acertlio.com/legal/terminos" },
};

export default function TerminosPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-navy">Inicio</Link>
        <span className="mx-2">·</span>
        <span>Términos y Condiciones</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-saffron">Legal</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Términos y Condiciones</h1>
        <p className="mt-3 text-sm text-muted">
          Versión 1.0 · En vigor desde el 28 de octubre de 2026
        </p>
      </header>

      <div className="prose prose-slate max-w-none">
        <h2>1. Partes</h2>
        <p>
          Estos Términos regulan la relación entre:
        </p>
        <ul>
          <li>El titular: <strong>Omar Maleck</strong>, NIF 29551393G, con domicilio en Barriada San Diego 7, 5ºC, 41015 Sevilla.</li>
          <li>El usuario: persona física o jurídica que contrata el servicio.</li>
        </ul>

        <h2>2. Objeto</h2>
        <p>
          Acertlio es una plataforma online que ofrece simulacros de preparación
          para los exámenes Cambridge en formato computer-based, corrección
          asistida por IA del Writing y herramientas de seguimiento. Acertlio
          es una plataforma independiente y no está afiliada a Cambridge
          Assessment English.
        </p>

        <h2>3. Registro</h2>
        <p>
          El acceso completo requiere crear una cuenta. El usuario debe
          proporcionar datos reales. Si es menor de 14 años, se requiere
          autorización verificable del adulto responsable (consulta la{" "}
          <Link href="/legal/privacidad">Política de Privacidad</Link>).
        </p>

        <h2>4. Planes y precios</h2>
        <p>
          Los planes vigentes se publican en{" "}
          <Link href="/precios">/precios</Link>. Se incluye una prueba gratuita
          de 7 días sin requerir tarjeta de crédito. Las suscripciones son
          mensuales o anuales, con cancelación en cualquier momento.
        </p>

        <h2>5. Pago</h2>
        <p>
          El cobro se realiza mediante Stripe. Acertlio no almacena datos de
          tarjeta. Los importes incluyen IVA cuando corresponda y se detallan
          en la pasarela antes de confirmar.
        </p>

        <h2>6. Derecho de desistimiento</h2>
        <p>
          Si eres consumidor en la UE, dispones de 14 días naturales para
          desistir sin indicar causa. No obstante, conforme al Art. 103.m del
          RDL 1/2007, al activar la cuenta y comenzar a usar el servicio
          digital, pierdes el derecho de desistimiento sobre los contenidos
          consumidos. Para ejercer el desistimiento sobre la parte no
          consumida, escribe a <a href="mailto:hola@acertlio.com">hola@acertlio.com</a>.
        </p>

        <h2>7. Corrección asistida por IA</h2>
        <p>
          La corrección del Writing utiliza inteligencia artificial. Es una
          <strong>primera evaluación orientativa</strong>, no una calificación
          oficial. Debe ser revisada por un profesor cualificado para
          validarse. Conforme al Art. 22 RGPD, el usuario puede solicitar
          revisión humana escribiendo a{" "}
          <a href="mailto:hola@acertlio.com">hola@acertlio.com</a>.
        </p>

        <h2>8. Uso aceptable</h2>
        <p>El usuario se compromete a:</p>
        <ul>
          <li>No compartir su cuenta ni credenciales.</li>
          <li>No intentar extraer, copiar o reproducir el contenido original de la plataforma.</li>
          <li>No usar la plataforma para fines ilegales.</li>
          <li>No alterar el funcionamiento técnico de la plataforma.</li>
        </ul>

        <h2>9. Propiedad intelectual</h2>
        <p>
          El contenido (simulacros, correcciones, interfaz) es propiedad del
          titular. El acceso al servicio no transfiere derechos de propiedad
          intelectual. El usuario solo puede usar los contenidos para su
          preparación personal.
        </p>

        <h2>10. Limitación de responsabilidad</h2>
        <p>
          Acertlio es una herramienta de preparación. No garantiza la obtención
          del certificado Cambridge. La responsabilidad del titular, en caso de
          incumplimiento, se limita al importe pagado por el usuario en los 12
          meses previos.
        </p>

        <h2>11. Modificaciones</h2>
        <p>
          Estos términos pueden ser modificados. Los cambios se notificarán por
          email con 15 días de antelación. El uso continuado tras la fecha de
          entrada en vigor implica aceptación.
        </p>

        <h2>12. Legislación y jurisdicción</h2>
        <p>
          Legislación española. Para controversias, los tribunales de Sevilla,
          salvo cuando la normativa de consumo determine lo contrario.
        </p>
      </div>
    </article>
  );
}
