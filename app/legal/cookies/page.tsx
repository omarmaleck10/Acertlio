/**
 * /legal/cookies
 *
 * Política de Cookies conforme a Directiva ePrivacy y Art. 22 LSSI-CE.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies · Acertlio",
  description: "Política de Cookies de Acertlio.",
  alternates: { canonical: "https://acertlio.com/legal/cookies" },
};

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-navy">Inicio</Link>
        <span className="mx-2">·</span>
        <span>Política de Cookies</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-saffron">Legal</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Política de Cookies</h1>
        <p className="mt-3 text-sm text-muted">
          Versión 1.0 · En vigor desde el 28 de octubre de 2026
        </p>
      </header>

      <div className="prose prose-slate max-w-none">
        <h2>1. Qué son las cookies</h2>
        <p>
          Las cookies son pequeños archivos de texto que los sitios web
          almacenan en el navegador del usuario. Permiten recordar información
          sobre su visita, como el idioma preferido, el inicio de sesión o las
          preferencias de visualización.
        </p>

        <h2>2. Cookies que utilizamos</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Proveedor</th>
              <th>Finalidad</th>
              <th>Duración</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>sb-access-token</td>
              <td>Supabase</td>
              <td>Mantener sesión del usuario</td>
              <td>1 hora</td>
              <td>Esencial</td>
            </tr>
            <tr>
              <td>sb-refresh-token</td>
              <td>Supabase</td>
              <td>Renovar sesión</td>
              <td>7 días</td>
              <td>Esencial</td>
            </tr>
            <tr>
              <td>acertlio-cookie-consent</td>
              <td>Acertlio</td>
              <td>Guardar tu elección de consentimiento</td>
              <td>1 año</td>
              <td>Esencial</td>
            </tr>
            <tr>
              <td>_ga, _ga_XXXX</td>
              <td>Google Analytics</td>
              <td>Analítica anonimizada</td>
              <td>2 años</td>
              <td>Analítica (consentimiento)</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Cookies esenciales</h2>
        <p>
          Son necesarias para el funcionamiento básico (iniciar sesión,
          recordar tus preferencias legales). No requieren consentimiento
          conforme al Art. 22.2 LSSI-CE.
        </p>

        <h2>4. Cookies analíticas</h2>
        <p>
          Nos ayudan a entender cómo se usa la web (Google Analytics 4). Son
          anónimas y agregadas. Solo se activan si das tu consentimiento en el
          banner.
        </p>

        <h2>5. Gestión de tu consentimiento</h2>
        <p>
          Puedes aceptar, rechazar o configurar las cookies en el banner que
          aparece al entrar por primera vez. También puedes modificar tu
          elección en cualquier momento desde el enlace "Configurar cookies"
          del pie de página.
        </p>
        <p>
          Igualmente puedes bloquear o eliminar cookies desde la configuración
          de tu navegador (Chrome, Firefox, Safari, Edge).
        </p>

        <h2>6. Transferencias internacionales</h2>
        <p>
          Google Analytics realiza transferencias a EE.UU. amparadas en el
          marco Data Privacy Framework (DPF). Solo se activa si consientes su
          uso.
        </p>

        <h2>7. Más información</h2>
        <p>
          Consulta nuestra <Link href="/legal/privacidad">Política de Privacidad</Link>
          {" "}para información completa sobre el tratamiento de datos.
        </p>
      </div>
    </article>
  );
}
