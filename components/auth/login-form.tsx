"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { signInAction, type AuthActionResult } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: AuthActionResult = { error: null };

/**
 * Formulario de login funcional.
 * Llama a signInAction (Server Action) y muestra:
 *  - Spinner mientras procesa
 *  - Mensaje de error debajo del form si falla
 *  - Redirect automático al dashboard si va bien (lo hace la action)
 */
export function LoginForm() {
  const [state, formAction] = useFormState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@academia.com"
          autoComplete="email"
          required
          autoFocus
        />
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

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

/**
 * Botón submit que se deshabilita y muestra spinner mientras la action está pending.
 * useFormStatus() lee el estado del <form> padre — solo funciona dentro de un <form action={...}>.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Entrando…
        </>
      ) : (
        "Entrar"
      )}
    </Button>
  );
}
