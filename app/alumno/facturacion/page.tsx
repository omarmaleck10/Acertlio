import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, ExternalLink, ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { BillingPortalButton } from "@/components/academia/billing-portal-button";
import { getIndividualStatus } from "@/lib/individual/trial";

export default async function AlumnoFacturacionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isIndividual = Boolean(
    (user.profile as unknown as Record<string, unknown>).is_individual
  );

  // Solo individuales tienen su propia facturación
  // (los de academia usan el portal de la academia)
  if (!isIndividual) {
    redirect("/alumno");
  }

  const admin = createAdminClient();

  const { data: subscription } = await admin
    .from("subscriptions")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = await getIndividualStatus({
    id: user.id,
    is_individual: true,
    trial_ends_at:
      ((user.profile as unknown as Record<string, unknown>)
        .trial_ends_at as string | null) ?? null,
    current_level:
      ((user.profile as unknown as Record<string, unknown>)
        .current_level as string | null) ?? null,
  });

  const trialEndsFmt = status.trial_ends_at
    ? new Date(status.trial_ends_at).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const isTrialing =
    status.status === "trialing_ok" ||
    status.status === "trialing_expiring" ||
    status.status === "trialing_capped";

  return (
    <div className="px-6 md:px-8 py-8 max-w-3xl">
      <Link
        href="/alumno"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          Facturación
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          Tu suscripción
        </h1>
        <p className="text-sm text-muted mt-2">
          Gestiona tu método de pago, ve tus facturas y cancela cuando quieras.
        </p>
      </header>

      {/* Estado */}
      <div className="rounded-lg border border-rule bg-white p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-1">
              Plan actual
            </p>
            <p className="text-lg font-semibold text-ink">
              Individual · {status.cambridge_level ?? "—"}
            </p>
            <div className="mt-3 space-y-1.5 text-sm">
              {isTrialing && (
                <div className="flex items-center gap-2 text-navy">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <strong>Trial activo</strong>
                    {trialEndsFmt && ` hasta el ${trialEndsFmt}`}
                  </span>
                </div>
              )}
              {status.status === "active" && (
                <div className="flex items-center gap-2 text-ok">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    <strong>Suscripción activa</strong>
                  </span>
                </div>
              )}
              {status.status === "cancelled" && (
                <div className="flex items-center gap-2 text-error">
                  <span>
                    <strong>Cancelada</strong>
                  </span>
                </div>
              )}
              {status.mocks_remaining !== null &&
                status.status !== "active" && (
                  <p className="text-xs text-muted">
                    Simulacros del trial:{" "}
                    <strong className="text-ink">
                      {status.mocks_used}/{status.cap}
                    </strong>{" "}
                    usados
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Portal */}
      <div className="rounded-lg border border-rule bg-white p-6">
        <div className="flex items-start gap-3 mb-4">
          <CreditCard className="h-5 w-5 text-navy flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink">
              Panel de facturación
            </p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Abre el portal seguro de Stripe para ver tus facturas,
              cambiar tu método de pago o cancelar tu suscripción.
            </p>
          </div>
        </div>
        <BillingPortalButton />
        {!subscription?.stripe_customer_id && (
          <p className="text-xs text-muted mt-3">
            Aún no tenemos un método de pago vinculado.
          </p>
        )}
      </div>

      <p className="text-xs text-muted mt-6 leading-relaxed text-center">
        Todos los pagos los procesa Stripe. Acertlio no almacena datos de
        tarjeta.
      </p>
    </div>
  );
}
