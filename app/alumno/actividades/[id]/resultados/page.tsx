/**
 * /alumno/actividades/[id]/resultados?attempt=XXX
 * CORREGIDO: usa @supabase/ssr.
 */

import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ActivityResults } from "@/components/activities/ActivityResults";

export const metadata: Metadata = {
  title: "Resultados · Acertlio",
  robots: { index: false, follow: false },
};

export default async function ResultadosPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { attempt?: string };
}) {
  const attemptId = searchParams.attempt;
  if (!attemptId) notFound();

  const supabaseAuth = createServerSupabase();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) redirect("/login?redirect=/alumno/actividades");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: attempt } = await supabase
    .from("activity_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!attempt || !attempt.is_complete) notFound();

  const { data: activity } = await supabase
    .from("activities")
    .select("*, exam_part:exam_part_catalog(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!activity) notFound();

  const { data: questions } = await supabase
    .from("activity_questions")
    .select(`
      *,
      options:activity_question_options(*)
    `)
    .eq("activity_id", params.id)
    .order("question_number", { ascending: true });

  const { data: responses } = await supabase
    .from("activity_responses")
    .select("*")
    .eq("attempt_id", attemptId);

  const responsesByQ: Record<string, any> = {};
  (responses ?? []).forEach((r: any) => {
    responsesByQ[r.question_id] = r;
  });

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-6">
          <Link
            href="/alumno/actividades"
            className="text-sm text-muted hover:text-navy"
          >
            ← Volver al catálogo
          </Link>
        </nav>

        <ActivityResults
          activity={activity}
          attempt={attempt}
          questions={questions ?? []}
          responsesByQuestion={responsesByQ}
        />
      </div>
    </div>
  );
}
