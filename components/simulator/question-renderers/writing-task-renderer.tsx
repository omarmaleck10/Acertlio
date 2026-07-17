"use client";

import { useMemo } from "react";
import type { LoadedQuestion } from "@/lib/exams/loader";

interface Props {
  question: LoadedQuestion;
  currentValue: string;
  onChange: (value: string) => void;
}

interface WritingContext {
  task_type?: string;
  word_count_min?: number;
  word_count_max?: number;
  notes?: string[];
  opening_sentence?: string;
  input_text?: string;
}

/**
 * Renderer para Writing Task.
 * Muestra las instrucciones + input text (si aplica) + notas o frase inicial + textarea grande.
 * Contador de palabras en vivo con feedback visual del rango objetivo.
 */
export function WritingTaskRenderer({
  question,
  currentValue,
  onChange,
}: Props) {
  const ctx = (question.context as WritingContext) ?? {};
  const min = ctx.word_count_min ?? 0;
  const max = ctx.word_count_max ?? 0;

  const wordCount = useMemo(() => {
    return currentValue.trim().split(/\s+/).filter(Boolean).length;
  }, [currentValue]);

  const status: "empty" | "under" | "ok" | "over" = !currentValue.trim()
    ? "empty"
    : wordCount < min
    ? "under"
    : wordCount > max
    ? "over"
    : "ok";

  const statusColor =
    status === "ok"
      ? "text-ok"
      : status === "over"
      ? "text-bad"
      : status === "under"
      ? "text-saffron"
      : "text-muted";

  return (
    <div className="space-y-5">
      {/* Instrucciones */}
      <div className="rounded border-2 border-navy/20 bg-white px-5 py-4">
        <p className="sim-text whitespace-pre-wrap">
          {question.stem}
        </p>

        {/* Input text (para essay Part 1) */}
        {ctx.input_text && (
          <div className="mt-4 pt-4 border-t border-rule">
            <p className="text-xs uppercase tracking-wider text-muted mb-2 font-medium">
              Texto de entrada
            </p>
            <p className="sim-text whitespace-pre-wrap font-serif">
              {ctx.input_text}
            </p>
          </div>
        )}

        {/* Notas (email guiado) */}
        {ctx.notes && ctx.notes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-rule">
            <p className="text-xs uppercase tracking-wider text-muted mb-2 font-medium">
              Notas a incluir
            </p>
            <ul className="text-[14px] text-ink space-y-1">
              {ctx.notes.map((note, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-navy">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Frase inicial (story) */}
        {ctx.opening_sentence && (
          <div className="mt-4 pt-4 border-t border-rule">
            <p className="text-xs uppercase tracking-wider text-muted mb-2 font-medium">
              Frase inicial obligatoria
            </p>
            <p className="text-[14px] text-ink font-serif italic">
              &ldquo;{ctx.opening_sentence}&rdquo;
            </p>
          </div>
        )}

        {/* Rango de palabras */}
        {(min || max) && (
          <div className="mt-4 pt-4 border-t border-rule text-xs text-muted">
            Escribe entre <strong className="text-ink">{min}</strong> y{" "}
            <strong className="text-ink">{max}</strong> palabras.
          </div>
        )}
      </div>

      {/* Textarea */}
      <div>
        <textarea
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          placeholder="Escribe aquí tu respuesta…"
          className="w-full rounded border-2 border-rule bg-white px-4 py-3 sim-text font-serif focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={`font-mono font-semibold ${statusColor}`}>
            {wordCount} palabra{wordCount === 1 ? "" : "s"}
            {min && max && ` · rango ${min}–${max}`}
          </span>
          {status === "over" && (
            <span className="text-bad">Has superado el máximo</span>
          )}
          {status === "under" && (
            <span className="text-saffron">Aún por debajo del mínimo</span>
          )}
          {status === "ok" && (
            <span className="text-ok">Dentro del rango</span>
          )}
        </div>
      </div>
    </div>
  );
}
