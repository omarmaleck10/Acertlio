import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * robots.txt para Acertlio.
 *
 * CRÍTICO: Google interpreta el `disallow` como un prefijo. Por eso
 * `/academia` (sin barra final) NO solo bloquea el dashboard privado
 * `/academia/*` — también bloquea la landing PÚBLICA `/academias`
 * porque empieza igual.
 *
 * Solución: usar SIEMPRE la barra final en las reglas de dashboards
 * privados: `/academia/`, `/profesor/`, etc. Así solo se bloquean las
 * subrutas, no las landings públicas que empiezan parecido.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Dashboards privados — SOLO con barra final, para NO bloquear
          // /academias, /alumnos, /profesores que son landings públicas.
          "/academia/",
          "/profesor/",
          "/alumno/",
          "/admin/",
          "/api/",
          "/login",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
