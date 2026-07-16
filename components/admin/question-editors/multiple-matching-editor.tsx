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

interface MatchingOption {
  letter: string;
  text: string;
}

interface Props {
  questionId: string;
  questionNumber: number;
  stem: string;
  correctAnswer: string;
  matchingOptions: MatchingOption[]; // vienen del texto base de la parte
}

/**
 * Editor de Multiple Matching.
 * El stem = descripción de la persona/pregunta.
 * correct_answer = letra del texto que se empareja.
 * Los textos base (A-H para A2, A-D para C1 cross-text) se editan aparte,
 * en el bloque "Contenido base de la parte".
 */
export function MultipleMatchingEditor({
  questionId,
  questionNumber,
  stem,
  correctAnswer,
  matchingOptions,
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
            Multiple matching
          </span>
        </div>
        <DeleteQuestionButton questionId={questionId} />
      </header>

      <form action={formAction} className="p-4 space-y-4">
        <input type="hidden" name="questionId" value={questionId} />

        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            Descripción de persona / pregunta
          </label>
          <textarea
            name="stem"
            defaultValue={stem}
            rows={3}
            placeholder="Ej: Anna is a student. She has just moved into a small flat and needs cheap furniture. She does not have a car, so the shop must offer delivery."
            required
            className="w-full rounded border border-rule bg-white px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            Respuesta correcta (letra del texto)
          </label>
          {matchingOptions.length === 0 ? (
            <div className="rounded border border-saffron/30 bg-saffron/5 px-3 py-2 text-xs text-ink">
              <p>
                Aún no has definido los textos base (A, B, C, D...) en la parte.
                Añádelos arriba en{" "}
                <strong>&laquo;Contenido base de la parte&raquo;</strong>.
              </p>
            </div>
          ) : (
            <select
              name="correct_answer"
              defaultValue={correctAnswer}
              className="h-9 rounded border border-rule bg-white px-3 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              required
            >
              <option value="">— Selecciona —</option>
              {matchingOptions.map((opt) => (
                <option key={opt.letter} value={opt.letter}>
                  {opt.letter} —{" "}
                  {opt.text.length > 60
                    ? opt.text.slice(0, 60) + "…"
                    : opt.text}
                </option>
              ))}
            </select>
          )}
        </div>

        {state.error && <ErrorAlert message={state.error} />}
        {state.success && <SuccessAlert message={state.success} />}

        <SaveButton />
      </form>
    </div>
  );
}
