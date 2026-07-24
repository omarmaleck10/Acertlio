"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ExternalLink, Loader2, AlertCircle } from "lucide-react";
import {
  openBillingPortalAction,
  type CheckoutResult,
} from "@/app/checkout/actions";

const initial: CheckoutResult = { error: null };

/**
 * Botón que abre el Stripe Customer Portal para gestionar suscripción.
 */
export function BillingPortalButton() {
  const [state, formAction] = useFormState(openBillingPortalAction, initial);

  return (
    <>
      <form action={formAction}>
        <PortalBtn />
      </form>
      {state.error && (
        <div className="mt-2 flex items-start gap-2 rounded border border-bad/30 bg-bad/5 px-3 py-2 text-xs text-bad">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}
    </>
  );
}

function PortalBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 h-11 px-5 rounded bg-navy text-white text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Abriendo portal…
        </>
      ) : (
        <>
          <ExternalLink className="h-4 w-4" />
          Gestionar suscripción
        </>
      )}
    </button>
  );
}
