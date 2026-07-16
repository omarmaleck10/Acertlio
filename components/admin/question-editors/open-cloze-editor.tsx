"use client";

import { useFormState } from "react-dom";
import {
  updateQuestionAction,
  type EditorResult,
} from "@/app/admin/examenes/[id]/parte/[partId]/actions";
import {
  DeleteQuestionButton,
  SaveButton,
  ErrorAlert,
  SuccessAlert,
} from "./multiple-choice-editor";

const initial: EditorResult = { error: null, success: null };

interface Props {
  questionId: string;
  questionNumber: number;
  stem: string;
  correctAnswer: string;
}

/**
 * Editor de Open Cloze o Word Formation.
 * Cada pregunta es un gap del texto base (guardado en exam_parts.settings.base_text).
 * Respuesta correcta: una palabra o varias variantes separadas por "|" (ej: "will|can|could")
 */
export function OpenClozeEditor({
  questionId,
  questionNumber,
  stem,
  correctAnswer,
}: Props) {
  const [state, formAction] = useFormState(updateQuestionAction, initial);

  return (
    <div className="rounded border border-rule bg-white overflow-hidden">
      <header className="px-4 py-2.5 border-b border-rule bg-paper flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-navy font-medium">
            Q{questionNumber}
          </span>
          <span className="text-xs text-muted uppercase tracking-wider">
            Open cloze / gap
          </span>
        </div>
        <DeleteQuestionButton questionId={questionId} />
      </header>

      <form action={formAction} className="p-4 space-y-4">
        <input type="hidden" name="questionId" value={questionId} />

        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            Nota interna (opcional)
          </label>
          <input
            name="stem"
            type="text"
            defaultValue={stem}
            placeholder="Ej: gap 9 — pointed out"
            className="w-full h-9 rounded border border-rule bg-white px-3 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            Respuesta(s) correcta(s)
          </label>
          <input
            name="correct_answer"
            type="text"
            defaultValue={correctAnswer}
            placeholder="Ej: out"
            required
            className="w-full h-9 rounded border border-rule bg-white px-3 text-sm font-mono focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          <p className="text-xs text-muted mt-1">
            Si aceptas varias respuestas equivalentes, sepáralas con{" "}
            <code className="px-1 rounded bg-paper">|</code>. Ej:{" "}
            <code className="px-1 rounded bg-paper">will|can|could</code>
          </p>
        </div>

        {state.error && <ErrorAlert message={state.error} />}
        {state.success && <SuccessAlert message={state.success} />}

        <SaveButton />
      </form>
    </div>
  );
}
