"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Play, AlertCircle } from "lucide-react";
import { startAttemptAction } from "@/app/alumno/examen/actions";

const initial = { error: null as string | null };

interface Props {
  examId: string;
}

export function StartExamButton({ examId }: Props) {
  const [state, formAction] = useFormState(startAttemptAction, initial);

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="examId" value={examId} />
        <StartBtn />
      </form>
      {state.error && (
        <div className="mt-3 inline-flex items-start gap-2 text-sm text-bad">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}
    </>
  );
}

function StartBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 h-12 px-8 rounded bg-navy text-white font-medium hover:bg-navy-600 disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Preparando…
        </>
      ) : (
        <>
          <Play className="h-5 w-5" />
          Empezar ahora
        </>
      )}
    </button>
  );
}
