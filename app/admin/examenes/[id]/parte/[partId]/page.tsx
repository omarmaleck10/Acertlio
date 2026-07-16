import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SKILL_LABELS,
  QUESTION_TYPE_LABELS,
  getExamFormat,
} from "@/lib/exams/formats";
import type { CambridgeLevel, QuestionType } from "@/lib/supabase/types";
import { MultipleChoiceEditor } from "@/components/admin/question-editors/multiple-choice-editor";
import { OpenClozeEditor } from "@/components/admin/question-editors/open-cloze-editor";
import { MultipleMatchingEditor } from "@/components/admin/question-editors/multiple-matching-editor";
import { WritingTaskEditor } from "@/components/admin/question-editors/writing-task-editor";
import { PartContextEditor } from "@/components/admin/part-context-editor";
import { AddQuestionButton } from "@/components/admin/add-question-button";

export default async function AdminExamenPartePage({
  params,
}: {
  params: { id: string; partId: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "super_admin") redirect("/login");

  const admin = createAdminClient();

  const { data: part } = await admin
    .from("exam_parts")
    .select("*, exams(id, title, level)")
    .eq("id", params.partId)
    .maybeSingle();

  if (!part) notFound();

  // Todas las preguntas de esta parte + sus opciones
  const { data: questions } = await admin
    .from("questions")
    .select("*, question_options(id, letter, text, is_correct, order_index)")
    .eq("part_id", part.id)
    .order("order_index", { ascending: true });

  const format = getExamFormat(part.exams.level as CambridgeLevel);
  const formatPart = format.parts.find(
    (fp) => fp.skill === part.skill && fp.partNumber === part.part_number
  );

  const settings = (part.settings as Record<string, unknown>) ?? {};
  const questionType = (settings.question_type_hint as QuestionType | undefined)
    ?? (questions?.[0]?.question_type as QuestionType | undefined)
    ?? "multiple_choice";

  const expectedCount = (settings.expected_count as number | undefined)
    ?? formatPart?.questionCount
    ?? 0;

  // Determinar qué contexto base necesita esta parte según el tipo
  const contextKind =
    questionType === "multiple_choice" && (part.skill === "reading" || part.skill === "listening")
      ? "reading_text"
      : questionType === "multiple_choice_cloze" || questionType === "open_cloze" || questionType === "word_formation"
      ? "cloze_base_text"
      : questionType === "multiple_matching" || questionType === "cross_text_multiple_matching"
      ? "matching_options"
      : "writing_only";

  const matchingOptions = (settings.matching_options as Array<{ letter: string; text: string }> | null) ?? [];

  return (
    <div className="px-8 py-8 max-w-5xl">
      <Link
        href={`/admin/examenes/${params.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al examen
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          {part.exams?.title} · Part {part.part_number}
        </p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          {part.title}
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          {SKILL_LABELS[part.skill as keyof typeof SKILL_LABELS]}
          {questionType && ` · ${QUESTION_TYPE_LABELS[questionType]}`}
          {expectedCount > 0 && ` · ${expectedCount} preguntas esperadas`}
        </p>
        {part.instructions && (
          <p className="text-sm text-ink mt-4 p-3 rounded bg-paper border border-rule leading-relaxed">
            <strong className="text-muted uppercase text-xs tracking-wider">
              Focus:
            </strong>{" "}
            {part.instructions}
          </p>
        )}
      </header>

      {/* Contenido base de la parte */}
      {contextKind !== "writing_only" && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-navy" />
            <h2 className="text-sm font-medium text-ink">
              Contenido base de la parte
            </h2>
          </div>
          <PartContextEditor
            partId={part.id}
            kind={contextKind}
            readingText={(settings.reading_text as string) ?? ""}
            clozeBaseText={(settings.base_text as string) ?? ""}
            matchingOptions={matchingOptions}
          />
        </section>
      )}

      {/* Lista de preguntas */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-sm font-medium text-ink">
            Preguntas ({questions?.length ?? 0})
          </h2>
        </div>

        <div className="space-y-4">
          {(questions ?? []).map((q) => {
            const options = (q.question_options ?? [])
              .sort((a: any, b: any) => a.order_index - b.order_index);
            const correctLetter = options.find((o: any) => o.is_correct)?.letter ?? q.correct_answer ?? "";

            if (q.question_type === "multiple_choice" || q.question_type === "multiple_choice_cloze") {
              return (
                <MultipleChoiceEditor
                  key={q.id}
                  questionId={q.id}
                  questionNumber={q.question_number}
                  stem={q.stem ?? ""}
                  options={options}
                  correctLetter={correctLetter}
                  optionCount={format.level === "A2" || format.level === "B1" ? 3 : 4}
                  isCloze={q.question_type === "multiple_choice_cloze"}
                />
              );
            }
            if (q.question_type === "open_cloze" || q.question_type === "word_formation" || q.question_type === "key_word_transformation") {
              return (
                <OpenClozeEditor
                  key={q.id}
                  questionId={q.id}
                  questionNumber={q.question_number}
                  stem={q.stem ?? ""}
                  correctAnswer={q.correct_answer ?? ""}
                />
              );
            }
            if (q.question_type === "multiple_matching" || q.question_type === "cross_text_multiple_matching") {
              return (
                <MultipleMatchingEditor
                  key={q.id}
                  questionId={q.id}
                  questionNumber={q.question_number}
                  stem={q.stem ?? ""}
                  correctAnswer={q.correct_answer ?? ""}
                  matchingOptions={matchingOptions}
                />
              );
            }
            if (q.question_type === "writing_task") {
              return (
                <WritingTaskEditor
                  key={q.id}
                  questionId={q.id}
                  questionNumber={q.question_number}
                  stem={q.stem ?? ""}
                  context={(q.context as any) ?? {}}
                />
              );
            }
            return (
              <div key={q.id} className="rounded border border-saffron/30 bg-saffron/5 p-4 text-sm text-ink">
                Editor no disponible para tipo <code>{q.question_type}</code>.
              </div>
            );
          })}
        </div>

        {/* Añadir nueva pregunta */}
        <div className="mt-6">
          <AddQuestionButton
            partId={part.id}
            questionType={questionType}
            currentCount={questions?.length ?? 0}
            expectedCount={expectedCount}
          />
        </div>
      </section>
    </div>
  );
}
