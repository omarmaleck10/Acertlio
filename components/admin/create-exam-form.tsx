"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { createExamAction, type ExamActionResult } from "@/app/admin/examenes/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { EXAM_FORMATS, LEVEL_LABELS, SKILL_LABELS, QUESTION_TYPE_LABELS } from "@/lib/exams/formats";
import type { CambridgeLevel } from "@/lib/supabase/types";

const initial: ExamActionResult = { error: null, success: null };
const LEVELS: CambridgeLevel[] = ["A2", "B1", "B2", "C1", "C2"];

export function CreateExamForm() {
  const [state, formAction] = useFormState(createExamAction, initial);
  const [level, setLevel] = useState<CambridgeLevel>("B2");
  const [generate, setGenerate] = useState(true);

  const format = EXAM_FORMATS[level];

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div>
        <Label htmlFor="title">Título del examen</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Ej. B2 First Mock 01"
          required
          minLength={3}
        />
        <p className="text-xs text-muted mt-1">
          El nombre que verán las academias en su catálogo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="level">Nivel Cambridge</Label>
          <select
            id="level"
            name="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as CambridgeLevel)}
            className="h-10 w-full rounded border border-rule bg-white px-3 text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          >
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {LEVEL_LABELS[lv]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="mockNumber">Nº de mock (opcional)</Label>
          <Input
            id="mockNumber"
            name="mockNumber"
            type="number"
            placeholder="Ej. 1"
            min={1}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Notas sobre este mock: temática, dificultad, si es de calentamiento..."
          className="w-full rounded border border-rule bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
        />
      </div>

      {/* Preview del formato del nivel */}
      <div className="rounded border border-rule bg-paper p-4">
        <p className="text-xs uppercase tracking-wider text-muted mb-3">
          Formato oficial · {format.levelName}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <span className="text-muted">Reading & UoE + Writing:</span>
          <span className="text-ink font-medium">{format.totalTimeMinutes} min</span>
          <span className="text-muted">Partes totales:</span>
          <span className="text-ink font-medium">{format.parts.length}</span>
          <span className="text-muted">Preguntas totales:</span>
          <span className="text-ink font-medium">
            {format.parts.reduce((sum, p) => sum + p.questionCount, 0)}
          </span>
        </div>

        {/* Tabla resumen de partes */}
        <details className="mt-3">
          <summary className="text-xs text-navy cursor-pointer hover:underline">
            Ver detalle de {format.parts.length} partes
          </summary>
          <ul className="mt-3 space-y-1.5">
            {format.parts.map((p, i) => (
              <li key={i} className="text-xs text-muted flex items-baseline gap-2">
                <span className="font-mono w-8 text-navy">P{p.partNumber}</span>
                <span className="w-24 text-ink capitalize">{SKILL_LABELS[p.skill]}</span>
                <span className="flex-1">{QUESTION_TYPE_LABELS[p.questionType]} · {p.questionCount} preg.</span>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className="rounded border border-navy/15 bg-navy-50 p-4">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="generateStructure"
            checked={generate}
            onChange={(e) => setGenerate(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          <div>
            <span className="text-sm text-ink font-medium">
              Generar estructura automáticamente
            </span>
            <p className="text-xs text-muted mt-1">
              Se crearán las {format.parts.length} partes vacías con los tipos de
              pregunta y focos correctos. Solo tendrás que meter el contenido de
              cada pregunta después. Recomendado.
            </p>
          </div>
        </label>
      </div>

      {state.error && (
        <div role="alert" className="flex items-start gap-2 rounded border border-bad/30 bg-bad/5 px-3 py-2.5 text-sm text-bad">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <SubmitBtn />
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creando examen…
        </>
      ) : (
        "Crear examen"
      )}
    </Button>
  );
}
