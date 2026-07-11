import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser, dashboardPathForRole } from "@/lib/supabase/user";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede al panel de tu academia, profesor o alumno.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  // Si ya hay sesión, redirigimos directamente al dashboard.
  const user = await getCurrentUser();
  if (user) {
    redirect(dashboardPathForRole(user.profile.role));
  }

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

            <LoginForm />

            <p className="mt-8 text-sm text-muted text-center">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/precios" className="text-navy hover:underline">
                Ver planes para academias
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-muted self-start">
          © {new Date().getFullYear()} Acertlio
        </p>
      </div>

      {/* Right: pattern decorativo */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-navy text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent 0 24px, white 24px 25px)",
          }}
        />
        <div className="relative max-w-md px-12">
          <p className="font-mono text-xs uppercase tracking-wider text-saffron mb-4">
            Cambridge Computer-Based
          </p>
          <p className="font-semibold text-3xl leading-tight tracking-tight">
            «Cuando el alumno se sienta delante del examen real, ya lo ha hecho diez veces.»
          </p>
        </div>
      </div>
    </main>
  );
}
