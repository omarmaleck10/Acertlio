import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Circle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { TogglePublishButton } from "@/components/admin/toggle-publish-button";
import {
  LEVEL_LABELS,
  SKILL_LABELS,
  QUESTION_TYPE_LABELS,
  getExamFormat,
} from "@/lib/exams/formats";
import type { CambridgeLevel, QuestionType } from "@/lib/supabase/types";

export default async function AdminExamenDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "super_admin") redirect("/login");

  const admin = createAdminClient();

  const { data: exam } = await admin
    .from("exams")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!exam) notFound();

  const { data: parts } = await admin
    .from("exam_parts")
    .select("*")
    .eq("exam_id", exam.id)
    .order("order_index", { ascending: true });

  // Contar preguntas por parte
  const partsWithCounts = await Promise.all(
    (parts ?? []).map(async (p) => {
      const { count } = await admin
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("part_id", p.id);
      return { ...p, questionCount: count ?? 0 };
    })
  );

  const format = getExamFormat(exam.level as CambridgeLevel);

  const totalExpected = format.parts.reduce(
    (sum, p) => sum + p.questionCount,
    0
  );
  const totalActual = partsWithCounts.reduce(
    (sum, p) => sum + p.questionCount,
    0
  );

  return (
    <div className="px-8 py-8 max-w-5xl">
      <Link
        href="/admin/examenes"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono px-2 py-1 rounded bg-navy-50 text-navy">
              {exam.level}
            </span>
            {exam.is_published ? (
              <span className="text-xs font-medium text-ok inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Publicado
              </span>
            ) : (
              <span className="text-xs font-medium text-saffron inline-flex items-center gap-1">
                <Circle className="h-3.5 w-3.5" />
                Borrador
              </span>
            )}
          </div>
          <h1 className="font-semibold text-3xl text-ink tracking-tight">
            {exam.title}
          </h1>
          {exam.description && (
            <p className="text-sm text-muted mt-3 max-w-3xl leading-relaxed">
              {exam.description}
            </p>
          )}
        </div>
        <TogglePublishButton examId={exam.id} isPublished={exam.is_published} />
      </header>

      {/* Metadata en fila */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <MetaCard
          label="Nivel"
          value={LEVEL_LABELS[exam.level as CambridgeLevel]}
        />
        <MetaCard
          label="Tiempo total"
          value={`${exam.total_time_minutes} min`}
          icon={<Clock className="h-3.5 w-3.5" />}
        />
        <MetaCard
          label="Preguntas"
          value={`${totalActual} / ${totalExpected}`}
          hint={
            totalActual < totalExpected
              ? `Faltan ${totalExpected - totalActual}`
              : "Completo"
          }
        />
        <MetaCard label="Partes" value={partsWithCounts.length.toString()} />
      </div>

      {/* Aviso si no puede publicar */}
      {!exam.is_published && totalActual < totalExpected && (
        <div className="mb-6 rounded border border-saffron/30 bg-saffron/5 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
          <div className="text-xs text-ink">
            <p className="font-medium mb-0.5">Este examen aún no está completo.</p>
            <p className="text-muted leading-relaxed">
              Faltan {totalExpected - totalActual} preguntas por añadir en total.
              Puedes publicarlo igualmente, pero los alumnos verán las preguntas
              vacías.
            </p>
          </div>
        </div>
      )}

      {/* Lista de partes */}
      <section className="rounded border border-rule bg-white">
        <header className="px-5 py-3 border-b border-rule flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Estructura del examen</h2>
        </header>

        {partsWithCounts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileText className="h-10 w-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted mb-3">
              Este examen no tiene partes todavía.
            </p>
            <p className="text-xs text-muted">
              Necesitarás crear la estructura manualmente. Como alternativa,
              elimina el examen y créalo de nuevo marcando la casilla
              &laquo;Generar estructura automáticamente&raquo;.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-rule">
            {partsWithCounts.map((p) => {
              const formatPart = format.parts.find(
                (fp) =>
                  fp.skill === (p.skill as typeof fp.skill) && fp.partNumber === p.part_number
              );
              const expected = formatPart?.questionCount ?? 0;
              const complete = p.questionCount >= expected && expected > 0;
              const hint = formatPart
                ? (p.settings as { question_type_hint?: string })
                    ?.question_type_hint
                : null;

              return (
                <li key={p.id}>
                  <Link
                    href={`/admin/examenes/${exam.id}/parte/${p.id}`}
                    className="block px-5 py-4 hover:bg-paper transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="font-mono text-xs text-navy w-16 shrink-0">
                        Part {p.part_number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">
                          {p.title ?? "Sin título"}
                        </p>
                        <p className="text-xs text-muted mt-0.5 flex items-center gap-3 flex-wrap">
                          <span>{SKILL_LABELS[p.skill as keyof typeof SKILL_LABELS]}</span>
                          {hint && (
                            <span>
                              ·{" "}
                              {
                                QUESTION_TYPE_LABELS[
                                  hint as QuestionType
                                ]
                              }
                            </span>
                          )}
                          {p.time_minutes && (
                            <span>· {p.time_minutes} min</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-ink">
                          {p.questionCount} / {expected || "?"}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${
                            complete ? "text-ok" : "text-saffron"
                          }`}
                        >
                          {complete
                            ? "Completo"
                            : `Faltan ${
                                expected - p.questionCount
                              }`}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function MetaCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded border border-rule bg-white p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="font-mono text-lg font-semibold text-ink mt-1">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
