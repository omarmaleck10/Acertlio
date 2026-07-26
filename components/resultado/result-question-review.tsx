import { CheckCircle2, XCircle, MinusCircle, Bookmark, Clock } from "lucide-react";
import type { ResultQuestion } from "@/lib/exam/result-loader";

interface Props {
  question: ResultQuestion;
  partSettings?: Record<string, unknown>;
}

/**
 * Renderiza una pregunta con su corrección.
 * Distingue por question_type y muestra la respuesta del alumno vs la correcta.
 * Para writing_task, delega a otro componente.
 */
export function ResultQuestionReview({ question, partSettings }: Props) {
  if (question.question_type === "writing_task") {
    return <WritingQuestionReview question={question} />;
  }

  const statusInfo = getStatusInfo(question.status);
  const noticeText =
    typeof question.context?.notice_text === "string"
      ? (question.context.notice_text as string)
      : null;

  return (
    <article
      className={`rounded-lg border-l-4 border border-rule bg-white p-5 ${statusInfo.borderClass}`}
    >
      {/* Cabecera con número + estado */}
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-paper text-ink text-sm font-semibold">
            {question.question_number}
          </span>
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${statusInfo.textClass}`}>
            <statusInfo.Icon className="h-3.5 w-3.5" />
            {statusInfo.label}
          </div>
        </div>
        {question.is_bookmarked && (
          <div
            className="inline-flex items-center gap-1 text-xs text-saffron"
            title="Marcaste esta pregunta durante el examen"
          >
            <Bookmark className="h-3 w-3 fill-saffron" />
            Marcada
          </div>
        )}
      </header>

      {/* Notice text (Part 1) */}
      {noticeText && (
        <div className="rounded bg-paper border border-rule p-3 mb-3">
          <p className="text-xs text-ink leading-relaxed italic whitespace-pre-wrap">
            {noticeText}
          </p>
        </div>
      )}

      {/* Stem */}
      {question.stem && (
        <p className="text-sm text-ink mb-4 leading-relaxed">{question.stem}</p>
      )}

      {/* Opciones (MC) o texto libre */}
      {question.options.length > 0 ? (
        <OptionsReview question={question} />
      ) : (
        <FreeTextReview question={question} />
      )}
    </article>
  );
}


// ─── Opciones (MC) ────────────────────────────────────────────────────
function OptionsReview({ question }: { question: ResultQuestion }) {
  return (
    <div className="space-y-1.5">
      {question.options.map((opt) => {
        // 4 estados visuales:
        // 1. Opción correcta que el alumno eligió: verde fuerte
        // 2. Opción correcta que el alumno NO eligió: verde suave (para que la vea)
        // 3. Opción incorrecta que el alumno eligió: rojo (su error)
        // 4. Opción incorrecta que el alumno NO eligió: gris apagado

        let containerClass = "border border-rule bg-white";
        let letterClass = "border-rule text-muted";
        let iconEl: JSX.Element | null = null;

        if (opt.is_correct && opt.is_user_selection) {
          containerClass = "border-ok bg-ok/5";
          letterClass = "border-ok bg-ok text-white";
          iconEl = <CheckCircle2 className="h-4 w-4 text-ok flex-shrink-0" />;
        } else if (opt.is_correct && !opt.is_user_selection) {
          containerClass = "border-ok/40 bg-ok/5";
          letterClass = "border-ok bg-ok/20 text-ok";
          iconEl = <CheckCircle2 className="h-4 w-4 text-ok/70 flex-shrink-0" />;
        } else if (!opt.is_correct && opt.is_user_selection) {
          containerClass = "border-error bg-error/5";
          letterClass = "border-error bg-error text-white";
          iconEl = <XCircle className="h-4 w-4 text-error flex-shrink-0" />;
        } else {
          containerClass = "border-rule bg-white opacity-70";
          letterClass = "border-rule text-muted";
        }

        return (
          <div
            key={opt.id}
            className={`flex items-start gap-3 rounded border-2 p-3 ${containerClass}`}
          >
            <span
              className={`flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-sm font-semibold border-2 ${letterClass}`}
            >
              {opt.letter}
            </span>
            <span className="text-sm text-ink leading-relaxed flex-1">
              {opt.text}
            </span>
            {iconEl}
          </div>
        );
      })}
    </div>
  );
}


// ─── Texto libre (matching, gapped, open_cloze) ───────────────────────
function FreeTextReview({ question }: { question: ResultQuestion }) {
  const isCorrect = question.status === "correct";
  const userAnswer = question.user_answer_text ?? "—";
  const correctAnswer = question.correct_answer_text
    ? question.correct_answer_text.replace(/\|/g, " / ")
    : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        className={`rounded border-2 p-3 ${
          isCorrect
            ? "border-ok bg-ok/5"
            : question.status === "unanswered"
            ? "border-rule bg-paper"
            : "border-error bg-error/5"
        }`}
      >
        <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1.5">
          Tu respuesta
        </p>
        <p className={`text-base font-semibold ${
          question.status === "unanswered" ? "text-muted italic" : "text-ink"
        }`}>
          {question.status === "unanswered" ? "Sin responder" : userAnswer}
        </p>
      </div>

      <div className="rounded border-2 border-ok bg-ok/5 p-3">
        <p className="text-[10px] uppercase tracking-wider text-ok font-medium mb-1.5">
          Respuesta correcta
        </p>
        <p className="text-base font-semibold text-ink">{correctAnswer}</p>
      </div>
    </div>
  );
}


// ─── Writing task review ──────────────────────────────────────────────
function WritingQuestionReview({ question }: { question: ResultQuestion }) {
  const wc = question.writing_correction;
  const isCorrected = Boolean(wc?.corrected_at);

  return (
    <article className="rounded-lg border-l-4 border border-rule border-l-saffron bg-white p-5">
      <header className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-saffron/10 text-saffron text-sm font-semibold">
          {question.question_number}
        </span>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron">
          <Clock className="h-3.5 w-3.5" />
          Writing Task
        </div>
        {question.writing_choice && (
          <span className="text-xs text-muted">
            Elegiste: <span className="font-semibold text-ink uppercase">{question.writing_choice}</span>
          </span>
        )}
      </header>

      {/* Tu respuesta escrita */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wider text-muted font-medium mb-2">
          Tu respuesta
        </p>
        <div className="rounded border border-rule bg-paper p-4 max-h-96 overflow-y-auto">
          {question.writing_body && question.writing_body.trim() ? (
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-mono">
              {question.writing_body}
            </p>
          ) : (
            <p className="text-sm text-muted italic">Sin respuesta.</p>
          )}
        </div>
        {question.writing_body && question.writing_body.trim() && (
          <p className="text-xs text-muted mt-2">
            {question.writing_body.trim().split(/\s+/).length} palabras
          </p>
        )}
      </div>

      {/* Corrección */}
      {isCorrected && wc ? (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3">
            Corrección de tu profesor
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <RubricScore label="Content" score={wc.content_score} max={5} />
            <RubricScore label="Comm. Achievement" score={wc.communicative_score} max={5} />
            <RubricScore label="Organisation" score={wc.organisation_score} max={5} />
            <RubricScore label="Language" score={wc.language_score} max={5} />
          </div>

          <div className="rounded border border-ok/30 bg-ok/5 p-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">
              Total
            </span>
            <span className="text-lg font-bold text-ok tabular-nums">
              {wc.total_score ?? 0} / {wc.max_score ?? 20}
            </span>
          </div>

          {wc.teacher_notes && (
            <div className="mt-4 rounded border border-rule bg-white p-4">
              <p className="text-xs uppercase tracking-wider text-navy font-medium mb-2">
                Notas del profesor
              </p>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {wc.teacher_notes}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded border border-saffron/30 bg-saffron/5 p-3 flex items-start gap-2">
          <Clock className="h-4 w-4 text-saffron flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink">
              Pendiente de corrección
            </p>
            <p className="text-xs text-muted mt-0.5">
              Tu profesor te dará la nota con la rúbrica Cambridge (Content,
              Communicative Achievement, Organisation, Language).
            </p>
          </div>
        </div>
      )}
    </article>
  );
}


function RubricScore({
  label,
  score,
  max,
}: {
  label: string;
  score: number | null;
  max: number;
}) {
  return (
    <div className="rounded border border-rule bg-white p-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted font-medium leading-tight">
        {label}
      </p>
      <p className="text-lg font-bold text-ink tabular-nums mt-1">
        {score ?? "—"}
        <span className="text-xs text-muted font-normal">/{max}</span>
      </p>
    </div>
  );
}


// ─── Helper ───────────────────────────────────────────────────────────
function getStatusInfo(status: string) {
  switch (status) {
    case "correct":
      return {
        Icon: CheckCircle2,
        label: "Correcto",
        textClass: "text-ok",
        borderClass: "border-l-ok",
      };
    case "incorrect":
      return {
        Icon: XCircle,
        label: "Incorrecto",
        textClass: "text-error",
        borderClass: "border-l-error",
      };
    case "unanswered":
      return {
        Icon: MinusCircle,
        label: "Sin responder",
        textClass: "text-muted",
        borderClass: "border-l-rule",
      };
    case "pending":
      return {
        Icon: Clock,
        label: "Pendiente",
        textClass: "text-saffron",
        borderClass: "border-l-saffron",
      };
    default:
      return {
        Icon: MinusCircle,
        label: "—",
        textClass: "text-muted",
        borderClass: "border-l-rule",
      };
  }
}
