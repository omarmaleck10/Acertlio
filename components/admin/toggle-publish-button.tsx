"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import {
  toggleExamPublishAction,
  type ExamActionResult,
} from "@/app/admin/examenes/actions";

const initial: ExamActionResult = { error: null, success: null };

interface Props {
  examId: string;
  isPublished: boolean;
}

export function TogglePublishButton({ examId, isPublished }: Props) {
  const [state, formAction] = useFormState(toggleExamPublishAction, initial);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input type="hidden" name="examId" value={examId} />
        <SubmitBtn isPublished={isPublished} />
      </form>

      {state.error && (
        <div className="flex items-start gap-2 text-xs text-bad">
          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}
      {state.success && (
        <div className="flex items-start gap-2 text-xs text-ok">
          <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{state.success}</span>
        </div>
      )}
    </div>
  );
}

function SubmitBtn({ isPublished }: { isPublished: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center gap-2 h-9 px-4 rounded text-sm font-medium disabled:opacity-50 ${
        isPublished
          ? "border border-rule text-ink hover:bg-paper"
          : "bg-navy text-white hover:bg-navy-600"
      }`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {isPublished ? "Despublicando…" : "Publicando…"}
        </>
      ) : isPublished ? (
        <>
          <EyeOff className="h-4 w-4" />
          Despublicar
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          Publicar
        </>
      )}
    </button>
  );
}
