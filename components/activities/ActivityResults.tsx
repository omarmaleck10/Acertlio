"use client";

/**
 * Vista de resultados tras completar una actividad.
 * Muestra: nota global + grade, revisión pregunta por pregunta
 * (con respuesta del alumno, correcta y explicación) y CTAs.
 */

import Link from "next/link";
import type {
  Activity,
  ActivityAttempt,
  ActivityQuestion,
  ActivityResponse,
  QuestionOption,
} from "@/lib/activities/types";
import {
  gradeFromScore,
  gradeLabel,
  gradeColorClass,
} from "@/lib/activities/scoring";

type Props = {
  activity: Activity & {
    exam_part?: { id: number; slug: string; name: string; part_number: number };
  };
  attempt: ActivityAttempt;
  questions: Array<ActivityQuestion & { options?: QuestionOption[] }>;
  responsesByQuestion: Record<string, ActivityResponse>;
};

export function ActivityResults({
  activity,
  attempt,
  questions,
  responsesByQuestion,
}: Props) {
  const score = attempt.score ?? 0;
  const total = attempt.total_questions;
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const grade = gradeFromScore(score, total);
  const gradeColor = gradeColorClass(grade);
  const timeMin = Math.floor((attempt.time_spent_seconds ?? 0) / 60);
  const timeSec = (attempt.time_spent_seconds ?? 0) % 60;

  return (
    <div className="space-y-6">
      {/* Cabecera con nota */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-rule bg-paper px-6 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-saffron">
            Resultado · {activity.level} · {activity.exam_part?.name}
          </p>
          <h1 className="mt-1 text-xl font-bold text-ink">{activity.title}</h1>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            {/* Nota grande */}
            <div className="text-center">
              <p className="text-6xl font-bold text-navy">{score}</p>
              <p className="text-sm text-muted">
                de {total} correctas · {pct}%
              </p>
            </div>

            {/* Grade */}
            <div
              className={`rounded-lg border-2 px-6 py-3 text-center ${gradeColor}`}
            >
              <p className="text-xs font-bold uppercase tracking-wider">
                Resultado
              </p>
              <p className="mt-1 text-xl font-bold">{gradeLabel(grade)}</p>
            </div>

            {/* Tiempo */}
            <div className="text-center">
              <p className="text-sm text-muted">Tiempo</p>
              <p className="mt-1 font-mono text-lg font-bold text-ink">
                {String(timeMin).padStart(2, "0")}:
                {String(timeSec).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revisión pregunta por pregunta */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">
          Revisión de las {total} preguntas
        </h2>

        {questions.map((q) => {
          const response = responsesByQuestion[q.id];
          const correct = response?.is_correct ?? false;
          const userAns = response?.user_answer ?? "";

          return (
            <ReviewQuestion
              key={q.id}
              question={q}
              userAnswer={userAns}
              isCorrect={correct}
            />
          );
        })}
      </div>

      {/* CTAs */}
      <div className="rounded-lg bg-navy p-6 text-white sm:p-8">
        <h3 className="mb-2 text-lg font-bold">¿Qué hacer ahora?</h3>
        <p className="mb-5 text-white/80">
          Sigue practicando con más actividades o prueba un mock completo para
          medir tu progreso real.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/alumno/actividades?skill=${activity.skill}`}
            className="rounded-md bg-saffron px-5 py-2.5 text-sm font-semibold text-navy hover:bg-saffron/90"
          >
            Más actividades de {activity.exam_part?.name}
          </Link>
          <Link
            href="/alumno/actividades"
            className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReviewQuestion({
  question,
  userAnswer,
  isCorrect,
}: {
  question: ActivityQuestion & { options?: QuestionOption[] };
  userAnswer: string;
  isCorrect: boolean;
}) {
  const correctAnswer = question.correct_answer ?? "";
  const isMc =
    question.question_type === "multiple_choice" ||
    question.question_type === "multiple_matching";

  return (
    <div
      className={`overflow-hidden rounded-lg border-l-4 bg-white shadow-sm ${
        isCorrect ? "border-emerald-500" : "border-red-500"
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
              isCorrect ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {isCorrect ? "✓" : "✗"}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Pregunta {question.question_number}
            </p>
            {question.prompt && (
              <p className="mt-1 font-semibold text-ink">{question.prompt}</p>
            )}
            {question.context && (
              <p className="mt-2 italic text-muted">{question.context}</p>
            )}
          </div>
        </div>

        {/* Respuestas */}
        {isMc ? (
          <div className="ml-11 space-y-2">
            {(question.options ?? []).map((opt) => {
              const isCorrectOpt = opt.is_correct;
              const isUserChoice = userAnswer === opt.option_letter;

              let classes = "border-rule bg-white text-muted";
              if (isCorrectOpt) classes = "border-emerald-500 bg-emerald-50 text-emerald-900";
              else if (isUserChoice && !isCorrect)
                classes = "border-red-500 bg-red-50 text-red-900";

              return (
                <div
                  key={opt.id}
                  className={`rounded-md border px-3 py-2 text-sm ${classes}`}
                >
                  <span className="font-bold">{opt.option_letter}</span>
                  {"  "}
                  {opt.option_text}
                  {isCorrectOpt && (
                    <span className="ml-2 text-xs font-semibold text-emerald-700">
                      ✓ correcta
                    </span>
                  )}
                  {isUserChoice && !isCorrectOpt && (
                    <span className="ml-2 text-xs font-semibold text-red-700">
                      tu respuesta
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ml-11 space-y-2">
            <div className="rounded-md border border-rule bg-paper px-3 py-2 text-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Tu respuesta
              </span>
              <p
                className={`mt-1 ${
                  isCorrect ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {userAnswer || <em className="text-muted">(sin responder)</em>}
              </p>
            </div>
            <div className="rounded-md border border-emerald-500 bg-emerald-50 px-3 py-2 text-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Respuesta correcta
              </span>
              <p className="mt-1 font-semibold text-emerald-900">
                {correctAnswer}
              </p>
              {question.accepted_answers && question.accepted_answers.length > 0 && (
                <p className="mt-1 text-xs text-emerald-700">
                  También aceptadas: {question.accepted_answers.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Explicación */}
        {question.explanation && (
          <div className="ml-11 mt-3 rounded-md bg-paper px-3 py-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron">
              💡 Explicación
            </span>
            <p className="mt-1 text-ink">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
