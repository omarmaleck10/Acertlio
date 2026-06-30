import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Bloquear paneles privados, login y todo lo que no sea contenido público.
        disallow: [
          "/academia",
          "/academia/",
          "/profesor",
          "/profesor/",
          "/alumno",
          "/alumno/",
          "/admin",
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
