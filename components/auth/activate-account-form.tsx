"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  activateAccountAction,
  type ActivateResult,
} from "@/app/activar/[token]/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: ActivateResult = { error: null };

interface Props {
  token: string;
  email: string;
  role: "academy_admin" | "teacher" | "student";
  academyName: string;
}

const ROLE_LABEL: Record<Props["role"], string> = {
  academy_admin: "Administrador de academia",
  teacher: "Profesor",
  student: "Alumno",
};

export function ActivateAccountForm({ token, email, role, academyName }: Props) {
  const [state, formAction] = useFormState(activateAccountAction, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />

      <div className="rounded border border-navy/15 bg-navy-50 p-4">
        <p className="text-xs uppercase tracking-wider text-navy font-medium">
          Invitación válida
        </p>
        <p className="text-sm text-ink mt-1.5">
          Vas a unirte a <strong>{academyName}</strong> como{" "}
          <strong>{ROLE_LABEL[role]}</strong>.
        </p>
        <p className="text-xs text-muted mt-1 font-mono">{email}</p>
      </div>

      <div>
        <Label htmlFor="fullName">Tu nombre</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Nombre y apellidos"
          required
          minLength={3}
          autoComplete="name"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div>
          <Label htmlFor="passwordConfirm">Confirmar</Label>
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        Mínimo 8 caracteres. Recomendamos usar un gestor de contraseñas.
      </p>

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded border border-bad/30 bg-bad/5 px-3 py-2.5 text-sm text-bad"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Activando cuenta…
        </>
      ) : (
        "Crear cuenta y entrar"
      )}
    </Button>
  );
}
