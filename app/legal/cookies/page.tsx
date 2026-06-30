import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies utiliza Acertlio y cómo gestionarlas.",
  alternates: { canonical: "/legal/cookies" },
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <>
      <MarketingHeader />
      <main className="border-b border-rule">
        <article className="max-w-prose mx-auto px-6 py-20">
          <p className="text-xs uppercase tracking-wider text-saffron mb-3">Legal</p>
          <h1 className="font-semibold text-4xl text-ink tracking-tight mb-8">
            Política de cookies
          </h1>
          <div className="text-ink text-base leading-relaxed space-y-4">
            <p className="text-muted">Última actualización: pendiente.</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">Qué son las cookies</h2>
            <p>Las cookies son pequeños archivos que se almacenan en tu navegador cuando visitas un sitio web. Sirven para recordar tu sesión, preferencias y comportamiento de navegación.</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">Cookies que usa Acertlio</h2>
            <p>Acertlio utiliza cookies estrictamente técnicas, necesarias para mantener tu sesión iniciada y proteger la seguridad de tu cuenta. No utilizamos cookies de publicidad ni de seguimiento de terceros.</p>
            <h2 className="font-semibold text-2xl mt-8 text-ink">Cómo gestionarlas</h2>
            <p>Puedes configurar tu navegador para bloquear cookies, pero hacerlo puede impedirte iniciar sesión correctamente en Acertlio.</p>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </>
  );
}
