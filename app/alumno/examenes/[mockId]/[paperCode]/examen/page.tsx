import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/user";

interface Params {
  params: { mockId: string; paperCode: string };
}

/**
 * Placeholder del simulador. La Fase 6C construirá el simulador de examen
 * real con esta interfaz:
 *
 *   [Header: Acertlio · Nombre Mock · Paper · TIMER]
 *   [Contenido de la Part actual — pregunta con opciones]
 *   [Footer: Part 1 / Part 2 / Part 3 · botones de navegación]
 *
 * Por ahora sirve para verificar que el flujo tarjetas → instrucciones →
 * arrancar paper funciona bien.
 */
export default async function ExamenPaperPlaceholder({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createAdminClient();

  const { data: exam } = await admin
    .from("exams")
    .select("id, title, level, mock_number")
    .eq("id", params.mockId)
    .maybeSingle();

  if (!exam) notFound();

  const { data: paper } = await admin
    .from("exam_papers")
    .select("id, code, title, duration_minutes")
    .eq("exam_id", exam.id)
    .eq("code", params.paperCode)
    .maybeSingle();

  if (!paper) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border border-rule rounded-lg p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-saffron/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-saffron" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-saffron font-medium">
              Simulador en construcción
            </p>
            <h1 className="text-lg font-semibold text-ink">
              Fase 6C — Próxima sesión
            </h1>
          </div>
        </div>

        <div className="rounded bg-paper border border-rule p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Examen:</span>
            <span className="text-ink font-medium">{exam.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Paper:</span>
            <span className="text-ink font-medium">{paper.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Nivel:</span>
            <span className="text-ink font-medium">{exam.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Duración:</span>
            <span className="text-ink font-medium">{paper.duration_minutes} min</span>
          </div>
        </div>

        <p className="text-sm text-ink mb-2 font-medium">
          El flujo hasta aquí funciona correctamente.
        </p>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          Se ha creado tu <code className="text-xs bg-paper px-1 rounded">paper_attempt</code>{" "}
          con estado <code className="text-xs bg-paper px-1 rounded">in_progress</code> y
          el timer arrancó. En la próxima sesión construiremos el simulador
          completo aquí mismo (misma URL, misma ruta).
        </p>

        <Link
          href={`/alumno/examenes/${exam.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-navy hover:text-ink font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a los papers del mock
        </Link>
      </div>
    </div>
  );
}
