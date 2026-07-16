"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import {
  createQuestionAction,
  type EditorResult,
} from "@/app/admin/examenes/[id]/parte/[partId]/actions";
import type { QuestionType } from "@/lib/supabase/types";

const initial: EditorResult = { error: null, success: null };

interface Props {
  partId: string;
  questionType: QuestionType;
  currentCount: number;
  expectedCount?: number;
}

export function AddQuestionButton({
  partId,
  questionType,
  currentCount,
  expectedCount,
}: Props) {
  const [state, formAction] = useFormState(createQuestionAction, initial);
  const isComplete = expectedCount && currentCount >= expectedCount;

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input type="hidden" name="partId" value={partId} />
        <input type="hidden" name="question_type" value={questionType} />
        <SubmitBtn isComplete={!!isComplete} />
      </form>

      {state.error && (
        <div className="flex items-start gap-2 text-xs text-bad">
          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {expectedCount && (
        <p className="text-xs text-muted text-center">
          {currentCount} de {expectedCount} preguntas
          {isComplete && " · completo"}
        </p>
      )}
    </div>
  );
}

function SubmitBtn({ isComplete }: { isComplete: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded border-2 border-dashed text-sm font-medium disabled:opacity-50 transition-colors ${
        isComplete
          ? "border-ok/30 bg-ok/5 text-ok hover:bg-ok/10"
          : "border-navy/30 bg-navy-50/40 text-navy hover:bg-navy-50"
      }`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Añadiendo…
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          Añadir pregunta
          {isComplete && " (ya está completo)"}
        </>
      )}
    </button>
  );
}
