import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeAnswer, isTextAnswerCorrect } from "./autograde";

// ─── Tipos ────────────────────────────────────────────────────────────

export type QuestionResultStatus =
  | "correct"
  | "incorrect"
  | "unanswered"
  | "pending"; // solo writing_task pendiente de corrección profesor

export interface ResultQuestion {
  id: string;
  question_number: number;
  question_type: string;
  stem: string | null;
  context: Record<string, unknown>;
  order_index: number;
  points: number;
  status: QuestionResultStatus;
  is_bookmarked: boolean;

  // Para MC (con opciones)
  options: Array<{
    id: string;
    letter: string;
    text: string;
    is_correct: boolean;
    is_user_selection: boolean;
  }>;

  // Para matching/gapped/open_cloze (respuesta como texto)
  user_answer_text: string | null;
  correct_answer_text: string | null;

  // Para writing_task
  writing_body: string | null;      // solo texto (sin prefijo [34a])
  writing_choice: string | null;    // "34a", "34b", null
  writing_correction: {
    content_score: number | null;
    communicative_score: number | null;
    organisation_score: number | null;
    language_score: number | null;
    total_score: number | null;
    max_score: number | null;
    teacher_notes: string | null;
    corrected_at: string | null;
    corrected_by_ai: boolean;
    suggestions: Array<{
      type: string;
      text: string;
      example?: string | null;
    }> | null;
  } | null;
}

export interface ResultPart {
  id: string;
  part_number: number;
  title: string | null;
  order_index: number;
  settings: Record<string, unknown>;
  questions: ResultQuestion[];
  correct_count: number;
  total_count: number;
  writing_pending: number;
}

export interface ResultData {
  exam_id: string;
  exam_title: string;
  exam_level: string;
  mock_number: number | null;

  paper_id: string;
  paper_code: string;
  paper_title: string;
  paper_duration_minutes: number;

  paper_attempt_id: string;
  status: string; // completed | time_expired | ...
  auto_closed: boolean;
  started_at: string | null;
  completed_at: string | null;
  time_used_seconds: number | null;

  raw_score: number;
  max_score: number;
  score_pct: number | null;
  correct_count: number;
  total_gradeable: number; // sin contar writing tasks
  writing_pending: number;
  writing_max_score: number;
  writing_current_score: number | null;

  parts: ResultPart[];
  notes_content: string;
  bookmarked_question_ids: string[];

  // Perfil del alumno: si es individual, tiene autocorrección IA.
  // Si es de academia, corrige el profesor.
  is_individual: boolean;

  // Diagnóstico técnico visible en la UI cuando writing está pendiente.
  // Muestra el estado real de las filas en writing_corrections para
  // este attempt (sin filtrar por nada).
  writing_debug: Array<{
    question_id: string;
    status: string | null;
    corrected_by_ai: boolean | null;
    has_corrected_at: boolean;
    has_updated_at: boolean;
    total_score: number | null;
    content_score: number | null;
    communicative_score: number | null;
    organisation_score: number | null;
    language_score: number | null;
    feedback_len: number;
    academy_id_null: boolean;
  }>;

  // Meta-diagnóstico para identificar mismatches entre attempts
  writing_debug_meta: {
    attempt_id_used: string;
    writing_questions_count: number;
    writing_questions_first_ids: string[]; // primeros 3
    wc_raw_count: number; // filas por attempt_id sin filtrar por question_id
    wc_filtered_count: number; // filas tras filtrar por question_id
    corrections_scanned_all: Array<{
      attempt_id_short: string;
      question_id_short: string;
      status: string | null;
      corrected_by_ai: boolean;
      has_scores: boolean;
    }>;
  };
}


// ─── Helper: parsear respuesta de writing con choice ──────────────────
function parseWritingAnswer(raw: string | null): {
  choice: string | null;
  body: string;
} {
  if (!raw) return { choice: null, body: "" };
  const m = raw.match(/^\[([^\]]+)\]\n\n([\s\S]*)$/);
  if (m) return { choice: m[1], body: m[2] };
  return { choice: null, body: raw };
}


// ─── Función principal ────────────────────────────────────────────────

export async function loadResultData(
  examId: string,
  paperCode: string,
  studentId: string
): Promise<ResultData | null> {
  const admin = createAdminClient();

  // 0. Perfil del alumno (para saber si es individual → autocorrección IA)
  const { data: studentProfile } = await admin
    .from("profiles")
    .select("is_individual")
    .eq("id", studentId)
    .maybeSingle();

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
    .select("id, code, title, duration_minutes")
    .eq("exam_id", examId)
    .eq("code", paperCode)
    .maybeSingle();
  if (!paper) return null;

  // 3. Attempt del alumno (in_progress o finalizado)
  const { data: attempt } = await admin
    .from("attempts")
    .select("id")
    .eq("exam_id", examId)
    .eq("student_id", studentId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!attempt) return null;

  // 4. Paper attempt (completado o time_expired)
  const { data: paperAttempt } = await admin
    .from("paper_attempts")
    .select(
      "id, status, started_at, completed_at, time_remaining_seconds, auto_closed, raw_score, max_score"
    )
    .eq("attempt_id", attempt.id)
    .eq("paper_id", paper.id)
    .maybeSingle();
  if (!paperAttempt) return null;

  // Solo mostrar resultado si está finalizado
  const isFinished =
    paperAttempt.status === "completed" ||
    paperAttempt.status === "time_expired";
  if (!isFinished) return null;

  // 5. Parts
  const { data: partsData } = await admin
    .from("exam_parts")
    .select("id, part_number, title, order_index, settings")
    .eq("paper_id", paper.id)
    .order("order_index", { ascending: true });

  if (!partsData || partsData.length === 0) return null;

  const partIds = partsData.map((p) => p.id);

  // 6. Questions
  const { data: questionsData } = await admin
    .from("questions")
    .select(
      "id, part_id, question_number, question_type, stem, context, correct_answer, points, order_index"
    )
    .in("part_id", partIds)
    .order("order_index", { ascending: true });

  // 7. Options
  const questionIds = (questionsData ?? []).map((q) => q.id);
  const optionsByQuestion = new Map<
    string,
    Array<{ id: string; letter: string; text: string; is_correct: boolean }>
  >();

  if (questionIds.length > 0) {
    const { data: optionsData } = await admin
      .from("question_options")
      .select("id, question_id, letter, text, is_correct, order_index")
      .in("question_id", questionIds)
      .order("order_index", { ascending: true });

    (optionsData ?? []).forEach((o) => {
      const arr = optionsByQuestion.get(o.question_id) ?? [];
      arr.push({
        id: o.id,
        letter: o.letter,
        text: o.text,
        is_correct: o.is_correct,
      });
      optionsByQuestion.set(o.question_id, arr);
    });
  }

  // 8. Answers
  const { data: answersData } = await admin
    .from("answers")
    .select("question_id, selected_option_id, answer_text")
    .eq("paper_attempt_id", paperAttempt.id);

  const answerByQuestion = new Map<
    string,
    { selected_option_id: string | null; answer_text: string | null }
  >();
  (answersData ?? []).forEach((a) => {
    answerByQuestion.set(a.question_id, {
      selected_option_id: a.selected_option_id,
      answer_text: a.answer_text,
    });
  });

  // 9. Bookmarks
  const { data: bookmarksData } = await admin
    .from("paper_attempt_bookmarks")
    .select("question_id")
    .eq("paper_attempt_id", paperAttempt.id);
  const bookmarkSet = new Set(
    (bookmarksData ?? []).map((b) => b.question_id)
  );

  // 10. Notas
  const { data: notesData } = await admin
    .from("paper_attempt_notes")
    .select("content")
    .eq("paper_attempt_id", paperAttempt.id)
    .maybeSingle();

  // 11. Writing corrections (por question_id)
  const writingQuestionIds = (questionsData ?? [])
    .filter((q) => q.question_type === "writing_task")
    .map((q) => q.id);

  const writingCorrectionByQuestion = new Map<
    string,
    {
      content_score: number | null;
      communicative_score: number | null;
      organisation_score: number | null;
      language_score: number | null;
      total_score: number | null;
      max_score: number | null;
      teacher_notes: string | null;
      corrected_at: string | null;
      corrected_by_ai: boolean;
      suggestions: Array<{
        type: string;
        text: string;
        example?: string | null;
      }> | null;
    }
  >();

  const writingDebug: Array<{
    question_id: string;
    status: string | null;
    corrected_by_ai: boolean | null;
    has_corrected_at: boolean;
    has_updated_at: boolean;
    total_score: number | null;
    content_score: number | null;
    communicative_score: number | null;
    organisation_score: number | null;
    language_score: number | null;
    feedback_len: number;
    academy_id_null: boolean;
  }> = [];

  let wcRawCount = 0;
  let wcFilteredCount = 0;

  if (writingQuestionIds.length > 0) {
    // ═════════════════════════════════════════════════════════════
    // CARGA WRITING CORRECTIONS — versión definitiva
    // ═════════════════════════════════════════════════════════════
    //
    // Estrategia probada: query GLOBAL por student_id (que funciona
    // consistentemente) y filtro TODO en JavaScript por attempt_id +
    // question_id. Evitamos el bug misterioso de .eq("attempt_id")
    // que devolvía 0 en producción aunque las filas existieran.
    //
    // Con limit(200) tenemos cobertura holgada (200 correcciones
    // por alumno = ~100 mocks).
    const writingIdSet = new Set(writingQuestionIds);

    const { data: wcAll, error: wcErr } = await admin
      .from("writing_corrections")
      .select(
        "attempt_id, question_id, content_score, communicative_score, organisation_score, language_score, total_score, max_score, feedback, corrected_at, updated_at, status, corrected_by_ai, suggestions, academy_id"
      )
      .eq("student_id", studentId)
      .order("updated_at", { ascending: false })
      .limit(200);

    if (wcErr) {
      console.error(
        "[result-loader] Fallo query writing_corrections:",
        wcErr
      );
    }

    const wcData = (wcAll ?? []).filter(
      (wc) =>
        wc.attempt_id === attempt.id &&
        writingIdSet.has(wc.question_id as string)
    );

    wcRawCount = wcAll?.length ?? 0;
    wcFilteredCount = wcData.length;

    console.log(
      `[result-loader] attempt=${attempt.id.slice(0, 8)} allForStudent=${wcAll?.length ?? 0} filteredForAttemptAndQ=${wcData.length}`
    );

    wcData.forEach((wc) => {
      const wcAny = wc as unknown as Record<string, unknown>;

      // Diagnóstico técnico
      writingDebug.push({
        question_id: wc.question_id,
        status: (wc.status as string | null) ?? null,
        corrected_by_ai: Boolean(wcAny.corrected_by_ai),
        has_corrected_at: wc.corrected_at != null,
        has_updated_at: wcAny.updated_at != null,
        total_score: wc.total_score,
        content_score: wc.content_score,
        communicative_score: wc.communicative_score,
        organisation_score: wc.organisation_score,
        language_score: wc.language_score,
        feedback_len: typeof wc.feedback === "string" ? wc.feedback.length : 0,
        academy_id_null: wcAny.academy_id == null,
      });

      // Determinar si está corregido (criterio flexible)
      const isCorrectedByAI = Boolean(wcAny.corrected_by_ai);
      const hasValidScores =
        wc.total_score != null &&
        wc.content_score != null &&
        wc.communicative_score != null;
      const isCompleted =
        isCorrectedByAI || wc.status === "completed" || hasValidScores;

      // Timestamp efectivo (corrected_at o updated_at o now)
      const effectiveCorrectedAt = isCompleted
        ? ((wc.corrected_at as string | null) ??
          (wcAny.updated_at as string | null) ??
          new Date().toISOString())
        : null;

      writingCorrectionByQuestion.set(wc.question_id, {
        content_score: wc.content_score,
        communicative_score: wc.communicative_score,
        organisation_score: wc.organisation_score,
        language_score: wc.language_score,
        total_score: wc.total_score,
        max_score: wc.max_score,
        teacher_notes: (wc.feedback as string | null) ?? null,
        corrected_at: effectiveCorrectedAt,
        corrected_by_ai: isCorrectedByAI,
        suggestions:
          (wcAny.suggestions as
            | Array<{ type: string; text: string; example?: string | null }>
            | null) ?? null,
      });
    });
  }

  // ─── META-DIAGNÓSTICO ───────────────────────────────────────────────
  // Búsqueda GLOBAL de correcciones del alumno sin filtrar por attempt_id.
  // Sirve para detectar si la IA guardó con un attempt_id distinto al
  // que el loader está usando (bug de mismatch de attempts).
  const correctionsScannedAll: Array<{
    attempt_id_short: string;
    question_id_short: string;
    status: string | null;
    corrected_by_ai: boolean;
    has_scores: boolean;
  }> = [];

  const { data: wcAllForStudent } = await admin
    .from("writing_corrections")
    .select("attempt_id, question_id, status, corrected_by_ai, total_score")
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false })
    .limit(20);

  (wcAllForStudent ?? []).forEach((wc) => {
    correctionsScannedAll.push({
      attempt_id_short: String(wc.attempt_id).slice(0, 8) + "…",
      question_id_short: String(wc.question_id).slice(0, 8) + "…",
      status: (wc.status as string | null) ?? null,
      corrected_by_ai: Boolean(
        (wc as unknown as Record<string, unknown>).corrected_by_ai
      ),
      has_scores: wc.total_score != null,
    });
  });

  const writingDebugMeta = {
    attempt_id_used: attempt.id,
    writing_questions_count: writingQuestionIds.length,
    writing_questions_first_ids: writingQuestionIds.slice(0, 3),
    wc_raw_count: wcRawCount,
    wc_filtered_count: wcFilteredCount,
    corrections_scanned_all: correctionsScannedAll,
  };
  let totalCorrect = 0;
  let totalGradeable = 0;
  let writingPending = 0;
  let writingMaxScore = 0;
  let writingCurrentScore: number | null = null;
  let writingHasAnyCorrection = false;

  const resultParts: ResultPart[] = partsData.map((part) => {
    const partQuestions = (questionsData ?? []).filter(
      (q) => q.part_id === part.id
    );
    let partCorrect = 0;
    let partTotal = 0;
    let partWritingPending = 0;

    const questions: ResultQuestion[] = partQuestions.map((q) => {
      const userAnswer = answerByQuestion.get(q.id);
      const options = optionsByQuestion.get(q.id) ?? [];
      const isBookmarked = bookmarkSet.has(q.id);

      // Writing task
      if (q.question_type === "writing_task") {
        const wc = writingCorrectionByQuestion.get(q.id) ?? null;
        const points = Number(q.points ?? 20);
        writingMaxScore += points;

        if (wc?.total_score != null) {
          writingCurrentScore = (writingCurrentScore ?? 0) + wc.total_score;
          writingHasAnyCorrection = true;
        }

        const parsed = parseWritingAnswer(userAnswer?.answer_text ?? null);

        const wcHasScores = Boolean(
          wc &&
            wc.total_score != null &&
            wc.content_score != null &&
            wc.communicative_score != null
        );
        const wcCorrected = Boolean(wc?.corrected_at) || wcHasScores;

        const status: QuestionResultStatus = wcCorrected
          ? "correct"
          : "pending";

        if (!wcCorrected) {
          partWritingPending += 1;
          writingPending += 1;
        }

        return {
          id: q.id,
          question_number: q.question_number,
          question_type: q.question_type,
          stem: q.stem,
          context: (q.context ?? {}) as Record<string, unknown>,
          order_index: q.order_index,
          points,
          status,
          is_bookmarked: isBookmarked,
          options: [],
          user_answer_text: null,
          correct_answer_text: null,
          writing_body: parsed.body,
          writing_choice: parsed.choice,
          writing_correction: wc,
        };
      }

      // Preguntas gradables
      partTotal += 1;
      totalGradeable += 1;
      const points = Number(q.points ?? 1);

      // Determinar corrección
      let status: QuestionResultStatus = "unanswered";
      let userAnswerText: string | null = null;
      let correctAnswerText: string | null = null;

      const hasOptions = options.length > 0;

      if (hasOptions) {
        // MC (A/B/C, A/B/C/D, MC Cloze)
        const correct = options.find((o) => o.is_correct);
        correctAnswerText = correct?.letter ?? null;

        if (userAnswer?.selected_option_id) {
          const selected = options.find(
            (o) => o.id === userAnswer.selected_option_id
          );
          userAnswerText = selected?.letter ?? null;
          if (selected?.is_correct) {
            status = "correct";
            partCorrect += 1;
            totalCorrect += 1;
          } else {
            status = "incorrect";
          }
        }
      } else {
        // Matching / gapped / open_cloze
        correctAnswerText = q.correct_answer ?? null;
        const rawUser = userAnswer?.answer_text?.trim() ?? "";

        if (rawUser) {
          userAnswerText = rawUser;
          const correct = isTextAnswerCorrect(rawUser, q.correct_answer);
          if (correct) {
            status = "correct";
            partCorrect += 1;
            totalCorrect += 1;
          } else {
            status = "incorrect";
          }
        }
      }

      // Marcar opciones para la UI (is_user_selection)
      const uiOptions = options.map((o) => ({
        id: o.id,
        letter: o.letter,
        text: o.text,
        is_correct: o.is_correct,
        is_user_selection: userAnswer?.selected_option_id === o.id,
      }));

      return {
        id: q.id,
        question_number: q.question_number,
        question_type: q.question_type,
        stem: q.stem,
        context: (q.context ?? {}) as Record<string, unknown>,
        order_index: q.order_index,
        points,
        status,
        is_bookmarked: isBookmarked,
        options: uiOptions,
        user_answer_text: userAnswerText,
        correct_answer_text: correctAnswerText,
        writing_body: null,
        writing_choice: null,
        writing_correction: null,
      };
    });

    return {
      id: part.id,
      part_number: part.part_number,
      title: part.title,
      order_index: part.order_index,
      settings: (part.settings ?? {}) as Record<string, unknown>,
      questions,
      correct_count: partCorrect,
      total_count: partTotal,
      writing_pending: partWritingPending,
    };
  });

  // Tiempo usado: duración total - tiempo restante
  const durationSec = paper.duration_minutes * 60;
  const timeUsedSeconds =
    paperAttempt.time_remaining_seconds != null
      ? Math.max(0, durationSec - paperAttempt.time_remaining_seconds)
      : null;

  const rawScore = Number(paperAttempt.raw_score ?? 0);
  const maxScore = Number(paperAttempt.max_score ?? totalGradeable);
  const scorePct =
    maxScore > 0 ? Math.round((rawScore / maxScore) * 1000) / 10 : null;

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
    status: paperAttempt.status,
    auto_closed: paperAttempt.auto_closed,
    started_at: paperAttempt.started_at,
    completed_at: paperAttempt.completed_at,
    time_used_seconds: timeUsedSeconds,

    raw_score: rawScore,
    max_score: maxScore,
    score_pct: scorePct,
    correct_count: totalCorrect,
    total_gradeable: totalGradeable,
    writing_pending: writingPending,
    writing_max_score: writingMaxScore,
    writing_current_score: writingHasAnyCorrection ? writingCurrentScore : null,

    parts: resultParts,
    notes_content: notesData?.content ?? "",
    bookmarked_question_ids: Array.from(bookmarkSet),
    is_individual: Boolean(
      (studentProfile as unknown as Record<string, unknown> | null)
        ?.is_individual
    ),
    writing_debug: writingDebug,
    writing_debug_meta: writingDebugMeta,
  };
}
