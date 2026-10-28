/**
 * /alumno/actividades
 *
 * Catálogo de actividades del alumno, filtrado por su nivel declarado.
 * Agrupadas por skill (Reading, Use of English, Writing, Listening).
 */

import type { Metadata } from "next";
import { ActivitiesCatalog } from "@/components/activities/ActivitiesCatalog";

export const metadata: Metadata = {
  title: "Actividades · Acertlio",
  description: "Practica partes específicas del examen Cambridge con actividades cortas de 8 preguntas.",
  robots: { index: false, follow: false },
};

export default function ActividadesPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-saffron">
            Práctica guiada
          </p>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">
            Actividades preparatorias
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Ejercicios cortos de 8 preguntas enfocados en una parte específica
            del examen. En formato examen: sin feedback hasta terminar.
          </p>
        </header>

        <ActivitiesCatalog />
      </div>
    </div>
  );
}
