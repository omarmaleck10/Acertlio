"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import {
  releaseLicenseAction,
  type AcademyActionResult,
} from "@/app/academia/actions";

const initial: AcademyActionResult = { error: null, success: null };

interface Props {
  licenseId: string;
  studentName: string;
}

export function ReleaseLicenseButton({ licenseId, studentName }: Props) {
  const [state, formAction] = useFormState(releaseLicenseAction, initial);
  const [confirming, setConfirming] = useState(false);

  if (state.success) {
    return (
      <span className="text-xs text-ok inline-flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {state.success}
      </span>
    );
  }
  if (state.error) {
    return (
      <span className="text-xs text-bad inline-flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {state.error}
      </span>
    );
  }
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-muted hover:text-bad transition-colors"
      >
        Liberar
      </button>
    );
  }
  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="licenseId" value={licenseId} />
      <span className="text-xs text-muted">
        ¿Archivar a <strong className="text-ink">{studentName}</strong>?
      </span>
      <SubmitBtn />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-muted hover:text-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-bad hover:underline disabled:opacity-50 inline-flex items-center gap-1"
    >
      {pending ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Archivando…
        </>
      ) : (
        "Sí, liberar"
      )}
    </button>
  );
}
