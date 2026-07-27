"use client";

import { X, XCircle, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

interface Props {
  open: boolean;
  onClose: () => void;
  daysLeftInTrial: number | null;
}

/**
 * Modal que aparece cuando un alumno individual en trial intenta empezar
 * un 4º mock distinto (ya usó sus 3 mocks de prueba).
 *
 * Le da 2 opciones:
 *   1. Actualizar ahora → portal Stripe (facturación)
 *   2. Esperar al día 8 (se activa automáticamente)
 */
export function TrialCapModal({ open, onClose, daysLeftInTrial }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-rule">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-saffron/15 flex items-center justify-center flex-shrink-0">
              <XCircle className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-saffron font-semibold">
                Trial capped
              </p>
              <h2 className="text-lg font-semibold text-ink mt-0.5">
                Has usado tus 3 mocks de prueba
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-ink leading-relaxed">
            Durante los 7 días de prueba puedes hacer hasta 3 simulacros
            distintos. Ya los has usado todos.
          </p>

          <p className="text-sm text-ink leading-relaxed">
            <strong>Tienes 2 opciones para seguir practicando:</strong>
          </p>

          {/* Opción 1: Actualizar */}
          <Link
            href="/alumno/facturacion"
            className="block rounded-lg border-2 border-navy bg-navy/5 hover:bg-navy/10 p-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink flex items-center gap-2">
                  Actualizar ahora
                </p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Activa tu suscripción hoy mismo y desbloquea acceso
                  ilimitado inmediatamente. Se te cobrará el primer pago
                  al activar.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-navy flex-shrink-0 mt-1" />
            </div>
          </Link>

          {/* Opción 2: Esperar */}
          <div className="rounded-lg border border-rule bg-white p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">
                  Esperar al día 8
                </p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {daysLeftInTrial !== null && daysLeftInTrial > 0 ? (
                    <>
                      En <strong>{daysLeftInTrial} días</strong> tu suscripción
                      se activará automáticamente y podrás empezar mocks
                      ilimitadamente. No tienes que hacer nada.
                    </>
                  ) : (
                    "Tu suscripción se activará automáticamente el día 8 de tu trial y podrás empezar mocks ilimitadamente."
                  )}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted italic leading-relaxed pt-2">
            Nota: mientras esperas puedes seguir revisando los 3 mocks que
            ya empezaste, ver tus notas y respuestas.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-rule flex justify-end">
          <button
            onClick={onClose}
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
