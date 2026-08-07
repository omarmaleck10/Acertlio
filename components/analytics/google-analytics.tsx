/**
 * Google Analytics 4 (GA4)
 *
 * Este componente carga el tag oficial de GA4 usando `next/script`
 * con la estrategia `afterInteractive` (recomendada por Google):
 * el script se carga después de que la página se vuelve interactiva,
 * sin bloquear el render inicial.
 *
 * El Measurement ID (G-XXXXXXXXXX) se coge de la variable de entorno
 * NEXT_PUBLIC_GA_MEASUREMENT_ID. Si no está definida, no se carga
 * nada (por ejemplo en local o previews).
 *
 * Uso:
 *   import { GoogleAnalytics } from "@/components/analytics/google-analytics";
 *   <GoogleAnalytics />
 */

import Script from "next/script";

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Si no hay Measurement ID configurado, no cargar nada.
  // Esto permite tenerlo desactivado en local sin errores.
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}
