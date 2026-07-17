import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadExamForAttempt } from "@/lib/exams/loader";
import { ExamSimulator } from "@/components/simulator/exam-simulator";

/**
 * Página del simulador de examen en curso.
 * Server Component que carga todo el árbol de datos y lo pasa al Client Component.
 */
export default async function AlumnoSimuladorPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const loaded = await loadExamForAttempt(params.attemptId, user.id);
  if (!loaded) notFound();

  // Si el intento ya fue enviado, redirige a la pantalla de "enviado"
  if (loaded.attempt.status !== "in_progress") {
    redirect(`/alumno/examen/${params.attemptId}/enviado`);
  }

  return <ExamSimulator loaded={loaded} />;
}
