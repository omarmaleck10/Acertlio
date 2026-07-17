import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Clock, FileText, AlertTriangle, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { startAttemptAction } from "@/app/alumno/examen/actions";
import { StartExamButton } from "@/components/simulator/start-exam-button";

/**
 * Pantalla previa al examen.
 * Muestra información + reglas + botón "Empezar ahora" que crea el attempt.
 */
export default async function ExamenInicioPage({
  params,
}: {
  params: { examId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.profile.role !== "student") {
    redirect("/");
  }

  const admin = createAdminClient();

  const { data: exam } = await admin
    .from("exams")
    .select("id, title, description, level, total_time_minutes, is_published")
    .eq("id", params.examId)
    .maybeSingle();

  if (!exam || !exam.is_published) notFound();

  // ¿Hay un attempt en curso? → redirigir directo al simulador
  const { data: existing } = await admin
    .from("attempts")
    .select("id")
    .eq("exam_id", params.examId)
    .eq("student_id", user.id)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existing) {
    redirect(`/alumno/examen/${existing.id}`);
  }

  // Estadísticas del examen
  const { data: parts } = await admin
    .from("exam_parts")
    .select("id, part_number, title, skill")
    .eq("exam_id", exam.id)
    .order("order_index", { ascending: true });

  return (
    <div className="min-h-screen bg-paper px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/alumno"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <header className="bg-white rounded-lg border border-rule p-8 mb-6">
          <p className="text-xs uppercase tracking-wider text-navy font-medium mb-1">
            {exam.level} · {exam.total_time_minutes} minutos
          </p>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            {exam.title}
          </h1>
          {exam.description && (
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {exam.description}
            </p>
          )}

          {/* Estructura */}
          <div className="mt-6 pt-6 border-t border-rule">
            <p className="text-xs uppercase tracking-wider text-muted font-medium mb-3">
              Partes del examen
            </p>
            <div className="space-y-1.5">
              {(parts ?? []).map((p) => (
                <div key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-navy w-14">Part {p.part_number}</span>
                  <span className="text-ink flex-1">{p.title}</span>
                  <span className="text-xs text-muted uppercase tracking-wider">
                    {p.skill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Reglas */}
        <div className="bg-white rounded-lg border border-rule p-6 mb-6">
          <h2 className="text-sm font-medium text-ink mb-3 uppercase tracking-wider">
            Antes de empezar
          </h2>
          <ul className="space-y-3 text-sm text-ink">
            <li className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-navy shrink-0 mt-0.5" />
              <span>
                El examen dura <strong>{exam.total_time_minutes} minutos</strong>.
                El reloj empieza cuando pulses <em>Empezar</em>. Cuando llegue a 0,
                el examen se enviará automáticamente con las respuestas que hayas dado.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-navy shrink-0 mt-0.5" />
              <span>
                Puedes moverte libremente entre partes y preguntas. Tus respuestas
                se guardan automáticamente cada 15 segundos.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
              <span>
                Si cierras el navegador, podrás continuar donde lo dejaste desde
                tu dashboard, pero el reloj sigue corriendo.
              </span>
            </li>
          </ul>
        </div>

        {/* Botón empezar */}
        <div className="text-center">
          <StartExamButton examId={exam.id} />
          <p className="text-xs text-muted mt-3">
            Al pulsar empezarás el intento y arrancará el temporizador.
          </p>
        </div>
      </div>
    </div>
  );
}
