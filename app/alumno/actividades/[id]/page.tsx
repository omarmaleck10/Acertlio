/**
 * /alumno/actividades/[id]
 *
 * Pantalla donde el alumno hace la actividad. Modo examen: sin feedback
 * hasta terminar las 8 preguntas.
 */

import type { Metadata } from "next";
import { ActivityPlayer } from "@/components/activities/ActivityPlayer";

export const metadata: Metadata = {
  title: "Haciendo actividad · Acertlio",
  robots: { index: false, follow: false },
};

export default function ActivityPlayerPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <ActivityPlayer activityId={params.id} />
      </div>
    </div>
  );
}
