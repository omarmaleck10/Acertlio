import Link from "next/link";
import { Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { IndividualStatus } from "@/lib/individual/trial";

interface Props {
  status: IndividualStatus;
}

/**
 * Banner con el estado del trial/suscripción del alumno individual.
 *
 * Estados visuales:
 *   - trialing_ok: navy suave, "Trial: X/3 · Y días restantes"
 *   - trialing_expiring: saffron, "¡Últimos días! X/3 usados"
 *   - trialing_capped: rojo, "Has usado tus 3 mocks"
 *   - active: no muestra (o toast bienvenida)
 *   - cancelled: rojo con CTA renovar
 */
export function TrialBanner({ status }: Props) {
  if (!status.is_individual || status.status === "active") return null;

  if (status.status === "trialing_ok") {
    return (
      <div className="rounded-lg border border-navy/30 bg-navy/5 px-4 py-3 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Clock className="h-4 w-4 text-navy flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-ink">
                <strong>Trial activo</strong>
                <span className="text-muted"> · Te quedan </span>
                <strong>{status.days_left_in_trial}</strong>
                <span className="text-muted"> días</span>
              </p>
              <p className="text-xs text-muted mt-0.5">
                Simulacros: {status.mocks_used}/{status.cap} usados.
                Se activa tu suscripción el día 8 automáticamente.
              </p>
            </div>
          </div>
          <Link
            href="/alumno/facturacion"
            className="text-xs text-navy hover:underline whitespace-nowrap"
          >
            Ver facturación →
          </Link>
        </div>
      </div>
    );
  }

  if (status.status === "trialing_expiring") {
    return (
      <div className="rounded-lg border border-saffron/40 bg-saffron/10 px-4 py-3 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AlertCircle className="h-4 w-4 text-saffron flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-ink">
                <strong>Últimos {status.days_left_in_trial} días de trial</strong>
              </p>
              <p className="text-xs text-muted mt-0.5">
                Simulacros: {status.mocks_used}/{status.cap} usados.
                Tu suscripción se activará automáticamente y pasarás a
                acceso ilimitado.
              </p>
            </div>
          </div>
          <Link
            href="/alumno/facturacion"
            className="text-xs text-navy hover:underline whitespace-nowrap"
          >
            Ver facturación →
          </Link>
        </div>
      </div>
    );
  }

  if (status.status === "trialing_capped") {
    return (
      <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 mb-6">
        <div className="flex items-start gap-3">
          <XCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-ink">
              <strong>Has completado tus 3 simulacros de prueba</strong>
            </p>
            <p className="text-xs text-muted mt-0.5">
              Espera al día 8 y tu suscripción se activará automáticamente
              con acceso ilimitado a tus mocks.
              {status.days_left_in_trial !== null && status.days_left_in_trial > 0
                ? ` Quedan ${status.days_left_in_trial} días.`
                : ""}
              {" "}Puedes seguir revisando los mocks que ya empezaste, o
              actualizar tu plan desde tu panel de facturación.
            </p>
            <Link
              href="/alumno/facturacion"
              className="inline-block mt-2 text-xs text-navy hover:underline font-medium"
            >
              Actualizar ahora →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status.status === "cancelled") {
    return (
      <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 mb-6">
        <div className="flex items-start gap-3">
          <XCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-ink">
              <strong>Tu suscripción está cancelada</strong>
            </p>
            <p className="text-xs text-muted mt-0.5">
              Ya no puedes empezar nuevos mocks. Renueva desde tu panel
              de facturación para continuar tu preparación.
            </p>
            <Link
              href="/alumno/facturacion"
              className="inline-block mt-2 text-xs text-navy hover:underline font-medium"
            >
              Renovar suscripción →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


/**
 * Toast de bienvenida — se muestra 1 vez cuando el trial acaba de
 * pasar a activo. Se renderiza en el dashboard vía cookie/localStorage.
 */
export function ActivationWelcomeToast() {
  return (
    <div className="rounded-lg border-2 border-ok/40 bg-ok/5 px-4 py-3 mb-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-ok flex-shrink-0" />
        <div>
          <p className="text-sm text-ink">
            <strong>¡Bienvenido a Acertlio Premium!</strong>
          </p>
          <p className="text-xs text-muted mt-0.5">
            Ya tienes acceso ilimitado a todos los simulacros de tu nivel.
          </p>
        </div>
      </div>
    </div>
  );
}
