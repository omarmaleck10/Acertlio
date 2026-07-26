import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadResultData } from "@/lib/exam/result-loader";
import { ResultHeader } from "@/components/resultado/result-header";
import { ResultView } from "@/components/resultado/result-view";

interface Params {
  params: { mockId: string; paperCode: string };
}

/**
 * Pantalla "Ver mi resultado" del paper completado.
 */
export default async function PaperResultPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await loadResultData(
    params.mockId,
    params.paperCode,
    user.id
  );

  if (!data) notFound();

  return (
    <div className="px-6 md:px-8 py-8 max-w-6xl mx-auto">
      {/* Volver */}
      <Link
        href={`/alumno/examenes/${params.mockId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a los papers del mock
      </Link>

      <ResultHeader data={data} />

      <ResultView data={data} />

      {/* Acciones al final */}
      <div className="mt-12 pt-8 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <Link
          href="/alumno"
          className="inline-flex items-center gap-2 rounded border border-rule bg-white px-5 py-2.5 text-sm font-medium text-ink hover:border-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis simulacros
        </Link>
        <Link
          href={`/alumno/examenes/${params.mockId}`}
          className="inline-flex items-center gap-2 rounded bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
        >
          Ver otro paper de este mock
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
