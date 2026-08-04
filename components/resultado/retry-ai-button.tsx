"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { retryAICorrectionAction } from "@/app/alumno/examenes/actions";

interface Props {
  examId: string;
  isIndividual: boolean;
}

interface RetryResult {
  corrected?: number;
  errors?: number;
  lastError?: string;
  error?: string;
}

/**
 * Botón visible en la pantalla de resultado cuando el Writing está
 * pendiente y el alumno es individual. Permite re-disparar manualmente
 * la corrección IA si la automática falló.
 *
 * Para alumnos de academia, no se muestra (el profesor corregirá).
 *
 * Si algo falla, muestra el error real (no un mensaje genérico) para
 * poder diagnosticar sin bucear en logs de Vercel.
 */
export function RetryAIButton({ examId, isIndividual }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RetryResult | null>(null);
  const router = useRouter();

  if (!isIndividual) return null;

  const handleClick = () => {
    setResult(null);
    startTransition(async () => {
      const res = await retryAICorrectionAction(examId);
      setResult(res);
      if (res.corrected && res.corrected > 0 && (!res.errors || res.errors === 0)) {
        // Solo refrescar si TODO fue bien
        setTimeout(() => router.refresh(), 800);
      }
    });
  };

  const hasErrors = Boolean(
    result?.error || (result?.errors && result.errors > 0) || result?.lastError
  );

  return (
    <div className="mt-4 space-y-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded border border-saffron/40 bg-white px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/5 disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Lanzando corrección…
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Corregir ahora con IA
          </>
        )}
      </button>

      {result && !hasErrors && (
        <p className="text-xs text-ok max-w-md">
          {result.corrected && result.corrected > 0
            ? `Corregidas ${result.corrected} tareas. Recargando…`
            : "No había tareas pendientes que corregir."}
        </p>
      )}

      {result && hasErrors && (
        <div className="rounded border border-error/40 bg-error/5 p-3 max-w-2xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 text-xs space-y-1">
              <p className="font-semibold text-error">
                La corrección falló
              </p>
              {result.error && (
                <p className="text-ink">{result.error}</p>
              )}
              {result.corrected != null && result.errors != null && (
                <p className="text-muted font-mono">
                  Corregidas: <strong>{result.corrected}</strong> · Errores:{" "}
                  <strong className="text-error">{result.errors}</strong>
                </p>
              )}
              {result.lastError && (
                <div>
                  <p className="text-ink font-semibold mt-2">Último error:</p>
                  <pre className="mt-1 bg-white border border-rule rounded p-2 text-[10px] overflow-auto whitespace-pre-wrap break-words max-h-32">
                    {result.lastError}
                  </pre>
                </div>
              )}
              <p className="text-muted italic mt-2 leading-relaxed">
                Si el error dice{" "}
                <code className="bg-white px-1 rounded">
                  null value in column &quot;academy_id&quot;
                </code>
                , necesitas ejecutar la migración SQL 035 en Supabase para
                hacer nullable esa columna.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
