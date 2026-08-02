"use client";

import { useState, useEffect } from "react";
import { Bookmark, AlertCircle, CheckCircle2 } from "lucide-react";
import type { SimQuestion } from "@/lib/exam/loader";

interface Props {
  question: SimQuestion;
  answerText: string;
  isBookmarked: boolean;
  onChange: (text: string) => void;
  onToggleBookmark: () => void;
}

// Tipos flexibles para las opciones de choice (Part 2 con A/B/C)
interface ChoiceOption {
  letter?: string;
  code?: string;
  type?: string;
  title?: string;
  prompt?: string;
  opening_sentence?: string;
  points?: string[];
}

/**
 * Renderizador Writing Task universal (soporta A2, B1, B2, C1, C2).
 *
 * Detecta el formato según los campos presentes en `question.context`:
 *
 * A) FORMATO B1 (writing_task con notes):
 *    - task_instruction / stem
 *    - notes: string[] (puntos que debe cubrir)
 *    - choice_options: [{ code, type, title, opening_sentence, points }]
 *
 * B) FORMATO B2 con essay + notes (essay obligatorio):
 *    - essay_question (pregunta central)
 *    - essay_notes: [{ label, text }] (áreas a discutir)
 *    - opinions: [{ label, text }] (opiniones de la conferencia)
 *
 * C) FORMATO C1 con essay obligatorio:
 *    - Igual que B pero con nombres iguales
 *
 * D) FORMATO C2 con summary + comparison (2 textos):
 *    - source_texts: [{ title, text }] (2 textos a resumir/comparar)
 *    - essay_question (pregunta que orienta)
 *
 * E) FORMATO Part 2 con choices (A/B/C):
 *    - choices: [{ letter: "A", type: "letter", title, prompt }]
 *    - choice_required: true
 *
 * El texto guardado incluye un prefijo [A] o [B] cuando hay choice,
 * para que la IA/profesor sepa qué eligió el alumno.
 *
 * Formato guardado:
 *   Sin choice: solo el texto tal cual
 *   Con choice: "[A]\n\n[texto]" o "[B]\n\n[texto]"
 */
export function QuestionWriting({
  question,
  answerText,
  isBookmarked,
  onChange,
  onToggleBookmark,
}: Props) {
  const ctx =
    (question.context as Record<string, unknown> | null | undefined) ?? {};

  // ─── Instrucción principal ─────────────────────────────
  const taskInstruction =
    (ctx.task_instruction as string | undefined) ??
    (ctx.instruction as string | undefined) ??
    "";

  // ─── Word counts ───────────────────────────────────────
  const wordMin = (ctx.word_count_min as number | undefined) ?? 100;
  const wordMax = (ctx.word_count_max as number | undefined) ?? 140;

  // ─── Formato B1 clásico: choice_options + notes ────────
  const choiceOptions = Array.isArray(ctx.choice_options)
    ? (ctx.choice_options as ChoiceOption[])
    : [];
  const notes = Array.isArray(ctx.notes) ? (ctx.notes as string[]) : [];

  // ─── Formato B2/C1: essay obligatorio ──────────────────
  const essayQuestion = ctx.essay_question as string | undefined;
  const essayNotes = Array.isArray(ctx.essay_notes)
    ? (ctx.essay_notes as Array<{ label?: string; text: string }>)
    : [];
  const opinions = Array.isArray(ctx.opinions)
    ? (ctx.opinions as Array<{ label?: string; text: string }>)
    : [];

  // ─── Formato C2: summary+comparison de 2 textos ────────
  const sourceTexts = Array.isArray(ctx.source_texts)
    ? (ctx.source_texts as Array<{ title: string; text: string }>)
    : [];

  // ─── Formato Part 2 con choices (A/B/C) ────────────────
  const choices = Array.isArray(ctx.choices)
    ? (ctx.choices as ChoiceOption[])
    : [];

  // Consolidar todas las opciones bajo "options" con letter unificada
  const allOptions: Array<{
    letter: string;
    type?: string;
    title?: string;
    prompt?: string;
    opening_sentence?: string;
    points?: string[];
  }> = [
    ...choices.map((c) => ({
      letter: (c.letter ?? "").toUpperCase(),
      type: c.type,
      title: c.title,
      prompt: c.prompt,
      opening_sentence: c.opening_sentence,
      points: c.points,
    })),
    ...choiceOptions.map((c) => ({
      letter: (c.code ?? "").toUpperCase(),
      type: c.type,
      title: c.title,
      prompt: c.prompt,
      opening_sentence: c.opening_sentence,
      points: c.points,
    })),
  ].filter((c) => c.letter);

  const hasChoice = allOptions.length > 1;

  // ─── Parseo del answerText ─────────────────────────────
  const parseAnswer = (raw: string): { choice: string | null; body: string } => {
    const m = raw.match(/^\[([^\]]+)\]\n\n([\s\S]*)$/);
    if (m) return { choice: m[1].toUpperCase(), body: m[2] };
    return { choice: null, body: raw };
  };

  const { choice: initialChoice, body: initialBody } = parseAnswer(answerText);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(
    initialChoice
  );
  const [body, setBody] = useState(initialBody);

  useEffect(() => {
    const p = parseAnswer(answerText);
    setSelectedChoice(p.choice);
    setBody(p.body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerText]);

  const wordCount =
    body.trim().length === 0 ? 0 : body.trim().split(/\s+/).length;

  const isBelowMin = wordCount > 0 && wordCount < wordMin;
  const isAboveMax = wordCount > wordMax;
  const isInRange = wordCount >= wordMin && wordCount <= wordMax;

  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    if (hasChoice && selectedChoice) {
      onChange(`[${selectedChoice}]\n\n${newBody}`);
    } else {
      onChange(newBody);
    }
  };

  const handleChoiceChange = (letter: string) => {
    setSelectedChoice(letter);
    onChange(`[${letter}]\n\n${body}`);
  };

  // Prompt del choice seleccionado (para Part 2)
  const selectedOption = allOptions.find((o) => o.letter === selectedChoice);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabecera con número y bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-navy text-white text-sm font-semibold">
            {question.question_number}
          </span>
          <div>
            <p className="text-base text-ink font-semibold">Writing Task</p>
            <p className="text-sm text-muted mt-1">
              Write about {wordMin}–{wordMax} words.
            </p>
          </div>
        </div>
        <button
          onClick={onToggleBookmark}
          className={`flex items-center justify-center h-9 w-9 rounded transition-colors flex-shrink-0 ${
            isBookmarked
              ? "bg-saffron/15 text-saffron hover:bg-saffron/25"
              : "text-muted hover:text-ink hover:bg-paper"
          }`}
          title={isBookmarked ? "Desmarcar" : "Marcar para revisar"}
        >
          <Bookmark
            className={`h-4 w-4 ${isBookmarked ? "fill-saffron" : ""}`}
          />
        </button>
      </div>

      {/* Enunciado principal (stem de la pregunta) */}
      {question.stem && (
        <div className="rounded border border-rule bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3">
            Task
          </p>
          <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
            {question.stem}
          </div>
        </div>
      )}

      {/* Instrucción adicional (task_instruction) */}
      {taskInstruction && taskInstruction !== question.stem && (
        <div className="rounded border border-saffron/30 bg-saffron/5 p-4">
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
            {taskInstruction}
          </p>
        </div>
      )}

      {/* Pregunta central del essay */}
      {essayQuestion && (
        <div className="rounded border border-navy/20 bg-navy/5 p-5">
          <p className="text-xs uppercase tracking-wider text-navy font-medium mb-2">
            Essay question
          </p>
          <p className="text-base text-ink italic font-medium">
            &ldquo;{essayQuestion}&rdquo;
          </p>
        </div>
      )}

      {/* Notas del essay (áreas a discutir) */}
      {essayNotes.length > 0 && (
        <div className="rounded border border-rule bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3">
            Areas to discuss
          </p>
          <ul className="space-y-2">
            {essayNotes.map((n, i) => (
              <li key={i} className="text-sm text-ink flex items-start gap-3">
                {n.label && n.label !== "Notes" && (
                  <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-navy/10 text-navy text-xs font-semibold">
                    {n.label}
                  </span>
                )}
                <span className="leading-relaxed">{n.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Opiniones de la conferencia (B2/C1) */}
      {opinions.length > 0 && (
        <div className="rounded border border-rule bg-paper p-5">
          <p className="text-xs uppercase tracking-wider text-muted font-medium mb-3">
            Opinions expressed in the lecture
          </p>
          <ul className="space-y-2">
            {opinions.map((o, i) => (
              <li
                key={i}
                className="text-sm text-ink italic leading-relaxed"
              >
                {o.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Textos fuente (C2 Part 1) */}
      {sourceTexts.length > 0 && (
        <div className="space-y-4">
          {sourceTexts.map((t, i) => (
            <div key={i} className="rounded border border-rule bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-navy font-medium mb-2">
                {t.title}
              </p>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {t.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Notas simples (formato B1) */}
      {notes.length > 0 && (
        <div className="rounded border border-saffron/30 bg-saffron/5 p-5">
          <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-3">
            You must cover
          </p>
          <ul className="space-y-1.5">
            {notes.map((n, i) => (
              <li
                key={i}
                className="text-sm text-ink flex items-start gap-2"
              >
                <span className="text-saffron flex-shrink-0">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Choice de tasks (A/B/C) */}
      {hasChoice && (
        <div className="rounded border border-rule bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3">
            Choose ONE option
          </p>
          <div className="space-y-3">
            {allOptions.map((opt) => {
              const isSel = selectedChoice === opt.letter;
              return (
                <label
                  key={opt.letter}
                  className={`flex items-start gap-3 rounded border-2 p-4 cursor-pointer transition-all ${
                    isSel
                      ? "border-navy bg-navy/5"
                      : "border-rule bg-white hover:border-navy/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={`writing-choice-${question.id}`}
                    checked={isSel}
                    onChange={() => handleChoiceChange(opt.letter)}
                    className="mt-1 h-4 w-4 text-navy focus:ring-navy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {opt.letter}
                      {opt.type && ` — ${opt.type.replace(/_/g, " ")}`}
                    </p>
                    {opt.title && (
                      <p className="text-sm text-ink font-medium mt-1">
                        {opt.title}
                      </p>
                    )}
                    {opt.opening_sentence && (
                      <p className="text-sm text-muted italic mt-1">
                        Opening: &ldquo;{opt.opening_sentence}&rdquo;
                      </p>
                    )}
                    {opt.points && opt.points.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {opt.points.map((p, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted flex items-start gap-1.5"
                          >
                            <span className="flex-shrink-0">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Prompt completo del choice seleccionado (Part 2 B2/C1/C2) */}
      {selectedOption?.prompt && (
        <div className="rounded border border-navy/30 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3">
            Task {selectedOption.letter} — full details
          </p>
          <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
            {selectedOption.prompt}
          </div>
        </div>
      )}

      {/* Textarea con contador */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-muted font-medium">
            Your answer
          </p>
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              isInRange
                ? "text-ok"
                : isAboveMax
                ? "text-error"
                : isBelowMin
                ? "text-saffron"
                : "text-muted"
            }`}
          >
            {isInRange && <CheckCircle2 className="h-3 w-3" />}
            {(isBelowMin || isAboveMax) && <AlertCircle className="h-3 w-3" />}
            <span>{wordCount} words</span>
            <span className="text-muted">
              · ({wordMin}–{wordMax})
            </span>
          </div>
        </div>
        <textarea
          value={body}
          onChange={(e) => handleBodyChange(e.target.value)}
          disabled={hasChoice && !selectedChoice}
          className="w-full rounded border-2 border-rule px-4 py-3 text-sm text-ink leading-relaxed font-mono focus:outline-none focus:border-navy transition-colors min-h-[380px] resize-y disabled:bg-paper disabled:opacity-70 disabled:cursor-not-allowed"
          placeholder={
            hasChoice && !selectedChoice
              ? "Choose an option above to enable the answer box."
              : "Start writing your answer here..."
          }
          spellCheck={true}
        />
        <p className="text-xs text-muted mt-2 italic">
          La IA (para alumnos individuales) o tu profesor corregirá esta tarea
          con la rúbrica oficial Cambridge (Content, Communicative Achievement,
          Organisation, Language).
        </p>
      </div>
    </div>
  );
}
