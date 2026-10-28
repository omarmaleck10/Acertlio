"use client";

/**
 * Tarjeta de actividad en el catálogo. Muestra título, parte, dificultad,
 * duración estimada y el resultado del último intento si existe.
 */

import Link from "next/link";
import type { Activity } from "@/lib/activities/types";

type Props = {
  activity: Activity & {
    exam_part?: { id: number; slug: string; name: string; part_number: number };
    last_attempt?: { score: number; total: number; submitted_at: string } | null;
  };
};

const DIFFICULTY_COLORS = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

const DIFFICULTY_LABELS = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

export function ActivityCard({ activity }: Props) {
  const last = activity.last_attempt;
  const hasAttempt = !!last;
  const percentage = hasAttempt
    ? Math.round((last.score / last.total) * 100)
    : null;

  return (
    <Link
      href={`/alumno/actividades/${activity.id}`}
      className="group block overflow-hidden rounded-lg border border-rule bg-white transition hover:border-navy hover:shadow-md"
    >
      {/* Barra superior con nivel */}
      <div className="flex items-center justify-between border-b border-rule bg-paper px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-navy">
          {activity.level} · {activity.exam_part?.name ?? "Actividad"}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
            DIFFICULTY_COLORS[activity.difficulty]
          }`}
        >
          {DIFFICULTY_LABELS[activity.difficulty]}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-ink group-hover:text-navy">
          {activity.title}
        </h3>
        {activity.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">
            {activity.description}
          </p>
        )}

        {/* Metadatos */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {activity.estimated_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            8 preguntas
          </span>
        </div>

        {/* Estado: último intento o nuevo */}
        {hasAttempt ? (
          <div className="mt-4 rounded-md bg-paper px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Última nota</span>
              <span
                className={`text-sm font-bold ${
                  percentage! >= 65 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {last!.score}/{last!.total} · {percentage}%
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-saffron/40 bg-saffron/5 px-3 py-2 text-center">
            <span className="text-xs font-medium text-saffron">
              ✨ Nueva · pulsa para empezar
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
