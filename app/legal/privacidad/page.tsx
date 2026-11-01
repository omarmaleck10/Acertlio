/**
 * /legal/privacidad
 *
 * Política de Privacidad completa conforme a RGPD (UE 2016/679) y
 * LOPD-GDD (LO 3/2018). Reemplaza el placeholder actual.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad · Acertlio",
  description:
    "Cómo Acertlio trata los datos personales conforme al RGPD y la LOPD-GDD. Responsable: Omar Maleck.",
  alternates: { canonical: "https://acertlio.com/legal/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-navy">Inicio</Link>
        <span className="mx-2">·</span>
        <span>Política de Privacidad</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-saffron">Legal</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Política de Privacidad</h1>
        <p className="mt-3 text-sm text-muted">
          Versión 1.0 · En vigor desde el 28 de octubre de 2026
        </p>
      </header>

      <div className="prose prose-slate max-w-none">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          El responsable del tratamiento de los datos personales recogidos a
          través de Acertlio es:
        </p>
        <ul>
          <li><strong>Titular:</strong> Omar Maleck</li>
          <li><strong>NIF:</strong> 29551393G</li>
          <li><strong>Domicilio:</strong> Barriada San Diego 7, 5ºC, 41015 Sevilla, España</li>
          <li><strong>Email de contacto:</strong> <a href="mailto:hola@acertlio.com">hola@acertlio.com</a></li>
          <li><strong>Teléfono:</strong> +34 631 275 431</li>
        </ul>
        <p>
          Acertlio es una plataforma independiente de preparación. No está
          afiliada ni autorizada por Cambridge Assessment English.
        </p>

        <h2>2. Datos que tratamos</h2>
        <p>Tratamos los datos estrictamente necesarios para prestar el servicio:</p>
        <ul>
          <li><strong>Identificativos:</strong> nombre completo, email, fecha de nacimiento (para verificar mayoría de edad RGPD).</li>
          <li><strong>Académicos:</strong> nivel declarado, resultados de simulacros, respuestas, tiempos, writings corregidos.</li>
          <li><strong>De uso:</strong> logs de acceso, dirección IP (hasheada con sal), tipo de dispositivo y navegador, consentimientos otorgados.</li>
          <li><strong>De facturación (plan de pago):</strong> datos fiscales de la academia o alumno individual; los datos de la tarjeta se procesan directamente por Stripe y Acertlio no los almacena.</li>
        </ul>

        <h2>3. Finalidades y base jurídica</h2>
        <table>
          <thead>
            <tr>
              <th>Finalidad</th>
              <th>Base jurídica RGPD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Prestación del servicio contratado</td>
              <td>Art. 6.1.b (ejecución de contrato)</td>
            </tr>
            <tr>
              <td>Corrección automática de simulacros y Writing</td>
              <td>Art. 6.1.b + Art. 22.2.a (decisión automatizada autorizada por contrato)</td>
            </tr>
            <tr>
              <td>Facturación y obligaciones fiscales</td>
              <td>Art. 6.1.c (obligación legal)</td>
            </tr>
            <tr>
              <td>Comunicaciones comerciales</td>
              <td>Art. 6.1.a (consentimiento)</td>
            </tr>
            <tr>
              <td>Analítica anonimizada</td>
              <td>Art. 6.1.a (consentimiento vía banner de cookies)</td>
            </tr>
            <tr>
              <td>Seguridad y auditoría</td>
              <td>Art. 6.1.f (interés legítimo)</td>
            </tr>
          </tbody>
        </table>

        <h2>4. Encargados del tratamiento (proveedores)</h2>
        <p>
          Para prestar el servicio, Acertlio contrata encargados del
          tratamiento conforme al Art. 28 RGPD. Son los siguientes:
        </p>
        <table>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Finalidad</th>
              <th>Ubicación</th>
              <th>Base de transferencia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase</td>
              <td>Base de datos y autenticación</td>
              <td>Frankfurt (DE)</td>
              <td>UE</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Alojamiento web</td>
              <td>EE.UU.</td>
              <td>Marco DPF (Data Privacy Framework)</td>
            </tr>
            <tr>
              <td>Anthropic</td>
              <td>Corrección IA del Writing</td>
              <td>EE.UU.</td>
              <td>Marco DPF</td>
            </tr>
            <tr>
              <td>Stripe</td>
              <td>Pagos</td>
              <td>Irlanda</td>
              <td>UE</td>
            </tr>
            <tr>
              <td>Brevo</td>
              <td>Envío de emails transaccionales</td>
              <td>Francia</td>
              <td>UE</td>
            </tr>
            <tr>
              <td>Google (GA4)</td>
              <td>Analítica web (solo con consentimiento)</td>
              <td>EE.UU.</td>
              <td>Marco DPF</td>
            </tr>
          </tbody>
        </table>

        <h2>5. Menores de 14 años</h2>
        <p>
          Para registrar a un menor de 14 años se requiere el consentimiento
          verificable de un adulto responsable (madre, padre, tutor legal o
          profesor con autorización de los representantes legales), conforme al
          Art. 8 RGPD y Art. 7 LOPD-GDD. El proceso: durante el registro, si el
          menor indica una fecha de nacimiento que lo sitúa por debajo de 14
          años, se le solicita el email del adulto responsable; a esa dirección
          se envía un enlace de autorización que debe ser confirmado antes de
          que la cuenta se active.
        </p>

        <h2>6. Plazos de conservación</h2>
        <ul>
          <li>Datos de cuenta: mientras la cuenta esté activa, hasta 30 días tras su cierre.</li>
          <li>Datos académicos: 2 años desde la última actividad.</li>
          <li>Datos de facturación: 6 años (obligación mercantil y fiscal).</li>
          <li>Consentimientos: mientras exista una base jurídica para probarlos.</li>
        </ul>

        <h2>7. Derechos del interesado (ARSOPOL)</h2>
        <p>
          Tienes derecho a <strong>acceder</strong>, <strong>rectificar</strong>, <strong>suprimir</strong>,{" "}
          <strong>oponerte</strong>, <strong>portabilidad</strong>, <strong>oposición al tratamiento</strong> y{" "}
          <strong>limitación</strong> del tratamiento de tus datos. Para ejercerlos:
        </p>
        <ul>
          <li>Desde tu cuenta: panel <Link href="/alumno/privacidad-y-datos">Privacidad y datos</Link>.</li>
          <li>Por email a <a href="mailto:hola@acertlio.com">hola@acertlio.com</a> adjuntando copia de documento de identidad.</li>
          <li>Reclamación ante la AEPD: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.</li>
        </ul>

        <h2>8. Cookies</h2>
        <p>
          Consulta nuestra <Link href="/legal/cookies">Política de Cookies</Link> para el detalle de cookies que utilizamos y cómo gestionar tu consentimiento.
        </p>

        <h2>9. Decisiones automatizadas (Art. 22 RGPD)</h2>
        <p>
          La corrección automática del Writing utiliza inteligencia artificial
          (Claude Sonnet). Esta corrección es una primera evaluación orientativa
          que debe ser revisada por un profesor cualificado. El alumno tiene
          derecho a solicitar revisión humana escribiendo a{" "}
          <a href="mailto:hola@acertlio.com">hola@acertlio.com</a>.
        </p>

        <h2>10. Cambios en esta política</h2>
        <p>
          Cuando esta política se modifique, los usuarios registrados serán
          informados por email con al menos 15 días de antelación.
        </p>
      </div>
    </article>
  );
}
