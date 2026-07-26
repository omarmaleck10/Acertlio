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

/**
 * Renderizador Writing Task (Parts 7 y 8 de B1).
 *
 * Muestra:
 *   - Task 1 (Part 7): Email — texto de la task + textarea
 *   - Task 2 (Part 8): Article or Story — radio buttons para elegir + textarea
 *
 * El texto guardado incluye un prefijo [34a] o [34b] cuando hay choice,
 * para que el profesor sepa qué eligió el alumno.
 *
 * Formato guardado:
 *   Task 1 sin choice: solo el texto tal cual
 *   Task 2 con choice: "[34a]\n\n[texto]" o "[34b]\n\n[texto]"
 */
export function QuestionWriting({
  question,
  answerText,
  isBookmarked,
  onChange,
  onToggleBookmark,
}: Props) {
  const ctx = question.context ?? {};
  const wordMin = (ctx.word_count_min as number | undefined) ?? 90;
  const wordMax = (ctx.word_count_max as number | undefined) ?? 120;
  const choiceOptions = Array.isArray(ctx.choice_options)
    ? (ctx.choice_options as Array<{
        code: string;
        type?: string;
        title?: string;
        opening_sentence?: string;
        points?: string[];
      }>)
    : [];
  const notes = Array.isArray(ctx.notes) ? (ctx.notes as string[]) : [];
  const hasChoice = choiceOptions.length > 1;

  // Parsear el answerText para extraer choice y body
  const parseAnswer = (raw: string): { choice: string | null; body: string } => {
    const m = raw.match(/^\[([^\]]+)\]\n\n([\s\S]*)$/);
    if (m) return { choice: m[1], body: m[2] };
    return { choice: null, body: raw };
  };

  const { choice: initialChoice, body: initialBody } = parseAnswer(answerText);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(
    initialChoice ?? (hasChoice ? null : null)
  );
  const [body, setBody] = useState(initialBody);

  // Sincronizar cuando cambia el answerText desde fuera (por ejemplo al
  // volver del paso "paused")
  useEffect(() => {
    const p = parseAnswer(answerText);
    setSelectedChoice(p.choice ?? (hasChoice ? null : null));
    setBody(p.body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerText]);

  const wordCount = body.trim().length === 0 ? 0 : body.trim().split(/\s+/).length;
  const charCount = body.length;

  const isBelowMin = wordCount > 0 && wordCount < wordMin;
  const isAboveMax = wordCount > wordMax;
  const isInRange = wordCount >= wordMin && wordCount <= wordMax;

  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    // Componer el texto guardado según haya choice o no
    if (hasChoice && selectedChoice) {
      onChange(`[${selectedChoice}]\n\n${newBody}`);
    } else if (hasChoice) {
      // Aún no ha elegido, no guardar el body (o guardar tal cual)
      onChange(newBody);
    } else {
      onChange(newBody);
    }
  };

  const handleChoiceChange = (code: string) => {
    setSelectedChoice(code);
    // Recomponer el texto con el nuevo choice
    onChange(`[${code}]\n\n${body}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabecera con número y bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-navy text-white text-sm font-semibold">
            {question.question_number}
          </span>
          <div>
            <p className="text-base text-ink font-semibold">
              Writing Task
            </p>
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
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-saffron" : ""}`} />
        </button>
      </div>

      {/* Choice de tasks (34a vs 34b) */}
      {hasChoice && (
        <div className="rounded border border-rule bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3">
            Choose one option
          </p>
          <div className="space-y-2">
            {choiceOptions.map((opt) => {
              const isSel = selectedChoice === opt.code;
              return (
                <label
                  key={opt.code}
                  className={`flex items-start gap-3 rounded border-2 p-3 cursor-pointer transition-all ${
                    isSel
                      ? "border-navy bg-navy/5"
                      : "border-rule bg-white hover:border-navy/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={`writing-choice-${question.id}`}
                    checked={isSel}
                    onChange={() => handleChoiceChange(opt.code)}
                    className="mt-1 h-4 w-4 text-navy focus:ring-navy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {opt.code.toUpperCase()} — {(opt.type ?? "").replace(/_/g, " ")}
                    </p>
                    {opt.title && (
                      <p className="text-sm text-ink mt-0.5">{opt.title}</p>
                    )}
                    {opt.opening_sentence && (
                      <p className="text-sm text-muted italic mt-1">
                        Opening: &ldquo;{opt.opening_sentence}&rdquo;
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Task stem (prompt) */}
      <div className="rounded border border-rule bg-white p-5">
        <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3">
          Task
        </p>
        <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
          {question.stem}
        </div>
        {notes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-rule">
            <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-2">
              You must cover
            </p>
            <ul className="space-y-1.5">
              {notes.map((n, i) => (
                <li key={i} className="text-sm text-ink flex items-start gap-2">
                  <span className="text-saffron flex-shrink-0">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Textarea */}
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
              : "Start writing your answer here…"
          }
          spellCheck={true}
        />
        <p className="text-xs text-muted mt-2 italic">
          Tu profesor corregirá esta tarea manualmente con la rúbrica oficial
          Cambridge (Content, Communicative Achievement, Organisation, Language).
        </p>
      </div>
    </div>
  );
}
