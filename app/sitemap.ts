import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { LANDING_SLUGS } from "@/lib/level-landings";
import { BLOG_POSTS } from "@/lib/blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = siteConfig.url;

  const landingUrls = LANDING_SLUGS.map((slug) => ({
    url: `${base}/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const blogUrls = BLOG_POSTS.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    { url: `${base}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/precios`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/academias`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/correccion-writing-ia`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/examen-cambridge-computer-based`, lastModified, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    ...landingUrls,
    ...blogUrls,
    { url: `${base}/empezar`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contacto`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal/aviso`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/privacidad`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/cookies`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
