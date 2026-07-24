import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, User, FileText, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { WritingCorrectionForm } from "@/components/profesor/writing-correction-form";

/**
 * Interfaz de corrección de un Writing task por el profesor.
 * Muestra:
 *  - Instrucciones + input del alumno a la izquierda
 *  - Rúbrica Cambridge (4 criterios × 0-5) + feedback a la derecha
 *  - Navegación entre writings del intento
 */
export default async function CorregirWritingPage({
  params,
}: {
  params: { attemptId: string; questionId: string };
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

  // Cargar attempt
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, academy_id, student_id, exams(id, title, level)")
    .eq("id", params.attemptId)
    .maybeSingle();

  if (!attempt) notFound();
  if (
    user.profile.role !== "super_admin" &&
    attempt.academy_id !== user.profile.academy_id
  ) {
    notFound();
  }

  const examData = Array.isArray(attempt.exams) ? attempt.exams[0] : attempt.exams;

  // Cargar la pregunta
  const { data: question } = await admin
    .from("questions")
    .select("id, part_id, question_number, stem, context, question_type, exam_parts(part_number, title)")
    .eq("id", params.questionId)
    .maybeSingle();

  if (!question || question.question_type !== "writing_task") notFound();

  const partData = Array.isArray(question.exam_parts)
    ? question.exam_parts[0]
    : question.exam_parts;

  // Cargar la respuesta del alumno
  const { data: answer } = await admin
    .from("answers")
    .select("answer_text")
    .eq("attempt_id", params.attemptId)
    .eq("question_id", params.questionId)
    .maybeSingle();

  // Cargar el alumno
  const { data: student } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", attempt.student_id)
    .maybeSingle();

  // Cargar corrección existente (si la hay)
  const { data: existingCorrection } = await admin
    .from("writing_corrections")
    .select("*")
    .eq("attempt_id", params.attemptId)
    .eq("question_id", params.questionId)
    .maybeSingle();

  // Cargar todos los writing tasks del intento para navegación
  const { data: allWritingQuestions } = await admin
    .from("questions")
    .select("id, question_number, part_id, exam_parts!inner(exam_id, part_number)")
    .eq("exam_parts.exam_id", examData?.id)
    .eq("question_type", "writing_task")
    .order("question_number", { ascending: true });

  // Estado de corrección de cada writing
  const { data: allCorrections } = await admin
    .from("writing_corrections")
    .select("question_id, status, total_score")
    .eq("attempt_id", params.attemptId);

  const correctionByQuestion = new Map(
    (allCorrections ?? []).map((c) => [c.question_id, c])
  );

  const currentIndex = (allWritingQuestions ?? []).findIndex(
    (q) => q.id === params.questionId
  );
  const previousQ =
    currentIndex > 0 ? (allWritingQuestions ?? [])[currentIndex - 1] : null;
  const nextQ =
    currentIndex >= 0 && currentIndex < (allWritingQuestions?.length ?? 0) - 1
      ? (allWritingQuestions ?? [])[currentIndex + 1]
      : null;

  const ctx = (question.context as Record<string, unknown>) ?? {};
  const notes = Array.isArray(ctx.notes) ? (ctx.notes as string[]) : [];
  const openingSentence = typeof ctx.opening_sentence === "string" ? ctx.opening_sentence : null;
  const wordCount = answer?.answer_text
    ? answer.answer_text.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const wordMin = typeof ctx.word_count_min === "number" ? ctx.word_count_min : 0;
  const wordMax = typeof ctx.word_count_max === "number" ? ctx.word_count_max : 0;

  return (
    <div className="px-6 md:px-8 py-6 max-w-7xl">
      <Link
        href={`/profesor/simulacros/${params.attemptId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al intento
      </Link>

      {/* Header con alumno + navegación entre writings */}
      <header className="bg-white rounded-lg border border-rule p-4 mb-5 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-navy" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">
              {student?.full_name ?? "Alumno"}
            </p>
            <p className="text-xs text-muted">
              {examData?.title} · Part {partData?.part_number ?? "—"} · Q
              {question.question_number}
            </p>
          </div>
        </div>

        {/* Navegación entre writings */}
        {(allWritingQuestions?.length ?? 0) > 1 && (
          <div className="flex items-center gap-2 text-xs">
            {(allWritingQuestions ?? []).map((q, i) => {
              const isCurrent = q.id === params.questionId;
              const isCorrected = correctionByQuestion.get(q.id)?.status === "completed";
              return (
                <Link
                  key={q.id}
                  href={`/profesor/simulacros/${params.attemptId}/writing/${q.id}`}
                  className={`inline-flex items-center gap-1 h-8 px-3 rounded font-medium transition-colors ${
                    isCurrent
                      ? "bg-navy text-white"
                      : isCorrected
                      ? "bg-ok/10 text-ok border border-ok/30 hover:bg-ok/20"
                      : "bg-paper text-muted border border-rule hover:border-navy/40"
                  }`}
                >
                  Writing {i + 1}
                  {isCorrected && !isCurrent && " ✓"}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Grid: instrucciones + respuesta a la izquierda, rúbrica a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Columna izquierda: task + respuesta */}
        <div className="lg:col-span-3 space-y-5">
          {/* Task */}
          <div className="bg-white rounded-lg border border-rule p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-navy" />
              <h2 className="text-xs uppercase tracking-wider text-muted font-medium">
                Tarea propuesta
              </h2>
            </div>
            <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
              {question.stem}
            </p>

            {notes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-rule">
                <p className="text-xs uppercase tracking-wider text-muted mb-2 font-medium">
                  Notas a cubrir
                </p>
                <ul className="text-sm text-ink space-y-1">
                  {notes.map((n, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-navy">•</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {openingSentence && (
              <div className="mt-3 pt-3 border-t border-rule">
                <p className="text-xs uppercase tracking-wider text-muted mb-1 font-medium">
                  Frase inicial obligatoria
                </p>
                <p className="text-sm text-ink font-serif italic">
                  &ldquo;{openingSentence}&rdquo;
                </p>
              </div>
            )}

            {(wordMin || wordMax) && (
              <div className="mt-3 pt-3 border-t border-rule">
                <p className="text-xs text-muted">
                  Palabras esperadas:{" "}
                  <strong className="text-ink">
                    {wordMin}–{wordMax}
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* Respuesta del alumno */}
          <div className="bg-white rounded-lg border border-rule p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs uppercase tracking-wider text-muted font-medium">
                Respuesta del alumno
              </h2>
              <span
                className={`text-xs font-mono ${
                  wordCount === 0
                    ? "text-muted"
                    : wordMin && wordCount < wordMin
                    ? "text-saffron"
                    : wordMax && wordCount > wordMax
                    ? "text-bad"
                    : "text-ok"
                }`}
              >
                {wordCount} palabras
                {wordMin && wordMax && ` · rango ${wordMin}–${wordMax}`}
              </span>
            </div>
            {answer?.answer_text ? (
              <p className="text-[15px] text-ink whitespace-pre-wrap font-serif leading-relaxed">
                {answer.answer_text}
              </p>
            ) : (
              <p className="text-sm text-muted italic">
                El alumno no escribió respuesta.
              </p>
            )}
          </div>
        </div>

        {/* Columna derecha: rúbrica */}
        <div className="lg:col-span-2">
          <WritingCorrectionForm
            attemptId={params.attemptId}
            questionId={params.questionId}
            existing={existingCorrection}
            nextWritingId={nextQ?.id ?? null}
            attemptDetailUrl={`/profesor/simulacros/${params.attemptId}`}
          />
        </div>
      </div>

      {/* Navegación inferior entre writings */}
      {(previousQ || nextQ) && (
        <div className="mt-6 flex items-center justify-between">
          {previousQ ? (
            <Link
              href={`/profesor/simulacros/${params.attemptId}/writing/${previousQ.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Writing anterior
            </Link>
          ) : (
            <span />
          )}
          {nextQ ? (
            <Link
              href={`/profesor/simulacros/${params.attemptId}/writing/${nextQ.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy"
            >
              Siguiente writing
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
