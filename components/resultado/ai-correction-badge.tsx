"use client";

import { useState } from "react";
import { Sparkles, X, Info } from "lucide-react";

/**
 * Badge "Corregido por IA" + enlace "¿Qué significa esto?" que
 * abre modal explicativo transparente.
 *
 * Se usa en la vista de resultado del Writing.
 */
export function AICorrectionBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-navy/10 text-navy">
          <Sparkles className="h-3 w-3" />
          Corrección automática por IA
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-navy hover:underline inline-flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          ¿Qué significa esto?
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-navy" />
                </div>
                <h2 className="text-lg font-semibold text-ink">
                  Sobre esta corrección
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4 text-sm text-ink leading-relaxed">
              <p>
                Tu Writing ha sido evaluado por una <strong>IA especializada
                en corrección Cambridge</strong> (Claude, de Anthropic), no
                por un profesor humano.
              </p>

              <div>
                <p className="font-semibold text-ink mb-1.5">
                  ¿Qué hace la IA exactamente?
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted">
                  <li>
                    Aplica las <strong>4 rúbricas oficiales Cambridge</strong>{" "}
                    (Content, Communicative Achievement, Organisation, Language),
                    puntuando cada una de 0 a 5.
                  </li>
                  <li>
                    Escribe un comentario global sobre tu texto.
                  </li>
                  <li>
                    Genera 3-5 sugerencias concretas para mejorar.
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-ink mb-1.5">
                  ¿Es fiable?
                </p>
                <p className="text-muted">
                  La IA está calibrada con criterios oficiales y suele coincidir
                  muy de cerca con el juicio de un examinador humano. Pero{" "}
                  <strong>no reemplaza a un profesor</strong>: es una guía
                  rápida para que sigas practicando sin esperar.
                </p>
              </div>

              <div>
                <p className="font-semibold text-ink mb-1.5">
                  ¿Puedo pedir una revisión humana?
                </p>
                <p className="text-muted">
                  Si un profesor de Acertlio revisa tu Writing después, su
                  corrección sustituirá a la de la IA.
                </p>
              </div>

              <div className="rounded border border-rule bg-paper p-3">
                <p className="text-xs text-muted">
                  <strong className="text-ink">Transparencia:</strong> registramos
                  cada corrección de IA con su modelo, coste y tiempo de
                  proceso. Nunca lo escondemos.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-rule flex justify-end bg-paper">
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-navy hover:underline"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
