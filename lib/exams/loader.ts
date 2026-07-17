import { createAdminClient } from "@/lib/supabase/admin";
import type { CambridgeLevel, QuestionType, ExamSkill } from "@/lib/supabase/types";

/**
 * Loader que devuelve TODO el árbol de datos que necesita el simulador
 * para un attempt en curso.
 *
 * Devuelve exam + parts + questions + options + respuestas actuales del alumno.
 * Solo el student dueño del attempt (o superadmin) puede llamar.
 */

export interface LoadedQuestionOption {
  id: string;
  letter: string;
  text: string;
}

export interface LoadedQuestion {
  id: string;
  question_number: number;
  question_type: QuestionType;
  stem: string;
  context: Record<string, unknown>;
  options: LoadedQuestionOption[];
  current_answer: {
    answer_text: string | null;
    selected_option_id: string | null;
  } | null;
}

export interface LoadedPart {
  id: string;
  part_number: number;
  skill: ExamSkill;
  title: string;
  instructions: string | null;
  time_minutes: number | null;
  order_index: number;
  settings: Record<string, unknown>;
  questions: LoadedQuestion[];
}

export interface LoadedExamForAttempt {
  attempt: {
    id: string;
    status: string;
    started_at: string;
    submitted_at: string | null;
    time_spent_seconds: number;
  };
  exam: {
    id: string;
    title: string;
    level: CambridgeLevel;
    total_time_minutes: number;
  };
  student: {
    id: string;
    full_name: string;
  };
  parts: LoadedPart[];
}

export async function loadExamForAttempt(
  attemptId: string,
  requesterId: string
): Promise<LoadedExamForAttempt | null> {
  const admin = createAdminClient();

  // 1. Cargar el attempt
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, exam_id, student_id, academy_id, status, started_at, submitted_at, time_spent_seconds")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) return null;

  // Verificar que el requester es el student dueño o superadmin
  const { data: requesterProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", requesterId)
    .maybeSingle();

  const isOwner = attempt.student_id === requesterId;
  const isSuperAdmin = requesterProfile?.role === "super_admin";
  if (!isOwner && !isSuperAdmin) return null;

  // 2. Cargar exam + parts en paralelo
  const [{ data: exam }, { data: parts }, { data: student }] = await Promise.all([
    admin
      .from("exams")
      .select("id, title, level, total_time_minutes")
      .eq("id", attempt.exam_id)
      .maybeSingle(),
    admin
      .from("exam_parts")
      .select("id, part_number, skill, title, instructions, time_minutes, order_index, settings")
      .eq("exam_id", attempt.exam_id)
      .order("order_index", { ascending: true }),
    admin
      .from("profiles")
      .select("id, full_name")
      .eq("id", attempt.student_id)
      .maybeSingle(),
  ]);

  if (!exam || !parts) return null;

  const partIds = parts.map((p) => p.id);

  // 3. Cargar todas las questions + options + respuestas actuales en paralelo
  const [{ data: questions }, { data: options }, { data: answers }] = await Promise.all([
    admin
      .from("questions")
      .select("id, part_id, question_number, question_type, stem, context")
      .in("part_id", partIds)
      .order("order_index", { ascending: true }),
    admin
      .from("question_options")
      .select("id, question_id, letter, text, order_index")
      .in(
        "question_id",
        (await admin.from("questions").select("id").in("part_id", partIds)).data?.map(
          (q) => q.id
        ) ?? []
      )
      .order("order_index", { ascending: true }),
    admin
      .from("answers")
      .select("question_id, answer_text, selected_option_id")
      .eq("attempt_id", attemptId),
  ]);

  const optionsByQuestion = new Map<string, LoadedQuestionOption[]>();
  for (const opt of options ?? []) {
    const arr = optionsByQuestion.get(opt.question_id) ?? [];
    arr.push({ id: opt.id, letter: opt.letter, text: opt.text });
    optionsByQuestion.set(opt.question_id, arr);
  }

  const answersByQuestion = new Map<
    string,
    { answer_text: string | null; selected_option_id: string | null }
  >();
  for (const ans of answers ?? []) {
    answersByQuestion.set(ans.question_id, {
      answer_text: ans.answer_text,
      selected_option_id: ans.selected_option_id,
    });
  }

  // 4. Componer estructura
  const loadedParts: LoadedPart[] = parts.map((p) => ({
    id: p.id,
    part_number: p.part_number,
    skill: p.skill as ExamSkill,
    title: p.title,
    instructions: p.instructions,
    time_minutes: p.time_minutes,
    order_index: p.order_index,
    settings: (p.settings as Record<string, unknown>) ?? {},
    questions: (questions ?? [])
      .filter((q) => q.part_id === p.id)
      .map((q) => ({
        id: q.id,
        question_number: q.question_number,
        question_type: q.question_type as QuestionType,
        stem: q.stem ?? "",
        context: (q.context as Record<string, unknown>) ?? {},
        options: optionsByQuestion.get(q.id) ?? [],
        current_answer: answersByQuestion.get(q.id) ?? null,
      })),
  }));

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      started_at: attempt.started_at,
      submitted_at: attempt.submitted_at,
      time_spent_seconds: attempt.time_spent_seconds ?? 0,
    },
    exam: {
      id: exam.id,
      title: exam.title,
      level: exam.level as CambridgeLevel,
      total_time_minutes: exam.total_time_minutes,
    },
    student: {
      id: student?.id ?? attempt.student_id,
      full_name: student?.full_name ?? "Alumno",
    },
    parts: loadedParts,
  };
}
