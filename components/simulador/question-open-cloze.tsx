"use client";

import { Bookmark } from "lucide-react";
import type { SimQuestion } from "@/lib/exam/loader";

interface Props {
  question: SimQuestion;
  answerText: string;
  isBookmarked: boolean;
  onChange: (text: string) => void;
  onToggleBookmark: () => void;
}

/**
 * Renderizador de preguntas tipo open_cloze.
 *
 * Este mismo tipo de pregunta se usa para tres formatos diferentes según
 * el campo `context`:
 *
 * 1. OPEN CLOZE clásico (Part 2 de todos los niveles): "Gap N" + input.
 *    El texto largo con TODOS los huecos se muestra en el header/contexto
 *    de la Part (base_text del settings), no aquí.
 *
 * 2. WORD FORMATION (Part 3 de B2/C1/C2): además del gap se muestra la
 *    palabra base en MAYÚSCULAS. Se detecta por `context.base_word`.
 *
 * 3. KEY WORD TRANSFORMATIONS (Part 4 de B2/C1/C2): se muestra la frase
 *    original en inglés, la palabra clave, y la segunda frase con
 *    lead-in ______ lead-out donde el alumno escribe la respuesta.
 *    Se detecta por `context.original_sentence`.
 */
export function QuestionOpenCloze({
  question,
  answerText,
  isBookmarked,
  onChange,
  onToggleBookmark,
}: Props) {
  const ctx =
    (question.context as Record<string, unknown> | null | undefined) ?? {};
  const baseWord = ctx.base_word as string | undefined;
  const originalSentence = ctx.original_sentence as string | undefined;
  const keyWord = ctx.key_word as string | undefined;
  const leadIn = ctx.lead_in as string | undefined;
  const leadOut = ctx.lead_out as string | undefined;

  const isKeyTransform = Boolean(
    originalSentence && keyWord && (leadIn || leadOut)
  );
  const isWordFormation = Boolean(baseWord) && !isKeyTransform;

  // Header común
  const header = (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-navy text-white text-sm font-semibold">
          {question.question_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base text-ink leading-relaxed font-medium">
            {isKeyTransform
              ? "Key word transformation"
              : isWordFormation
              ? "Word formation"
              : `Gap ${question.question_number}`}
          </p>
          <p className="text-sm text-muted mt-1">
            {isKeyTransform
              ? "Complete the second sentence using the key word."
              : isWordFormation
              ? "Use the word in capitals to form a word that fits the gap."
              : "Write ONE word that best fits this gap."}
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
  );

  // KEY WORD TRANSFORMATION (Part 4)
  if (isKeyTransform) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded border border-rule bg-white p-6">
          {header}

          <div className="space-y-4 mt-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-navy font-medium mb-1.5">
                Original sentence
              </p>
              <p className="text-base text-ink leading-relaxed italic">
                &ldquo;{originalSentence}&rdquo;
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-navy font-medium mb-1.5">
                Key word
              </p>
              <p className="text-base font-mono font-bold tracking-wider text-saffron uppercase">
                {keyWord}
              </p>
            </div>

            <div className="pt-3 border-t border-rule">
              <p className="text-xs uppercase tracking-wider text-navy font-medium mb-2">
                Complete the second sentence
              </p>
              <div className="text-base text-ink leading-relaxed flex flex-wrap items-baseline gap-2">
                {leadIn && (
                  <span className="font-medium">{leadIn}</span>
                )}
                <input
                  type="text"
                  value={answerText}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 min-w-[200px] rounded border-2 border-rule px-3 py-1.5 text-base text-ink font-medium focus:outline-none focus:border-navy transition-colors"
                  placeholder="Words including the key word..."
                  autoComplete="off"
                  spellCheck={false}
                />
                {leadOut && (
                  <span className="font-medium">{leadOut}</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted mt-6 italic leading-relaxed">
            Tip: you must use between three and eight words (three to six for B2/C1)
            including the key word. Do NOT change the key word.
          </p>
        </div>
      </div>
    );
  }

  // WORD FORMATION (Part 3)
  if (isWordFormation) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded border border-rule bg-white p-6">
          {header}

          <div className="flex items-center gap-6 mt-6 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wider text-navy font-medium mb-1.5">
                Base word
              </p>
              <p className="text-base font-mono font-bold tracking-wider text-saffron uppercase">
                {baseWord}
              </p>
            </div>

            <div className="flex-1 min-w-[240px]">
              <p className="text-xs uppercase tracking-wider text-navy font-medium mb-1.5">
                Your answer
              </p>
              <input
                type="text"
                value={answerText}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded border-2 border-rule px-3 py-1.5 text-base text-ink font-medium focus:outline-none focus:border-navy transition-colors"
                placeholder="Transformed word..."
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <p className="text-xs text-muted mt-6 italic leading-relaxed">
            Tip: form a word from{" "}
            <code className="bg-paper px-1 rounded font-mono">{baseWord}</code>
            {" "}that fits the gap in the text above.
          </p>
        </div>
      </div>
    );
  }

  // OPEN CLOZE CLASICO (Part 2)
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded border border-rule bg-white p-6">
        {header}

        <div className="flex items-center gap-3 mt-6">
          <label className="text-sm text-muted flex-shrink-0">
            Your answer:
          </label>
          <input
            type="text"
            value={answerText}
            onChange={(e) => onChange(e.target.value)}
            className="w-32 rounded border-2 border-rule px-3 py-1.5 text-base text-ink font-medium focus:outline-none focus:border-navy transition-colors"
            placeholder="..."
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <p className="text-xs text-muted mt-4 italic leading-relaxed">
          Tip: normally one word. Contractions like{" "}
          <code className="bg-paper px-1 rounded">don&apos;t</code> count as one
          word.
        </p>
      </div>
    </div>
  );
}
