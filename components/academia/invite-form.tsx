"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import {
  inviteTeacherAction,
  inviteStudentAction,
  type InviteResult,
} from "@/app/academia/invitations-actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: InviteResult = { error: null, success: null };

interface Props {
  kind: "teacher" | "student";
}

export function InviteForm({ kind }: Props) {
  const action = kind === "teacher" ? inviteTeacherAction : inviteStudentAction;
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="invite-email">
          Email {kind === "teacher" ? "del profesor" : "del alumno"}
        </Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          placeholder={
            kind === "teacher" ? "profesor@academia.com" : "alumno@email.com"
          }
          required
        />
      </div>

      {kind === "student" && (
        <div>
          <Label htmlFor="invite-level">Nivel Cambridge (opcional)</Label>
          <select
            id="invite-level"
            name="level"
            className="h-10 w-full rounded border border-rule bg-white px-3 text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          >
            <option value="">Sin asignar</option>
            <option value="B1">B1 Preliminary</option>
            <option value="B2">B2 First</option>
            <option value="C1">C1 Advanced</option>
          </select>
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded border border-bad/30 bg-bad/5 px-3 py-2.5 text-sm text-bad"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded border border-ok/30 bg-ok/5 px-3 py-2.5 text-sm text-ok"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.success}</span>
        </div>
      )}

      <SubmitButton kind={kind} />
    </form>
  );
}

function SubmitButton({ kind }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enviando…
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Enviar invitación a {kind === "teacher" ? "profesor" : "alumno"}
        </>
      )}
    </Button>
  );
}
