import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Acertlio — Guías para aprobar Cambridge y preparar el Writing",
  description:
    "Guías, consejos y estrategias para aprobar el B2 First, C1 Advanced y C2 Proficiency. Escritos por profesores. Actualizados 2026.",
  alternates: { canonical: "/blog" },
  keywords: [
    "blog cambridge",
    "cómo aprobar b2 first",
    "cómo aprobar c1 advanced",
    "guía preparación cambridge",
  ],
  openGraph: {
    title: "Blog Acertlio — Guías Cambridge",
    description:
      "Guías para aprobar Cambridge escritas por profesores. B2 First, C1 Advanced, C2 Proficiency y Writing.",
    url: "/blog",
    type: "website",
  },
};

// Formatear fecha (ES)
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <>
      <MarketingHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-rule">
          <div className="max-w-site mx-auto px-6 pt-20 pb-16">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-saffron mb-3 font-medium">
                Blog Acertlio
              </p>
              <h1 className="font-semibold text-4xl md:text-5xl text-ink tracking-tight leading-[1.05]">
                Guías para aprobar Cambridge.
              </h1>
              <p className="mt-6 text-lg text-muted leading-relaxed">
                Estrategias, consejos y ejemplos reales para preparar B2 First,
                C1 Advanced y C2 Proficiency. Escritos por profesores que llevan
                años preparando alumnos.
              </p>
            </div>
          </div>
        </section>

        {/* Featured post */}
        {featured && (
          <section className="border-b border-rule bg-paper">
            <div className="max-w-site mx-auto px-6 py-16">
              <p className="text-xs uppercase tracking-wider text-muted mb-6 font-medium">
                Destacado
              </p>
              <Link
                href={`/blog/${featured.slug}`}
                className="block group rounded-lg border border-rule bg-white p-8 md:p-10 hover:border-navy transition-colors"
              >
                <div className="max-w-3xl">
                  <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-3">
                    {featured.category}
                  </p>
                  <h2 className="font-semibold text-2xl md:text-3xl text-ink tracking-tight leading-tight group-hover:text-navy transition-colors">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-muted leading-relaxed">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-xs text-muted">
                    <span>{formatDate(featured.publishedAt)}</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readingMinutes} min de lectura
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 mt-6 text-sm text-navy font-medium group-hover:gap-2.5 transition-all">
                    Leer artículo
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Rest of posts */}
        {rest.length > 0 && (
          <section className="border-b border-rule">
            <div className="max-w-site mx-auto px-6 py-16">
              <h2 className="font-semibold text-2xl text-ink tracking-tight mb-8">
                Todos los artículos
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group rounded-lg border border-rule bg-white p-6 hover:border-navy transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-3">
                      {post.category}
                    </p>
                    <h3 className="font-semibold text-lg text-ink leading-snug group-hover:text-navy transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>·</span>
                      <span>{post.readingMinutes} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA final */}
        <section className="bg-navy text-white">
          <div className="max-w-site mx-auto px-6 py-16 md:py-20 text-center">
            <h2 className="font-semibold text-3xl md:text-4xl tracking-tight">
              Deja de leer y empieza a practicar.
            </h2>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto">
              7 días gratis con simulacros reales y corrección IA del Writing.
              Sin tarjeta.
            </p>
            <div className="mt-8">
              <Link
                href="/empezar"
                className="inline-block rounded-md bg-white text-ink px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Empezar gratis 7 días
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
