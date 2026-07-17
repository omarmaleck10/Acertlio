import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Trophy,
  BookOpen,
  PenLine,
  User,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CambridgeLevel } from "@/lib/supabase/types";

/**
 * Detalle de un intento visto por el profesor.
 * Muestra puntuación + desglose + accesos rápidos a revisión y corrección.
 */
export default async function ProfesorIntentoDetallePage({
  params,
}: {
  params: { attemptId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    user.profile.role !== "teacher" &&
    user.profile.role !== "academy_admin" &&
    user.profile.role !== "super_admin"
  ) {
    redirect("/");
  }

  const admin = createAdminClient();

  const { data: attempt } = await admin
    .from("attempts")
    .select(
      "id, status, started_at, submitted_at, time_spent_seconds, raw_score, cambridge_score, estimated_grade, academy_id, student_id, exams(id, title, level, mock_number, total_time_minutes)"
    )
    .eq("id", params.attemptId)
    .maybeSingle();

  if (!attempt) notFound();

  // Verificar que el intento es de la academia del profesor (o superadmin)
  if (
    user.profile.role !== "super_admin" &&
    attempt.academy_id !== user.profile.academy_id
  ) {
    notFound();
  }

  const examData = Array.isArray(attempt.exams) ? attempt.exams[0] : attempt.exams;
  const level = examData?.level as CambridgeLevel;

  // Cargar alumno
  const { data: student } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", attempt.student_id)
    .maybeSingle();

  // Cargar partes + preguntas + respuestas para desglose
  const { data: parts } = await admin
    .from("exam_parts")
    .select("id, part_number, title, skill, order_index")
    .eq("exam_id", examData?.id)
    .order("order_index", { ascending: true });

  const partIds = (parts ?? []).map((p) => p.id);
  const [{ data: questions }, { data: answers }] = await Promise.all([
    admin
      .from("questions")
      .select("id, part_id, question_type, points")
      .in("part_id", partIds),
    admin
      .from("answers")
      .select("question_id, is_correct, points_earned, answer_text")
      .eq("attempt_id", attempt.id),
  ]);

  const answersByQ = new Map((answers ?? []).map((a) => [a.question_id, a]));

  const partBreakdown = (parts ?? []).map((part) => {
    const partQuestions = (questions ?? []).filter((q) => q.part_id === part.id);
    const writingQs = partQuestions.filter((q) => q.question_type === "writing_task");
    const autoQs = partQuestions.filter((q) => q.question_type !== "writing_task");
    let correct = 0;
    for (const q of autoQs) {
      const a = answersByQ.get(q.id);
      if (a?.is_correct) correct++;
    }
    return {
      id: part.id,
      partNumber: part.part_number,
      title: part.title,
      skill: part.skill,
      correct,
      total: autoQs.length,
      writingCount: writingQs.length,
      writingAnswered: writingQs.filter((q) => {
        const a = answersByQ.get(q.id);
        return a?.answer_text && a.answer_text.trim();
      }).length,
      isWritingPart: writingQs.length > 0,
    };
  });

  const totalRawScore = partBreakdown.reduce((sum, p) => sum + p.correct, 0);
  const maxRawScore = partBreakdown.reduce((sum, p) => sum + p.total, 0);
  const percentage =
    maxRawScore > 0 ? Math.round((totalRawScore / maxRawScore) * 100) : 0;

  const scaleRanges: Record<CambridgeLevel, { min: number; pass: number; max: number }> = {
    A2: { min: 100, pass: 120, max: 150 },
    B1: { min: 120, pass: 140, max: 170 },
    B2: { min: 140, pass: 160, max: 190 },
    C1: { min: 160, pass: 180, max: 210 },
    C2: { min: 180, pass: 200, max: 230 },
  };
  const scale = level ? scaleRanges[level] : null;
  const cambridgeScore = attempt.cambridge_score ?? 0;

  const isWritingPending = attempt.status === "submitted";
  const submittedAt = attempt.submitted_at ? new Date(attempt.submitted_at) : null;
  const timeSpentMin = Math.round((attempt.time_spent_seconds ?? 0) / 60);

  const gradeColor: Record<string, string> = {
    Distinction: "text-ok bg-ok/10 border-ok/30",
    Merit: "text-navy bg-navy-50 border-navy/30",
    Pass: "text-saffron bg-saffron/10 border-saffron/30",
    Fail: "text-bad bg-bad/10 border-bad/30",
  };
  const gradeLabel = attempt.estimated_grade ?? "—";
  const gradeCls = gradeColor[gradeLabel] ?? "text-muted bg-paper border-rule";

  return (
    <div className="px-6 md:px-8 py-8 max-w-5xl">
      <Link
        href="/profesor/simulacros"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a intentos
      </Link>

      {/* Header con alumno y examen */}
      <header className="bg-white rounded-lg border border-rule p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-navy" />
              <p className="text-lg font-semibold text-ink">
                {student?.full_name ?? "Alumno"}
              </p>
            </div>
            <p className="text-xs text-muted">{student?.email}</p>
            <div className="mt-3 pt-3 border-t border-rule">
              <p className="text-xs uppercase tracking-wider text-muted">Examen</p>
              <p className="text-base text-ink mt-0.5">{examData?.title}</p>
              <p className="text-xs text-muted">
                {examData?.level} · Mock {examData?.mock_number ?? "—"} ·{" "}
                {examData?.total_time_minutes} min
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {isWritingPending && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-sm font-medium">
                <PenLine className="h-4 w-4" />
                Writing pendiente
              </div>
            )}
            {submittedAt && (
              <p className="text-xs text-muted">
                Enviado{" "}
                {submittedAt.toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            <p className="text-xs text-muted inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeSpentMin} min de {examData?.total_time_minutes ?? 0}
            </p>
          </div>
        </div>
      </header>

      {/* Puntuación global */}
      <section className="bg-white rounded-lg border border-rule p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:border-r md:border-rule md:pr-6">
            <p className="text-xs uppercase tracking-wider text-muted mb-1">
              Puntuación
            </p>
            <p className="text-3xl font-bold text-ink font-mono tabular-nums">
              {totalRawScore}
              <span className="text-lg text-muted">/{maxRawScore}</span>
            </p>
            <p className="text-sm text-muted mt-1">{percentage}%</p>
          </div>
          <div className="text-center md:border-r md:border-rule md:pr-6">
            <p className="text-xs uppercase tracking-wider text-muted mb-1">
              Cambridge Scale
            </p>
            <p className="text-3xl font-bold text-navy font-mono tabular-nums">
              {cambridgeScore}
            </p>
            {scale && (
              <p className="text-xs text-muted mt-1 font-mono">
                {scale.min}—<span className="text-saffron">{scale.pass}</span>—{scale.max}
              </p>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted mb-1">
              Grade estimado
            </p>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${gradeCls} mt-1`}
            >
              <Trophy className="h-4 w-4" />
              <span className="font-semibold">{gradeLabel}</span>
            </div>
          </div>
        </div>
      </section>

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
                    <p className="text-xs text-saffron mt-0.5">
                      {p.writingAnswered}/{p.writingCount} respondidos, pendiente
                      de corrección
                    </p>
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
                    <span className="text-sm text-saffron font-mono">Pendiente</span>
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

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/alumno/examen/${attempt.id}/revisar`}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border-2 border-navy text-navy text-sm font-medium hover:bg-navy-50 flex-1"
        >
          <FileText className="h-4 w-4" />
          Revisar respuestas pregunta a pregunta
        </Link>
        {isWritingPending && (
          <div
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-saffron/20 text-saffron border-2 border-saffron/40 text-sm font-medium flex-1 cursor-not-allowed"
            title="Corrección manual del Writing en próxima sesión"
          >
            <ClipboardCheck className="h-4 w-4" />
            Corregir Writing (próximamente)
          </div>
        )}
      </div>
    </div>
  );
}
