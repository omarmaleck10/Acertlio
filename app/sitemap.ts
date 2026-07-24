import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { LANDING_SLUGS } from "@/lib/level-landings";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = siteConfig.url;

  const landingUrls = LANDING_SLUGS.map((slug) => ({
    url: `${base}/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [
    { url: `${base}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/precios`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/academias`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...landingUrls,
    { url: `${base}/empezar`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contacto`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal/aviso`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/privacidad`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/cookies`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
