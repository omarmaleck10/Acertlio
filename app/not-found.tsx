import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <header className="px-6 py-6">
        <Link href="/" aria-label="Inicio">
          <Logo />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-saffron mb-4">404</p>
          <h1 className="font-semibold text-4xl text-ink tracking-tight mb-3">
            Esta página no existe.
          </h1>
          <p className="text-muted mb-8">
            La URL que has seguido no lleva a ningún sitio de Acertlio. Quizá borraste algo del enlace o ya no está disponible.
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
