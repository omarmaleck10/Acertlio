"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  updateAcademyAction,
  type UpdateAcademyResult,
} from "@/app/academia/configuracion/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initial: UpdateAcademyResult = { error: null, success: null };

interface Props {
  academy: {
    name: string;
    cif: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
  };
}

export function AcademyConfigForm({ academy }: Props) {
  const [state, formAction] = useFormState(updateAcademyAction, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="name">Nombre de la academia</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={academy.name}
          required
          minLength={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cif">CIF</Label>
          <Input
            id="cif"
            name="cif"
            type="text"
            defaultValue={academy.cif ?? ""}
            placeholder="B12345678"
          />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={academy.phone ?? ""}
            placeholder="+34 900 000 000"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          type="text"
          defaultValue={academy.address ?? ""}
          placeholder="C/ Ejemplo, 42, 2º A"
        />
      </div>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Input
          id="city"
          name="city"
          type="text"
          defaultValue={academy.city ?? ""}
          placeholder="Madrid"
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

      {state.success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded border border-ok/30 bg-ok/5 px-3 py-2.5 text-sm text-ok"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.success}</span>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Guardando…
        </>
      ) : (
        "Guardar cambios"
      )}
    </Button>
  );
}
