/**
 * Metadatos de posts del blog.
 *
 * Cada post se implementa como su propio page.tsx en:
 * app/blog/{slug}/page.tsx
 *
 * Este archivo mantiene la lista centralizada para:
 *  · Índice del blog (/blog)
 *  · Sitemap (SEO)
 *  · Posts relacionados
 *  · RSS futuro
 */

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  keyword: string; // Keyword SEO principal
  category:
    | "Cómo Aprobar"
    | "Info Niveles"
    | "Writing IA"
    | "Computer-Based"
    | "Academias";
  publishedAt: string; // ISO date
  readingMinutes: number;
  featured?: boolean;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "que-es-el-b2-first-guia-completa",
    title: "Qué es el B2 First: estructura, usos y cómo prepararlo (guía 2026)",
    excerpt:
      "El B2 First (antes FCE) es el examen Cambridge más solicitado en España. Explicamos qué es, qué acredita, cómo se estructura y para qué sirve — universidad, becas, oposiciones o trabajo.",
    keyword: "que es el b2 first",
    category: "Info Niveles",
    publishedAt: "2026-08-06",
    readingMinutes: 11,
  },
  {
    slug: "como-aprobar-b2-first-a-la-primera",
    title: "Cómo aprobar el B2 First a la primera: guía completa 2026",
    excerpt:
      "Estructura del examen, plan de estudio realista, estrategias por parte y los errores que hacen que se suspenda a la primera. Guía escrita por profesores.",
    keyword: "como aprobar b2 first",
    category: "Cómo Aprobar",
    publishedAt: "2026-08-05",
    readingMinutes: 14,
    featured: true,
  },
];
