import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadSimulatorData } from "@/lib/exam/loader";
import { ExamSimulator } from "@/components/simulador/exam-simulator";
import { DebugErrorBoundary } from "@/components/debug-error-boundary";

interface Params {
  params: { mockId: string; paperCode: string };
}

// SSR sin cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Página del simulador de examen.
 *
 * Server Component: carga todos los datos que necesita el simulador y los
 * pasa al componente cliente ExamSimulator.
 *
 * Si el alumno no tiene un paper_attempt válido (en curso) para este paper,
 * lo redirige a la pantalla de tarjetas del mock.
 */
export default async function ExamenPaperPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await loadSimulatorData(
    params.mockId,
    params.paperCode,
    user.id
  );

  if (!data) {
    redirect(`/alumno/examenes/${params.mockId}`);
  }

  return (
    <DebugErrorBoundary label="simulador">
      <ExamSimulator data={data} />
    </DebugErrorBoundary>
  );
}
