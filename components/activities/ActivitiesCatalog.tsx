"use client";

/**
 * Catálogo de actividades: agrupa por skill y permite filtrar.
 * Carga desde /api/activities (que filtra por nivel del perfil).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ActivityCard } from "./ActivityCard";
import type { Activity, CambridgeSkill } from "@/lib/activities/types";

type ActivityWithExtras = Activity & {
  exam_part?: { id: number; slug: string; name: string; part_number: number };
  last_attempt?: { score: number; total: number; submitted_at: string } | null;
};

const SKILL_ORDER: Array<{ key: CambridgeSkill; label: string }> = [
  { key: "reading", label: "Reading" },
  { key: "use_of_english", label: "Use of English" },
  { key: "writing", label: "Writing" },
  { key: "listening", label: "Listening" },
];

export function ActivitiesCatalog() {
  const [activities, setActivities] = useState<ActivityWithExtras[]>([]);
  const [level, setLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<CambridgeSkill | "all">("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/activities");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Error al cargar actividades");
          setLoading(false);
          return;
        }
        setActivities(data.activities ?? []);
        setLevel(data.level ?? null);
        setLoading(false);
      } catch (e) {
        setError("Error de conexión");
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-sm">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-saffron border-t-transparent" />
        <p className="mt-3 text-sm text-muted">Cargando actividades…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!level || activities.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-ink">
          {!level
            ? "Añade tu nivel Cambridge a tu perfil"
            : "Aún no hay actividades para tu nivel"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {!level
            ? "Para ver actividades filtradas, dinos qué nivel preparas desde tu perfil."
            : "Estamos añadiendo actividades para " + level + ". Vuelve pronto."}
        </p>
      </div>
    );
  }

  // Agrupar por skill
  const bySkill: Record<string, ActivityWithExtras[]> = {};
  activities.forEach((a) => {
    const key = a.skill ?? "other";
    (bySkill[key] = bySkill[key] ?? []).push(a);
  });

  const filtered =
    selectedSkill === "all"
      ? activities
      : activities.filter((a) => a.skill === selectedSkill);

  // Stats resumen
  const completed = activities.filter((a) => a.last_attempt).length;
  const total = activities.length;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="rounded-lg bg-navy p-5 text-white sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-saffron">
              Tu nivel: {level}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {total} actividades · {completed} completadas
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-saffron transition-all"
                style={{
                  width:
                    total === 0 ? "0%" : `${Math.round((completed / total) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-right text-xs text-white/70">
              {total === 0 ? 0 : Math.round((completed / total) * 100)}% progreso
            </p>
          </div>
        </div>
      </div>

      {/* Filtros de skill */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedSkill("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            selectedSkill === "all"
              ? "border-navy bg-navy text-white"
              : "border-rule bg-white text-ink hover:border-navy"
          }`}
        >
          Todas ({activities.length})
        </button>
        {SKILL_ORDER.map((s) => {
          const count = (bySkill[s.key] ?? []).length;
          if (count === 0) return null;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSelectedSkill(s.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                selectedSkill === s.key
                  ? "border-navy bg-navy text-white"
                  : "border-rule bg-white text-ink hover:border-navy"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid de actividades */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg bg-white p-8 text-center text-sm text-muted shadow-sm">
          No hay actividades para este filtro todavía.
        </div>
      )}
    </div>
  );
}
