"use client";

/**
 * MockRecommendationCTA
 *
 * Componente para integrar en la pantalla de resultados de un mock.
 * Muestra un CTA grande con las actividades recomendadas basadas en la
 * parte más floja del mock.
 *
 * Uso en tu pantalla de resultados de mock:
 *
 *   <MockRecommendationCTA
 *     level="B2"
 *     weakPartSlug="b2-reading-part-5"
 *     weakPartName="Reading Part 5"
 *     weakPartScore={40}
 *     mockAttemptId="uuid-del-mock-attempt"
 *   />
 *
 * Si no sabes todavía qué parte fue la más floja, puedes pasar solo level
 * y mockAttemptId; el endpoint hará lo que pueda con esa información.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Activity, CambridgeLevel } from "@/lib/activities/types";

type RecommendedActivity = Activity & {
  recommendation_reason: string;
  exam_part?: { id: number; slug: string; name: string; part_number: number };
};

type Props = {
  level: CambridgeLevel;
  weakPartSlug?: string;
  weakPartName?: string;
  weakPartScore?: number; // porcentaje 0-100
  mockAttemptId?: string;
  limit?: number;
};

export function MockRecommendationCTA({
  level,
  weakPartSlug,
  weakPartName,
  weakPartScore,
  mockAttemptId,
  limit = 3,
}: Props) {
  const [recs, setRecs] = useState<RecommendedActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams();
      params.set("level", level);
      params.set("limit", String(limit));
      if (weakPartSlug) params.set("weak_part_slug", weakPartSlug);
      if (mockAttemptId) params.set("mock_attempt_id", mockAttemptId);

      try {
        const res = await fetch(`/api/activities/recommendations?${params}`);
        const data = await res.json();
        setRecs(data.recommendations ?? []);
      } catch {
        // falla silenciosa: no bloquea la pantalla de resultados del mock
      } finally {
        setLoading(false);
      }
    })();
  }, [level, weakPartSlug, mockAttemptId, limit]);

  if (loading) {
    return (
      <div className="rounded-xl bg-navy p-8 text-white">
        <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  if (recs.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl bg-navy text-white shadow-lg">
      {/* Barra superior saffron */}
      <div className="h-1.5 bg-saffron" />

      <div className="p-6 sm:p-8">
        {/* Título principal */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-saffron text-navy">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-saffron">
              Recomendado para ti
            </p>
            <h3 className="mt-1 text-xl font-bold sm:text-2xl">
              {weakPartName ? (
                <>
                  Mejora en{" "}
                  <span className="text-saffron">{weakPartName}</span>
                </>
              ) : (
                "Sigue practicando con estas actividades"
              )}
            </h3>
            {weakPartName && weakPartScore !== undefined && (
              <p className="mt-2 text-white/80">
                Tu puntuación en esa parte fue{" "}
                <strong className="font-bold">{weakPartScore}%</strong>. Estas{" "}
                {recs.length} actividades están diseñadas para que subas esa nota.
              </p>
            )}
            {!weakPartName && (
              <p className="mt-2 text-white/80">
                Práctica dirigida basada en tu progreso. Cada actividad es de 8
                preguntas y te lleva unos 10 minutos.
              </p>
            )}
          </div>
        </div>

        {/* Lista de actividades recomendadas */}
        <div className="space-y-3">
          {recs.map((act) => (
            <Link
              key={act.id}
              href={`/alumno/actividades/${act.id}?source=post_mock_recommendation${
                mockAttemptId ? `&mock_attempt_id=${mockAttemptId}` : ""
              }`}
              className="flex items-center justify-between gap-4 rounded-lg bg-white/10 px-4 py-3 transition hover:bg-white/20"
            >
              <div className="flex-1">
                <p className="text-xs text-white/70">
                  {act.exam_part?.name} · {act.estimated_minutes} min
                </p>
                <p className="mt-0.5 font-semibold text-white">{act.title}</p>
                {act.description && (
                  <p className="mt-1 line-clamp-1 text-sm text-white/70">
                    {act.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 rounded-md bg-saffron px-3 py-1.5 text-xs font-bold text-navy transition group-hover:bg-saffron/80">
                  Empezar →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Nota al pie */}
        <p className="mt-5 text-center text-xs text-white/60">
          Cada actividad = 8 preguntas en modo examen · feedback detallado al terminar
        </p>
      </div>
    </div>
  );
}
