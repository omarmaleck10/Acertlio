/**
 * /legal/aviso
 *
 * Aviso Legal conforme a LSSI-CE (Ley 34/2002).
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aviso Legal · Acertlio",
  description: "Aviso Legal de Acertlio conforme a la LSSI-CE.",
  alternates: { canonical: "https://acertlio.com/legal/aviso" },
};

export default function AvisoPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-navy">Inicio</Link>
        <span className="mx-2">·</span>
        <span>Aviso Legal</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-saffron">Legal</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Aviso Legal</h1>
        <p className="mt-3 text-sm text-muted">
          Versión 1.0 · En vigor desde el 28 de octubre de 2026
        </p>
      </header>

      <div className="prose prose-slate max-w-none">
        <h2>1. Identificación del titular</h2>
        <p>
          En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y de Comercio Electrónico (LSSI-CE):
        </p>
        <ul>
          <li><strong>Titular:</strong> Omar Maleck</li>
          <li><strong>NIF:</strong> 29551393G</li>
          <li><strong>Domicilio:</strong> Barriada San Diego 7, 5ºC, 41015 Sevilla, España</li>
          <li><strong>Email:</strong> <a href="mailto:hola@acertlio.com">hola@acertlio.com</a></li>
          <li><strong>Teléfono:</strong> +34 631 275 431</li>
          <li><strong>Dominio:</strong> acertlio.com</li>
        </ul>

        <h2>2. Independencia respecto a Cambridge</h2>
        <p>
          Acertlio es una plataforma independiente de preparación. No está
          afiliada, autorizada ni respaldada por Cambridge Assessment English
          ni por el University of Cambridge. Las referencias a los exámenes
          Cambridge (A2 Key, B1 Preliminary, B2 First, C1 Advanced, C2
          Proficiency) se hacen únicamente a efectos descriptivos del formato
          que replicamos para la preparación. Los contenidos son originales de
          Acertlio y no reproducen material oficial.
        </p>

        <h2>3. Objeto</h2>
        <p>
          Acertlio es una plataforma SaaS que ofrece simulacros de preparación
          para los exámenes Cambridge en formato computer-based, corrección
          asistida por IA del Writing y herramientas de seguimiento para
          academias y alumnos.
        </p>

        <h2>4. Condiciones de uso</h2>
        <p>
          El acceso y uso de la plataforma implica la aceptación de este Aviso
          Legal, la <Link href="/legal/privacidad">Política de Privacidad</Link>,
          la <Link href="/legal/cookies">Política de Cookies</Link> y los{" "}
          <Link href="/legal/terminos">Términos y Condiciones</Link>.
        </p>

        <h2>5. Propiedad intelectual e industrial</h2>
        <p>
          Los contenidos de Acertlio (textos, simulacros, correcciones,
          interfaz, código, logo y marca) son propiedad de Omar Maleck o están
          utilizados bajo licencia. Está prohibida su reproducción, distribución
          o modificación sin autorización expresa.
        </p>
        <p>
          Las marcas "Cambridge", "Cambridge English", "A2 Key", "B1 Preliminary",
          "B2 First", "C1 Advanced", "C2 Proficiency", "FCE", "CAE", "CPE", "PET"
          y "KET" son propiedad de sus respectivos titulares y se mencionan a
          efectos descriptivos.
        </p>

        <h2>6. Enlaces a terceros</h2>
        <p>
          Acertlio puede contener enlaces a sitios externos. El titular no se
          responsabiliza del contenido ni de las políticas de privacidad de
          dichos sitios.
        </p>

        <h2>7. Legislación y jurisdicción</h2>
        <p>
          Este Aviso Legal se rige por la legislación española. Para cualquier
          controversia, las partes se someten a los Juzgados y Tribunales de
          Sevilla, salvo que la normativa aplicable determine otra jurisdicción
          imperativa.
        </p>
      </div>
    </article>
  );
}
