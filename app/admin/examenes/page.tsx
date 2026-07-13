import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Plus, CheckCircle2, Circle, Clock, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEVEL_LABELS } from "@/lib/exams/formats";
import type { CambridgeLevel } from "@/lib/supabase/types";

export const metadata = { title: "Exámenes" };

export default async function AdminExamenesPage() {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "super_admin") redirect("/login");

  const admin = createAdminClient();

  const { data: exams } = await admin
    .from("exams")
    .select("id, title, level, mock_number, is_published, created_at, updated_at")
    .order("created_at", { ascending: false });

  const examsWithCounts = await Promise.all(
    (exams ?? []).map(async (exam) => {
      const { count } = await admin
        .from("exam_parts")
        .select("*", { count: "exact", head: true })
        .eq("exam_id", exam.id);
      return { ...exam, partCount: count ?? 0 };
    })
  );

  const byLevel: Record<string, number> = {};
  (exams ?? []).forEach((e) => { byLevel[e.level] = (byLevel[e.level] ?? 0) + 1; });

  const levels: CambridgeLevel[] = ["A2", "B1", "B2", "C1", "C2"];

  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Catálogo</p>
          <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">Exámenes</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Los exámenes forman el catálogo compartido con todas las academias.
            Solo los publicados son visibles para profesores y alumnos.
          </p>
        </div>
        <Link href="/admin/examenes/nuevo"
          className="inline-flex items-center gap-2 h-10 px-4 rounded bg-navy text-white text-sm font-medium hover:bg-navy-600">
          <Plus className="h-4 w-4" /> Crear examen
        </Link>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {levels.map((lv) => (
          <div key={lv} className="rounded border border-rule bg-white p-4">
            <p className="text-xs text-muted uppercase tracking-wider">{LEVEL_LABELS[lv]}</p>
            <p className="font-mono text-2xl font-semibold text-ink mt-1">{byLevel[lv] ?? 0}</p>
            <p className="text-xs text-muted">examen{(byLevel[lv] ?? 0) === 1 ? "" : "es"}</p>
          </div>
        ))}
      </div>

      <section className="rounded border border-rule bg-white">
        <header className="px-5 py-3 border-b border-rule">
          <h2 className="text-sm font-medium text-ink">Todos ({examsWithCounts.length})</h2>
        </header>
        {examsWithCounts.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted mb-4">Aún no hay exámenes en el catálogo.</p>
            <Link href="/admin/examenes/nuevo" className="text-sm text-navy hover:underline">
              Crear el primer examen
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-rule">
            {examsWithCounts.map((exam) => (
              <li key={exam.id}>
                <Link href={`/admin/examenes/${exam.id}`}
                  className="block px-5 py-4 hover:bg-paper transition-colors">
                  <div className="flex items-center gap-3 mb-1">
                    {exam.is_published
                      ? <CheckCircle2 className="h-4 w-4 text-ok shrink-0" />
                      : <Circle className="h-4 w-4 text-muted shrink-0" />}
                    <p className="text-sm font-medium text-ink">{exam.title}</p>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-navy-50 text-navy shrink-0">
                      {exam.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted ml-7 flex items-center gap-4 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {exam.partCount} parte{exam.partCount === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Creado {new Date(exam.created_at).toLocaleDateString("es-ES")}
                    </span>
                    {!exam.is_published && (
                      <span className="text-saffron font-medium">No publicado</span>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
