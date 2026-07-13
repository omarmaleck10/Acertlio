import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { SKILL_LABELS, QUESTION_TYPE_LABELS } from "@/lib/exams/formats";
import type { QuestionType } from "@/lib/supabase/types";

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

  const hint = (part.settings as { question_type_hint?: string })
    ?.question_type_hint;
  const expected = (part.settings as { expected_count?: number })
    ?.expected_count;

  return (
    <div className="px-8 py-8 max-w-4xl">
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
          {hint && ` · ${QUESTION_TYPE_LABELS[hint as QuestionType]}`}
          {expected && ` · ${expected} preguntas esperadas`}
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

      {/* Placeholder — el editor de preguntas viene en la siguiente sesión */}
      <div className="rounded border border-dashed border-navy/30 bg-navy-50/40 p-10 text-center">
        <Construction className="h-10 w-10 text-navy/60 mx-auto mb-4" />
        <h2 className="font-semibold text-lg text-ink mb-2">
          Editor de preguntas — próxima sesión
        </h2>
        <p className="text-sm text-muted max-w-md mx-auto leading-relaxed mb-4">
          Aquí construiremos el editor específico para el tipo de tarea{" "}
          {hint && (
            <strong className="text-navy">
              {QUESTION_TYPE_LABELS[hint as QuestionType]}
            </strong>
          )}
          . Cada tipo (multiple choice, open cloze, word formation, gapped text,
          etc.) tiene su propio formulario adaptado.
        </p>
        <p className="text-xs text-muted">
          De momento, la estructura del examen ya está creada. En cuanto tengamos
          el editor listo, podrás rellenar el contenido de cada pregunta.
        </p>
      </div>
    </div>
  );
}
