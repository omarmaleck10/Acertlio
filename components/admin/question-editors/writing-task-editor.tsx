"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import {
  updateQuestionAction,
  type EditorResult,
} from "@/app/admin/examenes/[id]/parte/[partId]/actions";
import {
  DeleteQuestionButton,
  SaveButton,
  ErrorAlert,
  SuccessAlert,
} from "./multiple-choice-editor";

const initial: EditorResult = { error: null, success: null };

interface Props {
  questionId: string;
  questionNumber: number;
  stem: string;
  context: {
    task_type?: string; // "email" | "story" | "essay" | "letter" | "review" | "proposal"
    word_count_min?: number;
    word_count_max?: number;
    notes?: string[]; // para Part 6 email
    opening_sentence?: string; // para Part 7 story
    input_text?: string; // para essay (texto de referencia)
  };
}

/**
 * Editor de Writing Task.
 * Configurable según el tipo (email, story, essay, letter, review, proposal).
 * Los campos condicionales muestran solo lo relevante para cada tipo.
 */
export function WritingTaskEditor({
  questionId,
  questionNumber,
  stem,
  context,
}: Props) {
  const [state, formAction] = useFormState(updateQuestionAction, initial);
  const [taskType, setTaskType] = useState<string>(
    context.task_type ?? "email"
  );
  const [notes, setNotes] = useState<string[]>(
    context.notes && context.notes.length > 0 ? context.notes : [""]
  );

  const showNotes = taskType === "email";
  const showOpeningSentence = taskType === "story";
  const showInputText = taskType === "essay";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Construir el context JSON antes de enviar
    const form = e.currentTarget;
    const contextData: Record<string, unknown> = {
      task_type: taskType,
      word_count_min:
        parseInt(String(form.wc_min?.value ?? "0"), 10) || undefined,
      word_count_max:
        parseInt(String(form.wc_max?.value ?? "0"), 10) || undefined,
    };
    if (showNotes) {
      contextData.notes = notes.filter((n) => n.trim());
    }
    if (showOpeningSentence) {
      contextData.opening_sentence = form.opening_sentence?.value ?? "";
    }
    if (showInputText) {
      contextData.input_text = form.input_text?.value ?? "";
    }

    // Inyectar en un hidden input antes del submit
    const hidden = form.querySelector('input[name="context"]') as HTMLInputElement;
    if (hidden) hidden.value = JSON.stringify(contextData);
  };

  return (
    <div className="rounded border border-rule bg-white overflow-hidden">
      <header className="px-4 py-2.5 border-b border-rule bg-paper flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-navy font-medium">
            Q{questionNumber}
          </span>
          <span className="text-xs text-muted uppercase tracking-wider">
            Writing task
          </span>
        </div>
        <DeleteQuestionButton questionId={questionId} />
      </header>

      <form action={formAction} onSubmit={handleSubmit} className="p-4 space-y-4">
        <input type="hidden" name="questionId" value={questionId} />
        <input type="hidden" name="context" value="{}" />

        {/* Tipo de task */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
              Tipo de tarea
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="h-9 w-full rounded border border-rule bg-white px-3 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            >
              <option value="email">Email (guided)</option>
              <option value="story">Story</option>
              <option value="essay">Essay (Part 1)</option>
              <option value="letter">Letter</option>
              <option value="review">Review</option>
              <option value="proposal">Proposal</option>
              <option value="report">Report</option>
              <option value="article">Article</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
                Palabras mín.
              </label>
              <input
                name="wc_min"
                type="number"
                defaultValue={context.word_count_min ?? ""}
                placeholder="25"
                min={10}
                className="h-9 w-full rounded border border-rule bg-white px-3 text-sm font-mono focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
                Palabras máx.
              </label>
              <input
                name="wc_max"
                type="number"
                defaultValue={context.word_count_max ?? ""}
                placeholder="35"
                min={10}
                className="h-9 w-full rounded border border-rule bg-white px-3 text-sm font-mono focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              />
            </div>
          </div>
        </div>

        {/* Instrucciones (stem) */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
            Instrucciones / situación
          </label>
          <textarea
            name="stem"
            defaultValue={stem}
            rows={5}
            placeholder={
              taskType === "email"
                ? "Ej: Read the message from Alex and write an email using all the notes."
                : taskType === "story"
                ? "Ej: Your English teacher has asked you to write a story starting with the sentence below."
                : "Ej: Read the following text and write an essay discussing two of the points from your notes."
            }
            required
            className="w-full rounded border border-rule bg-white px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
          />
        </div>

        {/* Campo condicional: notas (email) */}
        {showNotes && (
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
              Notas (viñetas que el alumno debe cubrir)
            </label>
            <div className="space-y-2">
              {notes.map((note, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-5">•</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => {
                      const newNotes = [...notes];
                      newNotes[i] = e.target.value;
                      setNotes(newNotes);
                    }}
                    placeholder={`Nota ${i + 1}`}
                    className="flex-1 h-9 rounded border border-rule bg-white px-3 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                  {notes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setNotes(notes.filter((_, idx) => idx !== i))}
                      className="text-xs text-muted hover:text-bad"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNotes([...notes, ""])}
                className="text-xs text-navy hover:underline"
              >
                + añadir nota
              </button>
            </div>
          </div>
        )}

        {/* Campo condicional: frase inicial (story) */}
        {showOpeningSentence && (
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
              Frase inicial obligatoria
            </label>
            <input
              name="opening_sentence"
              type="text"
              defaultValue={context.opening_sentence ?? ""}
              placeholder='Ej: "When Sam opened the fridge, he was very surprised."'
              className="w-full h-9 rounded border border-rule bg-white px-3 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
          </div>
        )}

        {/* Campo condicional: input text (essay) */}
        {showInputText && (
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
              Texto de entrada (para essay Part 1)
            </label>
            <textarea
              name="input_text"
              defaultValue={context.input_text ?? ""}
              rows={4}
              placeholder="Ej: Cities across the world are looking for ways to reduce the number of private cars on their streets..."
              className="w-full rounded border border-rule bg-white px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
            />
          </div>
        )}

        {state.error && <ErrorAlert message={state.error} />}
        {state.success && <SuccessAlert message={state.success} />}

        <SaveButton />
      </form>
    </div>
  );
}
