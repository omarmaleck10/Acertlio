import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateIndividualRegistrationAction } from "./actions";

interface Props {
  searchParams: { session_id?: string };
}

export const metadata = {
  title: "¡Bienvenido a Acertlio!",
  robots: { index: false, follow: false },
};

/**
 * Pantalla mostrada tras completar el checkout de Stripe.
 *
 * En este paso, activamos el registro:
 *   1. Verificamos la session_id contra Stripe
 *   2. Buscamos la individual_registration por stripe_session_id
 *   3. Si no está aún completada:
 *      - Creamos usuario auth con admin.createUser (email pre-confirmado)
 *      - Creamos profile con datos del registration
 *      - Vinculamos subscription
 *      - Enviamos magic link para primer acceso
 *   4. Mostramos pantalla "Revisa tu email"
 *
 * Este flujo es idempotente: si el webhook de Stripe ya la activó
 * antes de que el usuario llegara aquí, simplemente muestra la pantalla
 * sin volver a crear nada.
 */
export default async function IndividualGraciasPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect("/individual/empezar");
  }

  // Buscar la registration
  const admin = createAdminClient();
  const { data: reg } = await admin
    .from("individual_registrations")
    .select("id, email, full_name, target_level, status, profile_id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (!reg) {
    // Session desconocida — probablemente no venía de nuestro flujo
    return (
      <ErrorLayout
        title="No hemos encontrado tu registro"
        message="Ha habido un problema al procesar tu pago. Si se te ha cobrado, contáctanos y lo resolvemos."
      />
    );
  }

  // Si aún no está activada, intentar activarla
  if (reg.status !== "completed") {
    const result = await activateIndividualRegistrationAction({
      registrationId: reg.id,
      sessionId,
    });
    if (result.error) {
      return (
        <ErrorLayout
          title="Estamos preparando tu cuenta"
          message={`${result.error}. Espera unos segundos y refresca la página, o contáctanos si persiste.`}
        />
      );
    }
  }

  // Éxito
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg border border-rule p-8 md:p-10 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-ok/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-ok" />
          </div>

          <p className="text-xs uppercase tracking-wider text-saffron font-semibold mb-2">
            ¡Pago confirmado!
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-ink tracking-tight mb-3">
            Bienvenido, {reg.full_name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted leading-relaxed mb-6">
            Ya tienes acceso a los simulacros de{" "}
            <strong className="text-navy">{reg.target_level}</strong>. Te hemos
            enviado un email con un enlace para acceder a tu cuenta.
          </p>

          <div className="rounded border border-navy/20 bg-navy/5 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-navy flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-ink">
                  Revisa tu email
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Enviado a <strong className="text-ink">{reg.email}</strong>
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted mb-6 leading-relaxed">
            El enlace es válido durante 1 hora. Si no encuentras el email,
            revisa tu carpeta de spam.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-ink transition-colors"
          >
            O accede desde la página de login
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}


function ErrorLayout({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg border border-saffron/30 p-8 text-center">
          <h1 className="text-xl font-semibold text-ink mb-2">{title}</h1>
          <p className="text-sm text-muted leading-relaxed mb-6">{message}</p>
          <Link
            href="/individual/empezar"
            className="text-sm font-medium text-navy hover:text-ink transition-colors"
          >
            Volver a empezar
          </Link>
        </div>
      </div>
    </div>
  );
}
