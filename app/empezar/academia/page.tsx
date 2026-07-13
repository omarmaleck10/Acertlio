import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { SignUpAcademyForm } from "@/components/auth/signup-academy-form";
import { getCurrentUser, dashboardPathForRole } from "@/lib/supabase/user";

export const metadata: Metadata = {
  title: "Crear cuenta de academia",
  description:
    "Crea la cuenta de tu academia en Acertlio y empieza a preparar Cambridge Computer-Based con la misma interfaz del examen real.",
  robots: { index: false, follow: false },
};

type Plan = "starter" | "pro" | "business";

const VALID_PLANS: Plan[] = ["starter", "pro", "business"];

export default async function EmpezarAcademiaPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  // Si ya hay sesión, mándalo a su dashboard
  const user = await getCurrentUser();
  if (user) {
    redirect(dashboardPathForRole(user.profile.role));
  }

  // Normalizar plan del query param
  const planParam = (searchParams.plan ?? "starter").toLowerCase();
  const plan: Plan = VALID_PLANS.includes(planParam as Plan)
    ? (planParam as Plan)
    : "starter";

  return (
    <main className="min-h-screen bg-paper">
      <header className="px-6 py-6 max-w-site mx-auto">
        <Link href="/" aria-label="Inicio">
          <Logo />
        </Link>
      </header>

      <section className="max-w-xl mx-auto px-6 py-8 pb-16">
        <p className="text-xs uppercase tracking-wider text-saffron mb-3">
          Nueva academia
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight leading-tight mb-3">
          Crea la cuenta de tu academia.
        </h1>
        <p className="text-muted mb-10 leading-relaxed">
          En dos minutos tendrás acceso al panel. Podrás invitar profesores, dar
          de alta alumnos y asignar simulacros desde el primer día.
        </p>

        <SignUpAcademyForm plan={plan} />

        <p className="mt-8 text-sm text-muted text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-navy hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
