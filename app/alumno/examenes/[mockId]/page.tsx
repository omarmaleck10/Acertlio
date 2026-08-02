import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { getMockDataForStudent } from "@/lib/papers/status";
import { PaperCardsList } from "@/components/alumno/paper-cards-list";
import { MockProgressBar } from "@/components/alumno/mock-progress-bar";
import { createAdminClient } from "@/lib/supabase/admin";
import { DebugErrorBoundary } from "@/components/debug-error-boundary";

interface Params {
  params: { mockId: string };
}

// SSR sin cache — datos siempre frescos
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MockPapersPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await getMockDataForStudent(params.mockId, user.id);

  // Si no hay datos, mostrar mensaje explícito en lugar de 404 genérico.
  // El 404 aquí normalmente significa que el examen existe pero sin papers,
  // lo que ocurre cuando se olvida ejecutar la migración de auto-crear papers.
  if (!data) {
    // Diagnóstico: ¿existe el exam? ¿tiene papers?
    const admin = createAdminClient();
    const { data: examExists } = await admin
      .from("exams")
      .select("id, title, level, is_published")
      .eq("id", params.mockId)
      .maybeSingle();

    const { data: papers } = examExists
      ? await admin
          .from("exam_papers")
          .select("id")
          .eq("exam_id", params.mockId)
      : { data: null };

    return (
      <div className="px-6 md:px-8 py-8 max-w-3xl">
        <Link
          href="/alumno"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a mis simulacros
        </Link>

        <div className="rounded border border-saffron/30 bg-saffron/5 p-6">
          <h1 className="text-lg font-semibold text-ink mb-2">
            Este simulacro no está disponible
          </h1>
          <p className="text-sm text-muted mb-4">
            {!examExists
              ? "El simulacro no existe o ha sido despublicado."
              : (papers?.length ?? 0) === 0
              ? "El simulacro existe pero sus secciones no están montadas todavía. Contacta con soporte."
              : "No se puede cargar el simulacro. Intenta recargar la página."}
          </p>

          <details className="text-xs text-muted">
            <summary className="cursor-pointer font-medium">
              Diagnóstico técnico
            </summary>
            <div className="mt-2 space-y-1 font-mono">
              <p>Mock ID: <code>{params.mockId}</code></p>
              <p>Examen existe: <strong>{examExists ? "sí" : "no"}</strong></p>
              {examExists && (
                <>
                  <p>Título: {examExists.title}</p>
                  <p>Nivel: {examExists.level}</p>
                  <p>Publicado: <strong>{examExists.is_published ? "sí" : "no"}</strong></p>
                  <p>Papers creados: <strong>{papers?.length ?? 0}</strong></p>
                </>
              )}
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-3xl">
      {/* Volver */}
      <Link
        href="/alumno"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a mis simulacros
      </Link>

      {/* Header del mock */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-navy font-medium">
          {data.exam_level} · Mock {data.mock_number ?? "—"}
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          {data.exam_title}
        </h1>
      </header>

      {/* Progreso */}
      <div className="mb-8">
        <MockProgressBar
          total={data.total_papers}
          completed={data.completed_papers}
        />
      </div>

      {/* Tarjetas de papers */}
      <DebugErrorBoundary label="lista de papers">
        <PaperCardsList examId={data.exam_id} papers={data.papers} />
      </DebugErrorBoundary>

      {/* Nota inferior */}
      <p className="text-xs text-muted mt-8 leading-relaxed">
        Empieza por el primer paper. Cuando lo completes, se desbloqueará el
        siguiente. El timer se pausa si cierras el navegador y continúa donde
        lo dejaste al volver.
      </p>
    </div>
  );
}
