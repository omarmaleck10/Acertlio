/**
 * POST /api/activities/[id]/submit
 * CORREGIDO: usa @supabase/ssr.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isAnswerCorrect, gradeFromScore } from "@/lib/activities/scoring";

type SubmitBody = {
  attempt_id: string;
  responses: Array<{
    question_id: string;
    user_answer: string;
  }>;
  time_spent_seconds?: number;
};

export async function POST(
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

  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.attempt_id || !Array.isArray(body.responses)) {
    return NextResponse.json(
      { error: "attempt_id y responses son obligatorios" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: attempt, error: attemptError } = await supabase
    .from("activity_attempts")
    .select("id, user_id, activity_id, is_complete, started_at")
    .eq("id", body.attempt_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (attemptError || !attempt) {
    return NextResponse.json(
      { error: "Intento no encontrado" },
      { status: 404 }
    );
  }
  if (attempt.activity_id !== activityId) {
    return NextResponse.json(
      { error: "El intento no corresponde a esta actividad" },
      { status: 400 }
    );
  }
  if (attempt.is_complete) {
    return NextResponse.json(
      { error: "Este intento ya fue enviado" },
      { status: 400 }
    );
  }

  const { data: questions, error: qError } = await supabase
    .from("activity_questions")
    .select("*")
    .eq("activity_id", activityId)
    .order("question_number", { ascending: true });

  if (qError || !questions) {
    return NextResponse.json(
      { error: "No se pudieron cargar las preguntas" },
      { status: 500 }
    );
  }

  const responsesByQ: Record<string, string> = {};
  body.responses.forEach((r) => {
    responsesByQ[r.question_id] = r.user_answer;
  });

  let score = 0;
  const responseRows = questions.map((q: any) => {
    const userAnswer = responsesByQ[q.id] ?? "";
    const correct = isAnswerCorrect(q as any, userAnswer);
    if (correct) score++;
    return {
      attempt_id: body.attempt_id,
      question_id: q.id,
      user_answer: userAnswer,
      is_correct: correct,
    };
  });

  await supabase
    .from("activity_responses")
    .delete()
    .eq("attempt_id", body.attempt_id);

  const { error: respError } = await supabase
    .from("activity_responses")
    .insert(responseRows);

  if (respError) {
    console.error("[/api/activities/[id]/submit] responses insert:", respError);
    return NextResponse.json(
      { error: "No se pudieron guardar las respuestas" },
      { status: 500 }
    );
  }

  const timeSpent =
    body.time_spent_seconds ??
    Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(attempt.started_at).getTime()) / 1000
      )
    );

  const { error: updateError } = await supabase
    .from("activity_attempts")
    .update({
      score,
      total_questions: questions.length,
      submitted_at: new Date().toISOString(),
      time_spent_seconds: timeSpent,
      is_complete: true,
    })
    .eq("id", body.attempt_id);

  if (updateError) {
    console.error("[/api/activities/[id]/submit] attempt update:", updateError);
  }

  return NextResponse.json({
    success: true,
    attempt_id: body.attempt_id,
    score,
    total: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    grade: gradeFromScore(score, questions.length),
  });
}
