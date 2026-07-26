"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { PaperWithStatus } from "@/lib/papers/status";

interface Props {
  paper: PaperWithStatus | null;
  onClose: () => void;
  onStart: (paperCode: string) => Promise<void>;
}

/**
 * Renderiza markdown MUY simple (headers, negrita, listas, párrafos).
 * No es un parser real, solo lo justo para las instrucciones de nuestros papers.
 */
function renderInstructions(md: string): { key: number; el: JSX.Element }[] {
  const lines = md.split("\n");
  const out: { key: number; el: JSX.Element }[] = [];
  let key = 0;
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      out.push({
        key: key++,
        el: (
          <ul key={key} className="list-disc pl-5 space-y-1.5 my-3 text-ink">
            {listBuffer.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        ),
      });
      listBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      out.push({
        key: key++,
        el: (
          <h2
            key={key}
            className="text-xl font-semibold text-ink mt-6 mb-3 first:mt-0"
          >
            {line.slice(3)}
          </h2>
        ),
      });
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
    } else {
      flushList();
      out.push({
        key: key++,
        el: (
          <p
            key={key}
            className="text-sm text-ink leading-relaxed my-3 first:mt-0"
          >
            {renderInline(line)}
          </p>
        ),
      });
    }
  }
  flushList();
  return out;
}

function renderInline(text: string): (string | JSX.Element)[] {
  // Solo procesamos **negrita**
  const parts: (string | JSX.Element)[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <strong key={idx++} className="font-semibold text-ink">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}


export function PaperInstructionsModal({ paper, onClose, onStart }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset cada vez que se abre con un paper distinto
  useEffect(() => {
    if (paper) {
      setConfirmed(false);
      setLoading(false);
      setError(null);
    }
  }, [paper?.id]);

  // Cerrar con ESC
  useEffect(() => {
    if (!paper) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [paper, loading, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (paper) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [paper]);

  if (!paper) return null;

  const handleStartClick = async () => {
    if (!confirmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onStart(paper.code);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error inesperado";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <div>
            <p className="text-xs uppercase tracking-wider text-saffron font-medium">
              Instrucciones
            </p>
            <h2 className="text-lg font-semibold text-ink mt-0.5">
              {paper.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-muted hover:text-ink transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {paper.instructions ? (
            renderInstructions(paper.instructions).map(({ key, el }) => (
              <div key={key}>{el}</div>
            ))
          ) : (
            <p className="text-sm text-muted italic">
              No hay instrucciones específicas para este paper.
            </p>
          )}
        </div>

        {/* Footer con confirm + start */}
        <div className="border-t border-rule px-6 py-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 rounded border-rule text-navy focus:ring-navy cursor-pointer"
            />
            <span className="text-sm text-ink select-none">
              He leído las instrucciones y estoy listo para empezar.
            </span>
          </label>

          {error && (
            <div className="rounded bg-error/10 border border-error/30 px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-muted hover:text-ink transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleStartClick}
              disabled={!confirmed || loading}
              className="inline-flex items-center gap-2 rounded bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando…
                </>
              ) : (
                <>Start →</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
