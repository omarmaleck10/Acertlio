import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Trophy,
  BookOpen,
  PenLine,
  ArrowRight,
  Info,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CambridgeLevel } from "@/lib/supabase/types";

/**
 * Pantalla de resultados del alumno tras enviar un examen.
 * Muestra puntuación cruda, Cambridge Scale, grade estimado y desglose por parte.
 * Si hay Writing pendiente, lo marca como tal.
 */
export default async function ExamenEnviadoPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Cargar attempt con toda la info del examen
  const { data: attempt } = await admin
    .from("attempts")
    .select(
      "id, student_id, status, submitted_at, time_spent_seconds, raw_score, cambridge_score, estimated_grade, exams(id, title, level, total_time_minutes)"
    )
    .eq("id", params.attemptId)
    .maybeSingle();

  if (!attempt) notFound();
  if (attempt.student_id !== user.id && user.profile.role !== "super_admin") {
    notFound();
  }

  const examData = Array.isArray(attempt.exams) ? attempt.exams[0] : attempt.exams;
  const level = examData?.level as CambridgeLevel;

  // Cargar desglose por parte: partes + preguntas + respuestas del alumno
  const { data: parts } = await admin
    .from("exam_parts")
    .select("id, part_number, title, skill, order_index")
    .eq("exam_id", examData?.id)
    .order("order_index", { ascending: true });

  const partIds = (parts ?? []).map((p) => p.id);

  const [{ data: questions }, { data: answers }, { data: writingCorrections }] = await Promise.all([
    admin
      .from("questions")
      .select("id, part_id, question_type, points, stem")
      .in("part_id", partIds),
    admin
      .from("answers")
      .select("question_id, is_correct, points_earned, answer_text")
      .eq("attempt_id", attempt.id),
    admin
      .from("writing_corrections")
      .select("question_id, content_score, communicative_score, organisation_score, language_score, total_score, feedback, status, corrected_at, teacher_id")
      .eq("attempt_id", attempt.id),
  ]);

  const answersByQ = new Map(
    (answers ?? []).map((a) => [a.question_id, a])
  );
  const correctionsByQ = new Map(
    (writingCorrections ?? []).map((c) => [c.question_id, c])
  );

  // Calcular desglose por parte
  const partBreakdown = (parts ?? []).map((part) => {
    const partQuestions = (questions ?? []).filter((q) => q.part_id === part.id);
    const writingQs = partQuestions.filter(
      (q) => q.question_type === "writing_task"
    );
    const autoQuestions = partQuestions.filter(
      (q) => q.question_type !== "writing_task"
    );
    let correct = 0;
    const total = autoQuestions.length;
    for (const q of autoQuestions) {
      const a = answersByQ.get(q.id);
      if (a?.is_correct) correct++;
    }
    // Info de Writings corregidos en la parte
    let writingScore = 0;
    let writingMax = 0;
    let writingCorrectedCount = 0;
    for (const wq of writingQs) {
      const c = correctionsByQ.get(wq.id);
      writingMax += 20;
      if (c?.status === "completed") {
        writingScore += c.total_score ?? 0;
        writingCorrectedCount++;
      }
    }
    const allWritingsCorrected =
      writingQs.length > 0 && writingCorrectedCount === writingQs.length;

    return {
      id: part.id,
      partNumber: part.part_number,
      title: part.title,
      skill: part.skill,
      correct,
      total,
      writingCount: writingQs.length,
      writingCorrectedCount,
      writingScore,
      writingMax,
      allWritingsCorrected,
      isWritingPart: writingQs.length > 0,
    };
  });

  const submittedAt = attempt.submitted_at ? new Date(attempt.submitted_at) : null;
  const timeSpentMin = Math.round((attempt.time_spent_seconds ?? 0) / 60);
  const isWritingPending = attempt.status === "submitted";
  const isFullyGraded = attempt.status === "fully_graded";
  const hasAutoScore =
    attempt.status === "auto_graded" || attempt.status === "fully_graded";

  // Rango del Cambridge Scale para este nivel (para dibujar la barra)
  const scaleRanges: Record<CambridgeLevel, { min: number; pass: number; max: number }> = {
    A2: { min: 100, pass: 120, max: 150 },
    B1: { min: 120, pass: 140, max: 170 },
    B2: { min: 140, pass: 160, max: 190 },
    C1: { min: 160, pass: 180, max: 210 },
    C2: { min: 180, pass: 200, max: 230 },
  };
  const scale = level ? scaleRanges[level] : null;
  const cambridgeScore = attempt.cambridge_score ?? 0;
  const scalePosition = scale
    ? Math.max(
        0,
        Math.min(100, ((cambridgeScore - scale.min) / (scale.max - scale.min)) * 100)
      )
    : 0;

  const gradeColor: Record<string, string> = {
    Distinction: "text-ok bg-ok/10 border-ok/30",
    Merit: "text-navy bg-navy-50 border-navy/30",
    Pass: "text-saffron bg-saffron/10 border-saffron/30",
    Fail: "text-bad bg-bad/10 border-bad/30",
  };
  const gradeLabel = attempt.estimated_grade ?? "—";
  const gradeCls = gradeColor[gradeLabel] ?? "text-muted bg-paper border-rule";

  const totalRawScore = partBreakdown.reduce((sum, p) => sum + p.correct, 0);
  const maxRawScore = partBreakdown.reduce((sum, p) => sum + p.total, 0);
  const percentage =
    maxRawScore > 0 ? Math.round((totalRawScore / maxRawScore) * 100) : 0;

  return (
    <div className="min-h-screen bg-paper px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ok/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-ok" />
          </div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            Examen enviado y corregido
          </h1>
          <p className="text-sm text-muted mt-2">
            {examData?.title} · {examData?.level}
          </p>
        </header>

        {/* Puntuación global */}
        {hasAutoScore && (
          <section className="bg-white rounded-lg border border-rule p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Puntuación */}
              <div className="text-center md:border-r md:border-rule md:pr-6">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">
                  Puntuación
                </p>
                <p className="text-4xl font-bold text-ink font-mono tabular-nums">
                  {totalRawScore}
                  <span className="text-lg text-muted">/{maxRawScore}</span>
                </p>
                <p className="text-sm text-muted mt-1">{percentage}% de aciertos</p>
              </div>

              {/* Cambridge Scale */}
              <div className="text-center md:border-r md:border-rule md:pr-6">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">
                  Cambridge Scale
                </p>
                <p className="text-4xl font-bold text-navy font-mono tabular-nums">
                  {cambridgeScore}
                </p>
                {scale && (
                  <div className="mt-2">
                    <div className="relative h-1.5 rounded-full bg-rule overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-navy"
                        style={{ width: `${scalePosition}%` }}
                      />
                      <div
                        className="absolute inset-y-0 w-px bg-saffron"
                        style={{
                          left: `${((scale.pass - scale.min) / (scale.max - scale.min)) * 100}%`,
                        }}
                        title="Nota mínima para aprobar"
                      />
                    </div>
                    <p className="text-xs text-muted mt-1 font-mono">
                      {scale.min} — <span className="text-saffron">{scale.pass}</span> —{" "}
                      {scale.max}
                    </p>
                  </div>
                )}
              </div>

              {/* Grade estimado */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">
                  Grade estimado
                </p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${gradeCls} mt-1`}>
                  <Trophy className="h-4 w-4" />
                  <span className="font-semibold">{gradeLabel}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Aviso Writing pendiente */}
        {isWritingPending && (
          <div className="rounded border border-saffron/40 bg-saffron/10 px-5 py-4 mb-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-saffron shrink-0 mt-0.5" />
            <div className="text-sm text-ink">
              <p className="font-medium">
                Tienes preguntas de Writing pendientes de corrección
              </p>
              <p className="text-muted mt-1">
                Las partes de lectura ya están corregidas. Tu profesor revisará el
                Writing y verás la nota final en cuanto lo haga.
              </p>
            </div>
          </div>
        )}

        {isFullyGraded && (
          <div className="rounded border border-ok/40 bg-ok/10 px-5 py-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-ok shrink-0 mt-0.5" />
            <div className="text-sm text-ink">
              <p className="font-medium">Examen totalmente corregido</p>
              <p className="text-muted mt-1">
                Tu profesor ha corregido el Writing. Abajo puedes ver el
                desglose de tu nota por criterio y sus comentarios.
              </p>
            </div>
          </div>
        )}

        {/* Desglose por parte */}
        <section className="bg-white rounded-lg border border-rule overflow-hidden mb-6">
          <header className="px-5 py-3 border-b border-rule bg-paper">
            <h2 className="text-sm font-medium text-ink uppercase tracking-wider">
              Desglose por parte
            </h2>
          </header>
          <div className="divide-y divide-rule">
            {partBreakdown.map((p) => {
              const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
              const writingPct =
                p.writingMax > 0
                  ? Math.round((p.writingScore / p.writingMax) * 100)
                  : 0;
              return (
                <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-16 shrink-0">
                    <p className="text-xs uppercase tracking-wider text-muted">
                      Part {p.partNumber}
                    </p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      {p.isWritingPart ? (
                        <>
                          <PenLine className="h-3 w-3" />
                          Writing
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-3 w-3" />
                          Reading
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{p.title}</p>
                    {p.isWritingPart ? (
                      p.allWritingsCorrected ? (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="relative h-1.5 flex-1 max-w-[240px] rounded-full bg-rule overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 ${
                                writingPct >= 60
                                  ? "bg-ok"
                                  : writingPct >= 40
                                  ? "bg-saffron"
                                  : "bg-bad"
                              }`}
                              style={{ width: `${writingPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted font-mono">
                            {writingPct}%
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-saffron mt-0.5">
                          Pendiente de corrección por tu profesor
                          {p.writingCorrectedCount > 0 &&
                            ` · ${p.writingCorrectedCount}/${p.writingCount} corregidos`}
                        </p>
                      )
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="relative h-1.5 flex-1 max-w-[240px] rounded-full bg-rule overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 ${
                              pct >= 60 ? "bg-ok" : pct >= 40 ? "bg-saffron" : "bg-bad"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted font-mono">{pct}%</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {p.isWritingPart ? (
                      p.allWritingsCorrected ? (
                        <span className="text-sm font-mono text-ink">
                          {p.writingScore}
                          <span className="text-muted">/{p.writingMax}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-saffron font-mono">
                          Pendiente
                        </span>
                      )
                    ) : (
                      <span className="text-sm font-mono text-ink">
                        {p.correct}
                        <span className="text-muted">/{p.total}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Correcciones de Writing (si existen) */}
        {(writingCorrections?.length ?? 0) > 0 && (
          <section className="bg-white rounded-lg border border-rule overflow-hidden mb-6">
            <header className="px-5 py-3 border-b border-rule bg-paper">
              <h2 className="text-sm font-medium text-ink uppercase tracking-wider flex items-center gap-2">
                <PenLine className="h-4 w-4 text-navy" />
                Correcciones de Writing
              </h2>
            </header>
            <div className="divide-y divide-rule">
              {(writingCorrections ?? []).map((c) => {
                // Encontrar la pregunta a la que pertenece esta corrección
                const q = (questions ?? []).find((x) => x.id === c.question_id);
                const summary = q?.stem?.split("\n")[0] ?? "Writing task";
                const criteria = [
                  { key: "Content", score: c.content_score },
                  { key: "Communicative Achievement", score: c.communicative_score },
                  { key: "Organisation", score: c.organisation_score },
                  { key: "Language", score: c.language_score },
                ];
                return (
                  <div key={c.question_id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="text-sm text-ink font-medium line-clamp-1 flex-1">
                        {summary}
                      </p>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold font-mono tabular-nums text-ink">
                          {c.total_score}
                          <span className="text-sm text-muted">/20</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      {criteria.map((cr) => (
                        <div
                          key={cr.key}
                          className="rounded border border-rule bg-paper px-3 py-2"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5 leading-tight">
                            {cr.key}
                          </p>
                          <p className="font-mono text-lg font-semibold text-navy tabular-nums">
                            {cr.score ?? "—"}
                            <span className="text-xs text-muted">/5</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {c.feedback && (
                      <div className="mt-3 rounded border border-navy/20 bg-navy-50/50 px-3 py-2">
                        <p className="text-xs uppercase tracking-wider text-muted mb-1 font-medium">
                          Comentario del profesor
                        </p>
                        <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                          {c.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Metadatos del intento */}
        <section className="bg-white rounded-lg border border-rule p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Enviado</p>
              <p className="text-ink mt-0.5">
                {submittedAt
                  ? submittedAt.toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Tiempo usado
              </p>
              <p className="text-ink mt-0.5">
                {timeSpentMin} min de {examData?.total_time_minutes ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Estado</p>
              <p className="text-ink mt-0.5">
                {isFullyGraded
                  ? "Totalmente corregido"
                  : isWritingPending
                  ? "Writing pendiente"
                  : "Autocorregido"}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/alumno/examen/${attempt.id}/revisar`}
            className="inline-flex items-center gap-2 h-11 px-5 rounded border-2 border-navy text-navy text-sm font-medium hover:bg-navy-50"
          >
            <BookOpen className="h-4 w-4" />
            Revisar respuestas
          </Link>
          <Link
            href="/alumno"
            className="inline-flex items-center gap-2 h-11 px-5 rounded bg-navy text-white text-sm font-medium hover:bg-navy-600"
          >
            Volver a mi dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
