import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { ActivateAccountForm } from "@/components/auth/activate-account-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, dashboardPathForRole } from "@/lib/supabase/user";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Activar cuenta",
  description: "Acepta tu invitación y crea tu contraseña de Acertlio.",
  robots: { index: false, follow: false },
};

export default async function ActivarPage({
  params,
}: {
  params: { token: string };
}) {
  // Si ya hay sesión, redirigimos al dashboard
  const user = await getCurrentUser();
  if (user) {
    redirect(dashboardPathForRole(user.profile.role));
  }

  // Buscar la invitación
  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("email, role, academy_id, expires_at, accepted_at")
    .eq("token", params.token)
    .maybeSingle();

  // Casos de error
  const isInvalid = !invitation;
  const isAccepted = invitation?.accepted_at !== null && invitation?.accepted_at !== undefined;
  const isExpired =
    invitation && new Date(invitation.expires_at) < new Date();

  if (isInvalid || isAccepted || isExpired) {
    return (
      <main className="min-h-screen bg-paper">
        <header className="px-6 py-6 max-w-site mx-auto">
          <Link href="/" aria-label="Inicio">
            <Logo />
          </Link>
        </header>
        <section className="max-w-md mx-auto px-6 py-12">
          <div className="rounded border border-bad/30 bg-bad/5 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-bad mx-auto mb-3" />
            <h1 className="text-lg font-semibold text-ink mb-2">
              Invitación no válida
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              {isAccepted
                ? "Esta invitación ya se ha usado. Si eres tú, prueba a iniciar sesión con tu contraseña."
                : isExpired
                ? "Esta invitación ha caducado (más de 7 días). Pide a tu academia que te envíe una nueva."
                : "El enlace no es válido. Pide a tu academia que te envíe una nueva invitación."}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/login"
                className="text-sm text-navy hover:underline"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/"
                className="text-sm text-muted hover:text-ink"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Cargar el nombre de la academia
  const { data: academy } = await admin
    .from("academies")
    .select("name")
    .eq("id", invitation.academy_id)
    .maybeSingle();

  const academyName = academy?.name ?? "tu academia";

  return (
    <main className="min-h-screen bg-paper">
      <header className="px-6 py-6 max-w-site mx-auto">
        <Link href="/" aria-label="Inicio">
          <Logo />
        </Link>
      </header>

      <section className="max-w-md mx-auto px-6 py-8 pb-16">
        <p className="text-xs uppercase tracking-wider text-saffron mb-3">
          Activar cuenta
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight leading-tight mb-3">
          Un paso más y estás dentro.
        </h1>
        <p className="text-muted mb-10 leading-relaxed">
          Pon una contraseña para tu cuenta y podrás entrar a Acertlio ahora mismo.
        </p>

        <ActivateAccountForm
          token={params.token}
          email={invitation.email}
          role={invitation.role as "academy_admin" | "teacher" | "student"}
          academyName={academyName}
        />
      </section>
    </main>
  );
}
