"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  updatePartContextAction,
  type EditorResult,
} from "@/app/admin/examenes/[id]/parte/[partId]/actions";
import {
  SaveButton,
  ErrorAlert,
  SuccessAlert,
} from "./question-editors/multiple-choice-editor";
import { Plus, X } from "lucide-react";

const initial: EditorResult = { error: null, success: null };

interface MatchingOption {
  letter: string;
  text: string;
}

type Kind =
  | "reading_text" // Part 3 A2, Part 5 C1: texto largo
  | "cloze_base_text" // Part 4/5 A2, Part 1/2 C1: texto con gaps
  | "matching_options" // Part 2 A2, Part 8 C1: lista de A-H textos matcheables
  | "writing_only"; // Parts writing puras: no hay contenido base

interface Props {
  partId: string;
  kind: Kind;
  readingText: string;
  clozeBaseText: string;
  matchingOptions: MatchingOption[];
}

/**
 * Editor del contenido base de una parte.
 * Cambia según `kind` — así solo mostramos los campos relevantes.
 */
export function PartContextEditor({
  partId,
  kind,
  readingText,
  clozeBaseText,
  matchingOptions,
}: Props) {
  const [state, formAction] = useFormState(updatePartContextAction, initial);
  const [options, setOptions] = useState<MatchingOption[]>(
    matchingOptions.length > 0
      ? matchingOptions
      : [{ letter: "A", text: "" }, { letter: "B", text: "" }]
  );

  if (kind === "writing_only") {
    return (
      <div className="rounded border border-rule bg-white px-5 py-4 text-sm text-muted">
        Esta parte es solo de Writing: cada pregunta tiene sus propias
        instrucciones y no hay contenido base compartido.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Inyectar el JSON de matching_options si aplica
    if (kind === "matching_options") {
      const form = e.currentTarget;
      const hidden = form.querySelector(
        'input[name="matching_options"]'
      ) as HTMLInputElement;
      if (hidden) {
        hidden.value = JSON.stringify(options.filter((o) => o.text.trim()));
      }
    }
  };

  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length); // A, B, C, D...
    if (options.length >= 10) return;
    setOptions([...options, { letter: nextLetter, text: "" }]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    // Renumerar letras después de quitar
    const filtered = options.filter((_, i) => i !== idx);
    setOptions(
      filtered.map((o, i) => ({
        ...o,
        letter: String.fromCharCode(65 + i),
      }))
    );
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="partId" value={partId} />
      <input type="hidden" name="matching_options" value="" />

      {/* READING TEXT: texto largo para MC */}
      {kind === "reading_text" && (
        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            Texto de lectura
          </label>
          <p className="text-xs text-muted mb-2 leading-relaxed">
            El texto que los alumnos leerán. Puede ir en varios párrafos.
            Después, cada pregunta MC hará referencia a este texto.
          </p>
          <textarea
            name="reading_text"
            defaultValue={readingText}
            rows={16}
            placeholder="Pega aquí el texto de lectura completo…"
            className="w-full rounded border border-rule bg-white px-3 py-2 text-sm font-serif focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
          />
        </div>
      )}

      {/* CLOZE BASE TEXT: texto con gaps numerados */}
      {kind === "cloze_base_text" && (
        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            Texto con huecos
          </label>
          <p className="text-xs text-muted mb-2 leading-relaxed">
            Escribe el texto con los huecos marcados como <code className="px-1 rounded bg-paper">(1)</code>, <code className="px-1 rounded bg-paper">(2)</code>, etc.
            Después crea una pregunta por cada hueco.
          </p>
          <textarea
            name="base_text"
            defaultValue={clozeBaseText}
            rows={12}
            placeholder="Ej: In an age where every waking moment seems to (1) …… some form of measurable output…"
            className="w-full rounded border border-rule bg-white px-3 py-2 text-sm font-serif focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
          />
        </div>
      )}

      {/* MATCHING OPTIONS: lista de A-H textos matcheables */}
      {kind === "matching_options" && (
        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            Textos matcheables (A–H)
          </label>
          <p className="text-xs text-muted mb-3 leading-relaxed">
            Estos son los textos entre los que el alumno tiene que elegir para
            cada pregunta (ej: descripciones de tiendas, opiniones,
            reseñas). Añade uno por letra.
          </p>

          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={opt.letter} className="flex items-start gap-2">
                <span className="font-mono text-sm font-medium text-navy w-6 mt-2">
                  {opt.letter}
                </span>
                <textarea
                  value={opt.text}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[i] = { ...opt, text: e.target.value };
                    setOptions(newOpts);
                  }}
                  rows={3}
                  placeholder={`Texto de la opción ${opt.letter}`}
                  className="flex-1 rounded border border-rule bg-white px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-muted hover:text-bad mt-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 inline-flex items-center gap-1 text-xs text-navy hover:underline"
            >
              <Plus className="h-3 w-3" />
              Añadir opción {String.fromCharCode(65 + options.length)}
            </button>
          )}
        </div>
      )}

      {state.error && <ErrorAlert message={state.error} />}
      {state.success && <SuccessAlert message={state.success} />}

      <SaveButton label="Guardar contenido base" />
    </form>
  );
}
