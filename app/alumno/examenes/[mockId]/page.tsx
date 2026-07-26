import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { getMockDataForStudent } from "@/lib/papers/status";
import { PaperCardsList } from "@/components/alumno/paper-cards-list";
import { MockProgressBar } from "@/components/alumno/mock-progress-bar";

interface Params {
  params: { mockId: string };
}

export default async function MockPapersPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await getMockDataForStudent(params.mockId, user.id);
  if (!data) notFound();

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
      <PaperCardsList examId={data.exam_id} papers={data.papers} />

      {/* Nota inferior */}
      <p className="text-xs text-muted mt-8 leading-relaxed">
        Empieza por el primer paper. Cuando lo completes, se desbloqueará el
        siguiente. El timer se pausa si cierras el navegador y continúa donde
        lo dejaste al volver.
      </p>
    </div>
  );
}
