import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Circle,
  MinusCircle,
  PenLine,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestionType } from "@/lib/supabase/types";

/**
 * Vista de revisión pregunta a pregunta.
 * El alumno ve sus respuestas junto a las correctas (excepto Writings, que
 * quedan como texto libre para su lectura).
 */
export default async function RevisarExamenPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: attempt } = await admin
    .from("attempts")
    .select("id, student_id, status, exams(id, title, level, total_time_minutes)")
    .eq("id", params.attemptId)
    .maybeSingle();

  if (!attempt) notFound();
  const isOwner = attempt.student_id === user.id;
  const isSuperAdmin = user.profile.role === "super_admin";
  const isTeacher = user.profile.role === "teacher" || user.profile.role === "academy_admin";
  if (!isOwner && !isSuperAdmin && !isTeacher) notFound();

  const examData = Array.isArray(attempt.exams) ? attempt.exams[0] : attempt.exams;

  // No permitir revisar hasta que esté corregido al menos parcialmente
  if (attempt.status === "in_progress") {
    redirect(`/alumno/examen/${attempt.id}`);
  }

  // Cargar partes + preguntas + opciones + respuestas del alumno
  const { data: parts } = await admin
    .from("exam_parts")
    .select("id, part_number, title, skill, order_index, settings")
    .eq("exam_id", examData?.id)
    .order("order_index", { ascending: true });

  const partIds = (parts ?? []).map((p) => p.id);

  const [{ data: questions }, { data: options }, { data: answers }] = await Promise.all([
    admin
      .from("questions")
      .select("id, part_id, question_number, question_type, stem, context, correct_answer, order_index")
      .in("part_id", partIds)
      .order("order_index", { ascending: true }),
    admin
      .from("question_options")
      .select("id, question_id, letter, text, is_correct, order_index")
      .order("order_index", { ascending: true }),
    admin
      .from("answers")
      .select("question_id, answer_text, selected_option_id, is_correct, points_earned")
      .eq("attempt_id", attempt.id),
  ]);

  // Mapa de opciones por pregunta
  const optionsByQ = new Map<
    string,
    Array<{ id: string; letter: string; text: string; is_correct: boolean }>
  >();
  for (const o of options ?? []) {
    const arr = optionsByQ.get(o.question_id) ?? [];
    arr.push(o);
    optionsByQ.set(o.question_id, arr);
  }

  // Mapa de respuestas por pregunta
  const answersByQ = new Map(
    (answers ?? []).map((a) => [a.question_id, a])
  );

  const backLink =
    user.profile.role === "student"
      ? "/alumno/examen/" + attempt.id + "/enviado"
      : "/profesor/simulacros/" + attempt.id;

  return (
    <div className="min-h-screen bg-paper px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={backLink}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a los resultados
        </Link>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-muted">
            Revisión · {examData?.level}
          </p>
          <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
            {examData?.title}
          </h1>
          <p className="text-sm text-muted mt-2">
            Repasa tus respuestas pregunta a pregunta.
          </p>
        </header>

        {/* Leyenda */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-ok" />
            Correcto
          </span>
          <span className="inline-flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-bad" />
            Incorrecto
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MinusCircle className="h-4 w-4 text-muted" />
            Sin responder
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="h-4 w-4 text-saffron" />
            Writing (revisión manual)
          </span>
        </div>

        {/* Bloques por parte */}
        <div className="space-y-8">
          {(parts ?? []).map((part) => {
            const partQuestions = (questions ?? []).filter(
              (q) => q.part_id === part.id
            );
            const partSettings = (part.settings as Record<string, unknown>) ?? {};
            const readingText = (partSettings.reading_text as string) ?? null;
            const baseText = (partSettings.base_text as string) ?? null;
            const matchingOptions =
              (partSettings.matching_options as Array<{
                letter: string;
                text: string;
              }>) ?? [];

            return (
              <section
                key={part.id}
                className="bg-white rounded-lg border border-rule overflow-hidden"
              >
                <header className="px-5 py-3 border-b border-rule bg-paper">
                  <p className="text-xs uppercase tracking-wider text-muted">
                    Part {part.part_number} · {part.skill}
                  </p>
                  <h2 className="text-lg font-semibold text-ink mt-0.5">
                    {part.title}
                  </h2>
                </header>

                {/* Contenido base compartido */}
                {(readingText || baseText || matchingOptions.length > 0) && (
                  <div className="px-5 py-4 border-b border-rule bg-paper/30">
                    {readingText && (
                      <details className="mb-2">
                        <summary className="cursor-pointer text-xs uppercase tracking-wider text-navy font-medium">
                          Ver texto de lectura
                        </summary>
                        <p className="mt-2 text-sm font-serif whitespace-pre-wrap text-ink leading-relaxed">
                          {readingText}
                        </p>
                      </details>
                    )}
                    {baseText && (
                      <details className="mb-2">
                        <summary className="cursor-pointer text-xs uppercase tracking-wider text-navy font-medium">
                          Ver texto con huecos
                        </summary>
                        <p className="mt-2 text-sm font-serif whitespace-pre-wrap text-ink leading-relaxed">
                          {baseText}
                        </p>
                      </details>
                    )}
                    {matchingOptions.length > 0 && (
                      <details>
                        <summary className="cursor-pointer text-xs uppercase tracking-wider text-navy font-medium">
                          Ver textos matcheables (A–{matchingOptions[matchingOptions.length - 1].letter})
                        </summary>
                        <ul className="mt-2 space-y-2 text-sm">
                          {matchingOptions.map((o) => (
                            <li key={o.letter} className="flex gap-3">
                              <span className="font-mono font-semibold text-navy w-5 shrink-0">
                                {o.letter}
                              </span>
                              <span className="text-ink">{o.text}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}

                {/* Lista de preguntas */}
                <div className="divide-y divide-rule">
                  {partQuestions.map((q) => (
                    <QuestionReview
                      key={q.id}
                      question={q}
                      options={optionsByQ.get(q.id) ?? []}
                      answer={answersByQ.get(q.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componente por pregunta ────────────────────────────────────
function QuestionReview({
  question,
  options,
  answer,
}: {
  question: {
    id: string;
    question_number: number;
    question_type: string;
    stem: string;
    context: Record<string, unknown>;
    correct_answer: string | null;
  };
  options: Array<{ id: string; letter: string; text: string; is_correct: boolean }>;
  answer:
    | {
        answer_text: string | null;
        selected_option_id: string | null;
        is_correct: boolean | null;
        points_earned: number | null;
      }
    | undefined;
}) {
  const type = question.question_type as QuestionType;
  const isWriting = type === "writing_task";
  const isUnanswered =
    !answer ||
    (!answer.selected_option_id && (!answer.answer_text || !answer.answer_text.trim()));

  // Icono de estado
  let StatusIcon = Circle;
  let statusColor = "text-muted";
  let statusLabel = "";

  if (isWriting) {
    StatusIcon = PenLine;
    statusColor = "text-saffron";
    statusLabel = "Writing";
  } else if (isUnanswered) {
    StatusIcon = MinusCircle;
    statusColor = "text-muted";
    statusLabel = "Sin responder";
  } else if (answer?.is_correct) {
    StatusIcon = CheckCircle2;
    statusColor = "text-ok";
    statusLabel = "Correcto";
  } else {
    StatusIcon = XCircle;
    statusColor = "text-bad";
    statusLabel = "Incorrecto";
  }

  const noticeText = (question.context as { notice_text?: string })?.notice_text;

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-3">
        <StatusIcon className={`h-5 w-5 ${statusColor} shrink-0 mt-1`} />
        <div className="flex-1 min-w-0">
          {/* Notice si aplica (Part 1 A2 style) */}
          {noticeText && (
            <div className="mb-2 p-2 rounded bg-paper border border-rule text-xs font-serif text-ink whitespace-pre-wrap">
              {noticeText}
            </div>
          )}

          {/* Enunciado */}
          <p className="text-sm text-ink">
            <span className="font-mono font-semibold text-navy mr-2">
              {question.question_number}.
            </span>
            {question.stem}
          </p>

          {/* Cuerpo según tipo */}
          {(type === "multiple_choice" || type === "multiple_choice_cloze") && (
            <div className="mt-3 space-y-1">
              {options.map((opt) => {
                const isStudentChoice = answer?.selected_option_id === opt.id;
                const isCorrectOption = opt.is_correct;
                let cls = "border-rule bg-white text-ink";
                if (isCorrectOption && isStudentChoice) {
                  cls = "border-ok bg-ok/10 text-ink";
                } else if (isCorrectOption) {
                  cls = "border-ok/60 bg-ok/5 text-ink";
                } else if (isStudentChoice) {
                  cls = "border-bad bg-bad/10 text-ink";
                }
                return (
                  <div
                    key={opt.id}
                    className={`flex items-start gap-2 rounded border-2 px-3 py-2 text-sm ${cls}`}
                  >
                    <span className="font-mono font-medium text-navy w-5 shrink-0">
                      {opt.letter}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {isStudentChoice && (
                      <span className="text-xs text-muted shrink-0">Tu respuesta</span>
                    )}
                    {isCorrectOption && !isStudentChoice && (
                      <span className="text-xs text-ok font-medium shrink-0">
                        Correcta
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {(type === "open_cloze" ||
            type === "word_formation" ||
            type === "key_word_transformation") && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="rounded border border-rule bg-paper px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-muted mb-0.5">
                  Tu respuesta
                </p>
                <p className={`font-mono ${answer?.is_correct ? "text-ok" : answer?.answer_text ? "text-bad" : "text-muted"}`}>
                  {answer?.answer_text || "— sin responder —"}
                </p>
              </div>
              <div className="rounded border border-ok/30 bg-ok/5 px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-muted mb-0.5">
                  Correcta
                </p>
                <p className="font-mono text-ok">
                  {question.correct_answer?.split("|").join(" / ") ?? "—"}
                </p>
              </div>
            </div>
          )}

          {(type === "multiple_matching" ||
            type === "cross_text_multiple_matching") && (
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="rounded border border-rule bg-paper px-3 py-2 flex-1">
                <span className="text-xs uppercase tracking-wider text-muted mr-2">
                  Tu respuesta:
                </span>
                <span className={`font-mono font-semibold ${answer?.is_correct ? "text-ok" : answer?.answer_text ? "text-bad" : "text-muted"}`}>
                  {answer?.answer_text || "— sin responder —"}
                </span>
              </div>
              <div className="rounded border border-ok/30 bg-ok/5 px-3 py-2 flex-1">
                <span className="text-xs uppercase tracking-wider text-muted mr-2">
                  Correcta:
                </span>
                <span className="font-mono font-semibold text-ok">
                  {question.correct_answer ?? "—"}
                </span>
              </div>
            </div>
          )}

          {type === "writing_task" && (
            <div className="mt-3 rounded border border-saffron/30 bg-saffron/5 px-3 py-3">
              <p className="text-xs uppercase tracking-wider text-saffron font-medium mb-2">
                Tu respuesta (pendiente de corrección por tu profesor)
              </p>
              <p className="text-sm text-ink whitespace-pre-wrap font-serif leading-relaxed">
                {answer?.answer_text || (
                  <span className="italic text-muted">— no escribiste nada —</span>
                )}
              </p>
              {answer?.answer_text && (
                <p className="text-xs text-muted mt-2">
                  {answer.answer_text.trim().split(/\s+/).filter(Boolean).length} palabras
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
