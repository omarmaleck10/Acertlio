import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/user";

interface Params {
  params: { mockId: string; paperCode: string };
}

/**
 * Placeholder de la pantalla "Ver mi resultado" de un paper.
 * Se construirá completa en la Fase 6C (junto al simulador y sus resultados).
 */
export default async function PaperResultPlaceholder({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createAdminClient();

  const { data: exam } = await admin
    .from("exams")
    .select("id, title")
    .eq("id", params.mockId)
    .maybeSingle();

  if (!exam) notFound();

  const { data: paper } = await admin
    .from("exam_papers")
    .select("id, code, title")
    .eq("exam_id", exam.id)
    .eq("code", params.paperCode)
    .maybeSingle();

  if (!paper) notFound();

  return (
    <div className="px-6 md:px-8 py-8 max-w-3xl">
      <Link
        href={`/alumno/examenes/${exam.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al mock
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-navy font-medium">
          Resultado · {paper.title}
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          {exam.title}
        </h1>
      </header>

      <div className="bg-white rounded-lg border border-rule p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-saffron/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-saffron" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">
              Pantalla de resultados en construcción
            </p>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              En la siguiente sesión implementaremos la vista de detalle del
              resultado: aciertos por Part, respuestas del alumno vs
              respuestas correctas, y explicaciones para cada pregunta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
