"use client";

import { useEffect, useRef, useState } from "react";
import { X, StickyNote, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
}

const SAVE_DEBOUNCE_MS = 800;

export function NotesPanel({ open, initialContent, onClose, onSave }: Props) {
  const [content, setContent] = useState(initialContent);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef(initialContent);

  useEffect(() => {
    setContent(initialContent);
    lastSavedRef.current = initialContent;
  }, [initialContent]);

  // Autosave debounced
  useEffect(() => {
    if (content === lastSavedRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(content);
        lastSavedRef.current = content;
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 1500);
      } catch {
        // silencioso: se reintentará al siguiente cambio
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content, onSave]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-saffron" />
            <h2 className="text-base font-semibold text-ink">Mis notas</h2>
            {savedIndicator && (
              <span className="inline-flex items-center gap-1 text-xs text-ok ml-2">
                <CheckCircle2 className="h-3 w-3" />
                Guardado
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-paper border-b border-rule">
          <p className="text-xs text-muted leading-relaxed">
            Usa este panel para anotar palabras nuevas, ideas para el writing
            o cualquier cosa que quieras recordar. Se guarda automáticamente y
            está disponible cada vez que vuelvas a este paper.
          </p>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full resize-none px-6 py-5 text-sm text-ink leading-relaxed focus:outline-none font-mono"
          placeholder="Empieza a escribir tus notas aquí…"
          spellCheck={false}
        />

        <div className="px-6 py-3 border-t border-rule bg-paper flex items-center justify-between">
          <span className="text-xs text-muted">
            {content.length} caracteres · {content.trim().split(/\s+/).filter(Boolean).length} palabras
          </span>
          <button
            onClick={onClose}
            className="text-xs text-navy hover:text-ink font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </aside>
    </>
  );
}
