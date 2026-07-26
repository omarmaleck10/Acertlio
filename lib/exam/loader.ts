import { createAdminClient } from "@/lib/supabase/admin";

// ─── Tipos que consume el simulador ───────────────────────────────────

export interface SimQuestionOption {
  id: string;
  letter: string;
  text: string;
  order_index: number;
}

export interface SimQuestion {
  id: string;
  question_number: number;
  question_type: string;
  stem: string | null;
  context: Record<string, unknown>;
  order_index: number;
  options: SimQuestionOption[];
}

export interface SimPart {
  id: string;
  part_number: number;
  title: string | null;
  instructions: string | null;
  order_index: number;
  settings: Record<string, unknown>;
  questions: SimQuestion[];
}

export interface SimSavedAnswer {
  question_id: string;
  selected_option_id: string | null;
  answer_text: string | null;
}

export interface SimulatorData {
  exam_id: string;
  exam_title: string;
  exam_level: string;
  mock_number: number | null;
  paper_id: string;
  paper_code: string;
  paper_title: string;
  paper_duration_minutes: number;
  paper_attempt_id: string;
  paper_attempt_status: string;
  time_remaining_seconds: number;
  student_name: string;
  parts: SimPart[];
  saved_answers: SimSavedAnswer[];
  bookmarked_question_ids: string[];
}


/**
 * Carga todos los datos necesarios para renderizar el simulador de un paper
 * concreto para un alumno concreto.
 *
 * Devuelve null si el examen/paper no existen, o si el alumno no tiene un
 * paper_attempt válido para ese paper.
 */
export async function loadSimulatorData(
  examId: string,
  paperCode: string,
  studentId: string
): Promise<SimulatorData | null> {
  const admin = createAdminClient();

  // 1. Examen
  const { data: exam } = await admin
    .from("exams")
    .select("id, title, level, mock_number, is_published")
    .eq("id", examId)
    .eq("is_published", true)
    .maybeSingle();

  if (!exam) return null;

  // 2. Paper
  const { data: paper } = await admin
    .from("exam_papers")
    .select(
      "id, code, title, duration_minutes, is_available"
    )
    .eq("exam_id", examId)
    .eq("code", paperCode)
    .maybeSingle();

  if (!paper || !paper.is_available) return null;

  // 3. Attempt agrupador in_progress del alumno
  const { data: attempt } = await admin
    .from("attempts")
    .select("id")
    .eq("exam_id", examId)
    .eq("student_id", studentId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!attempt) return null;

  // 4. Paper attempt
  const { data: paperAttempt } = await admin
    .from("paper_attempts")
    .select(
      "id, status, time_remaining_seconds, started_at"
    )
    .eq("attempt_id", attempt.id)
    .eq("paper_id", paper.id)
    .maybeSingle();

  if (!paperAttempt) return null;
  if (paperAttempt.status === "completed" || paperAttempt.status === "time_expired") {
    return null; // ya terminado, no se puede simular
  }

  // 5. Nombre del alumno
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", studentId)
    .maybeSingle();

  // 6. Parts del paper
  const { data: partsData } = await admin
    .from("exam_parts")
    .select(
      "id, part_number, title, instructions, order_index, settings"
    )
    .eq("paper_id", paper.id)
    .order("order_index", { ascending: true });

  const parts: SimPart[] = [];

  if (partsData && partsData.length > 0) {
    const partIds = partsData.map((p) => p.id);

    // 7. Preguntas de todas las parts
    const { data: questionsData } = await admin
      .from("questions")
      .select(
        "id, part_id, question_number, question_type, stem, context, order_index"
      )
      .in("part_id", partIds)
      .order("order_index", { ascending: true });

    // 8. Opciones de todas las preguntas
    const questionIds = (questionsData ?? []).map((q) => q.id);
    let optionsByQuestion = new Map<string, SimQuestionOption[]>();
    if (questionIds.length > 0) {
      const { data: optionsData } = await admin
        .from("question_options")
        .select("id, question_id, letter, text, order_index")
        .in("question_id", questionIds)
        .order("order_index", { ascending: true });

      (optionsData ?? []).forEach((opt) => {
        const arr = optionsByQuestion.get(opt.question_id) ?? [];
        arr.push({
          id: opt.id,
          letter: opt.letter,
          text: opt.text,
          order_index: opt.order_index,
        });
        optionsByQuestion.set(opt.question_id, arr);
      });
    }

    // 9. Ensamblar parts con questions y options
    const questionsByPart = new Map<string, SimQuestion[]>();
    (questionsData ?? []).forEach((q) => {
      const arr = questionsByPart.get(q.part_id) ?? [];
      arr.push({
        id: q.id,
        question_number: q.question_number,
        question_type: q.question_type,
        stem: q.stem,
        context: (q.context ?? {}) as Record<string, unknown>,
        order_index: q.order_index,
        options: optionsByQuestion.get(q.id) ?? [],
      });
      questionsByPart.set(q.part_id, arr);
    });

    partsData.forEach((p) => {
      parts.push({
        id: p.id,
        part_number: p.part_number,
        title: p.title,
        instructions: p.instructions,
        order_index: p.order_index,
        settings: (p.settings ?? {}) as Record<string, unknown>,
        questions: questionsByPart.get(p.id) ?? [],
      });
    });
  }

  // 10. Respuestas guardadas del alumno para este paper_attempt
  const { data: answersData } = await admin
    .from("answers")
    .select("question_id, selected_option_id, answer_text")
    .eq("paper_attempt_id", paperAttempt.id);

  const saved_answers: SimSavedAnswer[] = (answersData ?? []).map((a) => ({
    question_id: a.question_id,
    selected_option_id: a.selected_option_id,
    answer_text: a.answer_text,
  }));

  // 11. Bookmarks del alumno
  const { data: bookmarksData } = await admin
    .from("paper_attempt_bookmarks")
    .select("question_id")
    .eq("paper_attempt_id", paperAttempt.id);

  const bookmarked_question_ids = (bookmarksData ?? []).map(
    (b) => b.question_id
  );

  return {
    exam_id: exam.id,
    exam_title: exam.title,
    exam_level: exam.level,
    mock_number: exam.mock_number,
    paper_id: paper.id,
    paper_code: paper.code,
    paper_title: paper.title,
    paper_duration_minutes: paper.duration_minutes,
    paper_attempt_id: paperAttempt.id,
    paper_attempt_status: paperAttempt.status,
    time_remaining_seconds:
      paperAttempt.time_remaining_seconds ?? paper.duration_minutes * 60,
    student_name: profile?.full_name ?? "Alumno",
    parts,
    saved_answers,
    bookmarked_question_ids,
  };
}
