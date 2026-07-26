import type { Metadata } from "next";
import "@/app/globals.css";

/**
 * Layout minimal para la vista del simulador de examen.
 *
 * A diferencia del layout general del alumno, este:
 *   - No muestra la barra lateral con menú de la cuenta
 *   - No muestra el header con nombre de academia
 *   - No permite distracciones
 *
 * Sólo se ve la interfaz del examen. Como Inspera.
 *
 * El layout de examen específico (barra de parts abajo, timer arriba,
 * herramientas) se implementará en la Fase 6C dentro del propio page.tsx.
 */
export const metadata: Metadata = {
  title: "Examen · Acertlio",
  robots: { index: false, follow: false },
};

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {children}
    </div>
  );
}
