"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save, Trash2 } from "lucide-react";
import {
  updateQuestionAction,
  deleteQuestionAction,
  type EditorResult,
} from "@/app/admin/examenes/[id]/parte/[partId]/actions";

const initial: EditorResult = { error: null, success: null };

interface Option {
  letter: string;
  text: string;
  is_correct: boolean;
}

interface Props {
  questionId: string;
  questionNumber: number;
  stem: string;
  options: Option[];
  correctLetter: string;
  optionCount: 3 | 4; // A2 y algunos B1 usan 3, B2 y superiores usan 4
  isCloze?: boolean; // si viene de multiple_choice_cloze (no muestra el "stem" de forma prominente)
}

/**
 * Editor de una pregunta Multiple Choice.
 * Guarda: stem + opciones + cuál es la correcta.
 */
export function MultipleChoiceEditor({
  questionId,
  questionNumber,
  stem,
  options,
  correctLetter,
  optionCount,
  isCloze = false,
}: Props) {
  const [state, formAction] = useFormState(updateQuestionAction, initial);
  const letters = optionCount === 3 ? ["A", "B", "C"] : ["A", "B", "C", "D"];

  // Preparar valores iniciales de opciones
  const optionsByLetter = new Map(options.map((o) => [o.letter, o]));

  return (
    <div className="rounded border border-rule bg-white overflow-hidden">
      <header className="px-4 py-2.5 border-b border-rule bg-paper flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-navy font-medium">
            Q{questionNumber}
          </span>
          <span className="text-xs text-muted uppercase tracking-wider">
            {isCloze ? "MC cloze gap" : "Multiple choice"}
          </span>
        </div>
        <DeleteQuestionButton questionId={questionId} />
      </header>

      <form action={formAction} className="p-4 space-y-4">
        <input type="hidden" name="questionId" value={questionId} />

        {/* Enunciado (o "gap number" para cloze) */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            {isCloze ? "Nota interna (opcional)" : "Enunciado / pregunta"}
          </label>
          {isCloze ? (
            <input
              name="stem"
              type="text"
              defaultValue={stem}
              placeholder="Ej: gap sobre collocations"
              className="w-full h-9 rounded border border-rule bg-white px-3 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
          ) : (
            <textarea
              name="stem"
              defaultValue={stem}
              rows={2}
              placeholder="Ej: What does the writer suggest about..."
              required
              className="w-full rounded border border-rule bg-white px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
            />
          )}
        </div>

        {/* Opciones + selector radio */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted font-medium">
            Opciones · marca la correcta
          </label>
          {letters.map((letter) => {
            const existing = optionsByLetter.get(letter);
            return (
              <div key={letter} className="flex items-start gap-2">
                <label className="flex items-center gap-1.5 mt-2 shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name="correct_letter"
                    value={letter}
                    defaultChecked={correctLetter === letter}
                    className="cursor-pointer"
                  />
                  <span className="font-mono text-sm font-medium text-navy w-4">
                    {letter}
                  </span>
                </label>
                <input
                  name={`option_${letter}`}
                  type="text"
                  defaultValue={existing?.text ?? ""}
                  placeholder={`Texto de la opción ${letter}${letter === "D" && optionCount === 3 ? " (opcional en A2/B1)" : ""}`}
                  className="flex-1 h-9 rounded border border-rule bg-white px-3 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
              </div>
            );
          })}
        </div>

        {state.error && <ErrorAlert message={state.error} />}
        {state.success && <SuccessAlert message={state.success} />}

        <SaveButton />
      </form>
    </div>
  );
}

// ─── Botón guardar y auxiliares reutilizables ───────────────────────
export function SaveButton({ label = "Guardar pregunta" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 h-9 px-4 rounded bg-navy text-white text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Guardando…
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded border border-bad/30 bg-bad/5 px-3 py-2 text-xs text-bad">
      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export function SuccessAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded border border-ok/30 bg-ok/5 px-3 py-2 text-xs text-ok">
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// ─── Botón borrar pregunta con confirmación ─────────────────────────
export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [state, formAction] = useFormState(deleteQuestionAction, initial);
  const [confirming, setConfirming] = useState(false);

  if (state.success) return null;

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-muted hover:text-bad inline-flex items-center gap-1"
      >
        <Trash2 className="h-3 w-3" />
        Borrar
      </button>
    );
  }

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="questionId" value={questionId} />
      <span className="text-xs text-muted">¿Seguro?</span>
      <DeleteSubmitBtn />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-muted hover:text-ink"
      >
        cancelar
      </button>
    </form>
  );
}

function DeleteSubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-bad hover:underline disabled:opacity-50"
    >
      {pending ? "Borrando…" : "Sí, borrar"}
    </button>
  );
}
