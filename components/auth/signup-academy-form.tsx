"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  signUpAcademyAction,
  type SignUpAcademyResult,
} from "@/app/empezar/academia/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: SignUpAcademyResult = { error: null };

const PLAN_INFO: Record<string, { name: string; seats: number; price: string }> = {
  starter: { name: "Starter", seats: 20, price: "39 €/mes" },
  pro: { name: "Pro", seats: 50, price: "79 €/mes" },
  business: { name: "Business", seats: 100, price: "139 €/mes" },
};

interface Props {
  plan: "starter" | "pro" | "business";
}

export function SignUpAcademyForm({ plan }: Props) {
  const [state, formAction] = useFormState(signUpAcademyAction, initial);
  const info = PLAN_INFO[plan];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Plan seleccionado (hidden field + resumen visual) */}
      <input type="hidden" name="plan" value={plan} />

      <div className="rounded border border-navy/15 bg-navy-50 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-navy font-medium">
            Plan seleccionado
          </p>
          <p className="text-lg font-semibold text-ink mt-0.5">{info.name}</p>
          <p className="text-xs text-muted mt-0.5">
            {info.seats} plazas · {info.price} · Sin permanencia
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="academyName">Nombre de la academia</Label>
        <Input
          id="academyName"
          name="academyName"
          type="text"
          placeholder="Ej. English Studio Madrid"
          required
          minLength={3}
        />
      </div>

      <div>
        <Label htmlFor="cif">CIF (opcional)</Label>
        <Input id="cif" name="cif" type="text" placeholder="B12345678" />
        <p className="text-xs text-muted mt-1">
          Puedes rellenarlo después desde Configuración.
        </p>
      </div>

      <div className="pt-4 border-t border-rule">
        <p className="text-sm font-medium text-ink mb-3">Tú, como administrador</p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="adminName">Tu nombre</Label>
            <Input
              id="adminName"
              name="adminName"
              type="text"
              placeholder="Nombre y apellidos"
              required
              minLength={3}
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@academia.com"
              required
              autoComplete="email"
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
        </div>
      </div>

      <div className="pt-2">
        <label className="flex items-start gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="acceptTerms"
            className="mt-0.5 shrink-0"
            required
          />
          <span className="text-muted">
            He leído y acepto los{" "}
            <a href="/legal/aviso" className="text-navy hover:underline" target="_blank">
              términos de uso
            </a>{" "}
            y la{" "}
            <a
              href="/legal/privacidad"
              className="text-navy hover:underline"
              target="_blank"
            >
              política de privacidad
            </a>
            .
          </span>
        </label>
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

      <p className="text-xs text-muted text-center">
        Sin tarjeta de crédito. Facturamos cuando os apuntéis al primer ciclo.
      </p>
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
          Creando cuenta…
        </>
      ) : (
        "Crear cuenta"
      )}
    </Button>
  );
}
