"use client";

import { useState, useTransition } from "react";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { releaseLicenseAction } from "@/app/academia/licencias/actions";

interface Props {
  licenseId: string;
  studentName: string;
}

/**
 * Botón "Liberar" para una licencia asignada.
 * Muestra confirmación antes de liberar porque es una acción irreversible
 * (el alumno queda archivado).
 */
export function ReleaseLicenseButton({ licenseId, studentName }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRelease = () => {
    startTransition(async () => {
      const result = await releaseLicenseAction(licenseId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-muted hover:text-bad px-2.5 py-1 rounded hover:bg-bad/5 transition-colors"
      >
        Liberar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-bad flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        ¿Archivar a {studentName}?
      </span>
      <button
        onClick={handleRelease}
        disabled={isPending}
        className="text-xs text-white bg-bad px-2.5 py-1 rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        Sí, liberar
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="text-xs text-muted px-1"
      >
        <X className="h-3 w-3" />
      </button>
      {error && (
        <span className="text-xs text-bad ml-2">{error}</span>
      )}
    </div>
  );
}
