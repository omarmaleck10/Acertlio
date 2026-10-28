/**
 * GET /api/activities/[id]
 * CORREGIDO: usa @supabase/ssr.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const activityId = params.id;

  const supabaseAuth = createServerSupabase();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select(`
      *,
      exam_part:exam_part_catalog(*)
    `)
    .eq("id", activityId)
    .eq("is_published", true)
    .maybeSingle();

  if (activityError || !activity) {
    return NextResponse.json(
      { error: "Actividad no encontrada" },
      { status: 404 }
    );
  }

  const { data: questions, error: questionsError } = await supabase
    .from("activity_questions")
    .select(`
      id, activity_id, question_number, question_type, prompt, context, metadata,
      options:activity_question_options(
        id, option_letter, option_text, display_order
      )
    `)
    .eq("activity_id", activityId)
    .order("question_number", { ascending: true });

  if (questionsError) {
    return NextResponse.json(
      { error: "No se pudieron cargar las preguntas" },
      { status: 500 }
    );
  }

  const safeQuestions = (questions ?? []).map((q: any) => ({
    ...q,
    options: (q.options ?? []).sort(
      (a: any, b: any) => a.display_order - b.display_order
    ),
  }));

  const { data: openAttempt } = await supabase
    .from("activity_attempts")
    .select("id, started_at, is_complete")
    .eq("user_id", user.id)
    .eq("activity_id", activityId)
    .eq("is_complete", false)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let attemptId = openAttempt?.id;

  if (!attemptId) {
    const { data: newAttempt, error: createError } = await supabase
      .from("activity_attempts")
      .insert({
        user_id: user.id,
        activity_id: activityId,
        total_questions: safeQuestions.length,
        source: req.nextUrl.searchParams.get("source") ?? "catalog",
        source_mock_attempt_id:
          req.nextUrl.searchParams.get("mock_attempt_id") ?? null,
      })
      .select("id")
      .single();

    if (createError || !newAttempt) {
      console.error("[/api/activities/[id]] attempt create:", createError);
      return NextResponse.json(
        { error: "No se pudo iniciar la actividad" },
        { status: 500 }
      );
    }
    attemptId = newAttempt.id;
  }

  return NextResponse.json({
    activity,
    questions: safeQuestions,
    attempt_id: attemptId,
  });
}
