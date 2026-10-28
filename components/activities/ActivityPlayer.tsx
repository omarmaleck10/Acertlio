"use client";

/**
 * ActivityPlayer: orquesta la realización de una actividad en modo examen.
 * - Carga la actividad y sus 8 preguntas
 * - Permite responder una a una o verlas todas a la vez
 * - Timer que cuenta hacia arriba
 * - Al pulsar "Enviar": POST al endpoint y redirige a resultados
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  Activity,
  ActivityQuestion,
  QuestionOption,
} from "@/lib/activities/types";
import { ActivityQuestionCard } from "./ActivityQuestionCard";

type SafeActivity = Activity & {
  exam_part?: { id: number; slug: string; name: string; part_number: number };
};

type SafeQuestion = ActivityQuestion & {
  options?: QuestionOption[];
};

export function ActivityPlayer({ activityId }: { activityId: string }) {
  const router = useRouter();
  const [activity, setActivity] = useState<SafeActivity | null>(null);
  const [questions, setQuestions] = useState<SafeQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  // Cargar actividad
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/activities/${activityId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Error al cargar");
          setLoading(false);
          return;
        }
        setActivity(data.activity);
        setQuestions(data.questions ?? []);
        setAttemptId(data.attempt_id);
        startedAtRef.current = Date.now();
        setLoading(false);
      } catch {
        setError("Error de conexión");
        setLoading(false);
      }
    })();
  }, [activityId]);

  // Timer
  useEffect(() => {
    if (loading || !activity) return;
    const int = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(int);
  }, [loading, activity]);

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const answeredCount = Object.values(answers).filter(
    (a) => a && a.trim() !== ""
  ).length;

  const handleSubmit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/activities/${activityId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: attemptId,
          responses: questions.map((q) => ({
            question_id: q.id,
            user_answer: answers[q.id] ?? "",
          })),
          time_spent_seconds: elapsedSec,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al enviar");
        setSubmitting(false);
        return;
      }

      router.push(
        `/alumno/actividades/${activityId}/resultados?attempt=${attemptId}`
      );
    } catch {
      setError("Error de conexión al enviar");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-sm">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-saffron border-t-transparent" />
        <p className="mt-3 text-sm text-muted">Cargando actividad…</p>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800">
        {error}
        <div className="mt-3">
          <Link
            href="/alumno/actividades"
            className="text-sm font-medium underline"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link
              href="/alumno/actividades"
              className="mb-2 inline-block text-xs text-muted hover:text-navy"
            >
              ← Volver al catálogo
            </Link>
            <p className="text-xs font-bold uppercase tracking-wider text-saffron">
              {activity.level} · {activity.exam_part?.name}
            </p>
            <h1 className="mt-1 text-xl font-bold text-ink sm:text-2xl">
              {activity.title}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-md bg-paper px-3 py-1.5 font-mono text-sm font-bold text-navy">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <span className="text-xs text-muted">
              {answeredCount}/{questions.length} respondidas
            </span>
          </div>
        </div>

        {activity.intro_text && (
          <div className="mt-6 rounded-lg border border-rule bg-paper p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
              Instrucciones y texto
            </p>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-ink">
              {activity.intro_text}
            </div>
          </div>
        )}
      </div>

      {/* Modo examen · aviso */}
      <div className="rounded-md border-l-4 border-saffron bg-saffron/5 px-4 py-3">
        <p className="text-sm text-ink">
          <strong>Modo examen:</strong> no verás las respuestas correctas hasta
          que termines y pulses <em>Enviar</em>. Puedes volver atrás para
          cambiar respuestas antes de enviar.
        </p>
      </div>

      {/* Preguntas */}
      <div className="space-y-4">
        {questions.map((q) => (
          <ActivityQuestionCard
            key={q.id}
            question={q}
            userAnswer={answers[q.id] ?? ""}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </div>

      {/* Submit */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        {error && (
          <div className="mb-3 rounded-md border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!confirmSubmit ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted">
              Has respondido <strong>{answeredCount}</strong> de{" "}
              <strong>{questions.length}</strong> preguntas.
              {answeredCount < questions.length && (
                <span className="block text-amber-700">
                  Las no respondidas contarán como incorrectas.
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setConfirmSubmit(true)}
              className="w-full rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/90 sm:w-auto"
            >
              Enviar actividad
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-semibold text-ink">
              ¿Enviar y ver resultados?
            </p>
            <p className="text-sm text-muted">
              Una vez envíes verás la revisión completa con respuestas
              correctas y explicaciones. No podrás cambiar las respuestas.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                disabled={submitting}
                className="rounded-md border border-rule bg-white px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper disabled:opacity-50"
              >
                Volver y revisar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:bg-gray-300"
              >
                {submitting ? "Enviando…" : "Sí, enviar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
