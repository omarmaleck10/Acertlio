import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = siteConfig.url;

  return [
    { url: `${base}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/precios`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/academias`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/empezar`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contacto`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal/aviso`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/privacidad`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/cookies`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
