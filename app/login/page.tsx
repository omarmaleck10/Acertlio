import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede al panel de tu academia, profesor o alumno.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-paper flex">
      {/* Left: form */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <Link href="/" className="self-start" aria-label="Inicio">
          <Logo />
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="font-semibold text-3xl text-ink tracking-tight mb-2">
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted mb-8">
              Accede al panel de tu academia, profesor o alumno.
            </p>

            <form className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@academia.com" autoComplete="email" />
              </div>
              <div>
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="#" className="text-xs text-navy hover:underline">
                    ¿La olvidaste?
                  </Link>
                </div>
                <Input id="password" type="password" autoComplete="current-password" />
              </div>

              <Button type="button" className="w-full" size="lg">
                Entrar
              </Button>
            </form>

            <p className="mt-8 text-sm text-muted text-center">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/precios" className="text-navy hover:underline">
                Ver planes para academias
              </Link>
            </p>

            <div className="mt-12 rounded border border-rule bg-white p-4 text-xs text-muted">
              <p className="font-medium text-ink mb-2">Vista previa</p>
              <p className="mb-3">Este es el inicio de sesión visual. Para explorar los paneles sin login todavía:</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/academia" className="text-navy hover:underline">Academia</Link>
                <span>·</span>
                <Link href="/profesor" className="text-navy hover:underline">Profesor</Link>
                <span>·</span>
                <Link href="/alumno" className="text-navy hover:underline">Alumno</Link>
                <span>·</span>
                <Link href="/admin" className="text-navy hover:underline">Admin</Link>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted self-start">© {new Date().getFullYear()} Acertlio</p>
      </div>

      {/* Right: pattern */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent 0 24px, white 24px 25px)"
        }} />
        <div className="relative max-w-md px-12">
          <p className="font-mono text-xs uppercase tracking-wider text-saffron mb-4">Cambridge Computer-Based</p>
          <p className="font-semibold text-3xl leading-tight tracking-tight">
            «Cuando el alumno se sienta delante del examen real, ya lo ha hecho diez veces.»
          </p>
        </div>
      </div>
    </main>
  );
}
