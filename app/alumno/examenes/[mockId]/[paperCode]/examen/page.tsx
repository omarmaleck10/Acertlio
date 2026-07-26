import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadSimulatorData } from "@/lib/exam/loader";
import { ExamSimulator } from "@/components/simulador/exam-simulator";

interface Params {
  params: { mockId: string; paperCode: string };
}

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

  // Si no hay datos válidos (paper no existe, no está disponible, o no hay
  // intento en curso), redirigir a la pantalla de tarjetas
  if (!data) {
    redirect(`/alumno/examenes/${params.mockId}`);
  }

  return <ExamSimulator data={data} />;
}
