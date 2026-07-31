"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { retryAICorrectionAction } from "@/app/alumno/examenes/actions";

interface Props {
  examId: string;
  isIndividual: boolean;
}

/**
 * Botón visible en la pantalla de resultado cuando el Writing está
 * pendiente y el alumno es individual. Permite re-disparar manualmente
 * la corrección IA si la automática falló.
 *
 * Para alumnos de academia, no se muestra (el profesor corregirá).
 */
export function RetryAIButton({ examId, isIndividual }: Props) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  if (!isIndividual) return null;

  const handleClick = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await retryAICorrectionAction(examId);
      if (res.error) {
        setMsg(res.error);
      } else if (res.corrected && res.corrected > 0) {
        setMsg(
          `Corregidas ${res.corrected} tareas. Recargando…`
        );
        router.refresh();
      } else {
        setMsg("No había tareas pendientes que corregir.");
      }
    });
  };

  return (
    <div className="mt-4">
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
      {msg && (
        <p className="text-xs text-muted mt-2 max-w-md">{msg}</p>
      )}
    </div>
  );
}
