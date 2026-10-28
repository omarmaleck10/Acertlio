"use client";

/**
 * Tarjeta de una pregunta durante el modo examen (sin feedback).
 * Soporta multiple_choice, open_cloze, word_formation,
 * key_word_transformation y multiple_matching.
 */

import type { ActivityQuestion, QuestionOption } from "@/lib/activities/types";

type Props = {
  question: ActivityQuestion & { options?: QuestionOption[] };
  userAnswer: string;
  onChange: (value: string) => void;
};

export function ActivityQuestionCard({ question, userAnswer, onChange }: Props) {
  const num = question.question_number;

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
      {/* Header pregunta */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
          {num}
        </div>
        <div className="flex-1">
          {question.prompt && (
            <p className="text-sm font-semibold text-ink">{question.prompt}</p>
          )}
          {question.context && (
            <p className="mt-2 italic text-muted">{question.context}</p>
          )}
        </div>
      </div>

      {/* Input según tipo */}
      {renderInput(question, userAnswer, onChange)}
    </div>
  );
}

function renderInput(
  question: ActivityQuestion & { options?: QuestionOption[] },
  userAnswer: string,
  onChange: (v: string) => void
) {
  switch (question.question_type) {
    case "multiple_choice":
    case "multiple_matching":
      return (
        <div className="ml-11 space-y-2">
          {(question.options ?? []).map((opt) => {
            const selected = userAnswer === opt.option_letter;
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
                  selected
                    ? "border-navy bg-paper"
                    : "border-rule bg-white hover:border-navy/30 hover:bg-paper/50"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt.option_letter}
                  checked={selected}
                  onChange={() => onChange(opt.option_letter)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy focus:ring-2 focus:ring-navy"
                />
                <span className="text-ink">
                  <span className="font-bold text-navy">{opt.option_letter}</span>
                  {"  "}
                  {opt.option_text}
                </span>
              </label>
            );
          })}
        </div>
      );

    case "open_cloze":
    case "word_formation": {
      const hint =
        question.question_type === "word_formation"
          ? question.metadata?.base_word
            ? `Palabra base: ${question.metadata.base_word}`
            : "Transforma la palabra base"
          : "Escribe una palabra";
      return (
        <div className="ml-11 space-y-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onChange(e.target.value)}
            placeholder={hint}
            className="w-full max-w-xs rounded-md border border-rule bg-white px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-xs text-muted">{hint}</p>
        </div>
      );
    }

    case "key_word_transformation": {
      const keyWord = question.metadata?.key_word ?? "";
      const minW = question.metadata?.min_words ?? 3;
      const maxW = question.metadata?.max_words ?? 6;
      const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
      const wordCountOk = wordCount >= minW && wordCount <= maxW;

      return (
        <div className="ml-11 space-y-3">
          {keyWord && (
            <div className="inline-block rounded-md bg-saffron/10 px-3 py-1.5 text-sm">
              Palabra clave:{" "}
              <strong className="font-mono uppercase text-saffron">
                {keyWord}
              </strong>
            </div>
          )}
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Usa entre ${minW} y ${maxW} palabras incluyendo ${keyWord}`}
            className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
            autoComplete="off"
            spellCheck={false}
          />
          <p
            className={`text-xs ${
              userAnswer === ""
                ? "text-muted"
                : wordCountOk
                  ? "text-emerald-600"
                  : "text-amber-700"
            }`}
          >
            {wordCount} palabra{wordCount !== 1 ? "s" : ""} · debe ser entre{" "}
            {minW} y {maxW}
          </p>
        </div>
      );
    }

    default:
      return (
        <div className="ml-11 text-sm text-muted">
          Tipo de pregunta no soportado: {question.question_type}
        </div>
      );
  }
}
