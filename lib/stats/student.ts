import { createAdminClient } from "@/lib/supabase/admin";

// ─── Tipos ──────────────────────────────────────────────────────────

export interface HeroStats {
  average_score_pct: number | null; // media global de mocks completados (%)
  mocks_completed: number;
  last_score_pct: number | null;
  last_mock_title: string | null;
  last_mock_date: string | null;
}

export interface MockScorePoint {
  attempt_id: string;
  exam_id: string;
  exam_title: string;
  mock_number: number | null;
  completed_at: string;
  reading_pct: number | null;
  writing_pct: number | null;
  overall_pct: number;
}

export interface PartBreakdownRow {
  part_id: string;
  part_number: number;
  part_title: string | null;
  paper_code: string;
  skill: string;
  attempts_count: number; // veces que ha respondido preguntas de esta Part
  correct_count: number;
  total_count: number;
  accuracy_pct: number;
}

export interface TimeStat {
  paper_code: string;
  paper_title: string;
  avg_time_seconds: number;
  max_time_seconds: number;
  usage_pct: number; // avg / max
  attempts_count: number;
}

export interface StudentStats {
  hero: HeroStats;
  evolution: MockScorePoint[];
  parts: PartBreakdownRow[];
  times: TimeStat[];
  student_level: string | null;
}


// ─── Loader principal ────────────────────────────────────────────────

/**
 * Devuelve todas las stats del alumno. Se llama una vez desde el server
 * component `/alumno/progreso` y se pasan por props a los sub-componentes.
 */
export async function loadStudentStats(
  studentId: string,
  studentLevel: string | null
): Promise<StudentStats> {
  const admin = createAdminClient();

  // ─── 1. Cargar attempts del alumno (papers acabados) ──────────
  const { data: attempts } = await admin
    .from("attempts")
    .select("id, exam_id, submitted_at, status")
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false });

  const attemptsList = attempts ?? [];
  const attemptIds = attemptsList.map((a) => a.id);
  const examIds = Array.from(new Set(attemptsList.map((a) => a.exam_id)));

  if (attemptIds.length === 0) {
    return {
      hero: {
        average_score_pct: null,
        mocks_completed: 0,
        last_score_pct: null,
        last_mock_title: null,
        last_mock_date: null,
      },
      evolution: [],
      parts: [],
      times: [],
      student_level: studentLevel,
    };
  }

  // ─── 2. Cargar exámenes (títulos, mock_number) ────────────────
  const { data: exams } = await admin
    .from("exams")
    .select("id, title, mock_number, level")
    .in("id", examIds);
  const examById = new Map<
    string,
    { title: string; mock_number: number | null; level: string }
  >();
  (exams ?? []).forEach((e) =>
    examById.set(e.id, {
      title: e.title,
      mock_number: e.mock_number,
      level: e.level,
    })
  );

  // ─── 3. Cargar paper_attempts (raw_score, max_score, tiempo) ──
  const { data: paperAttempts } = await admin
    .from("paper_attempts")
    .select(
      "id, attempt_id, paper_id, status, raw_score, max_score, started_at, completed_at, time_remaining_seconds"
    )
    .in("attempt_id", attemptIds);

  const pAttemptsList = paperAttempts ?? [];

  // ─── 4. Cargar exam_papers (code, title, duration) ────────────
  const paperIds = Array.from(new Set(pAttemptsList.map((p) => p.paper_id)));
  const { data: papers } = paperIds.length
    ? await admin
        .from("exam_papers")
        .select("id, exam_id, code, title, duration_minutes")
        .in("id", paperIds)
    : { data: [] };
  const paperById = new Map<
    string,
    {
      exam_id: string;
      code: string;
      title: string;
      duration_minutes: number | null;
    }
  >();
  (papers ?? []).forEach((p) =>
    paperById.set(p.id, {
      exam_id: p.exam_id,
      code: p.code,
      title: p.title,
      duration_minutes: p.duration_minutes,
    })
  );

  // ─── 5. Determinar qué mocks están COMPLETADOS ───────────────
  // Un mock está completado si TODOS los papers publicados de ese examen
  // tienen paper_attempt con status completed o time_expired
  const { data: allPublishedPapers } = await admin
    .from("exam_papers")
    .select("id, exam_id, is_available")
    .in("exam_id", examIds);

  const publishedPapersByExam = new Map<string, string[]>();
  (allPublishedPapers ?? []).forEach((p) => {
    if (!p.is_available) return;
    const arr = publishedPapersByExam.get(p.exam_id) ?? [];
    arr.push(p.id);
    publishedPapersByExam.set(p.exam_id, arr);
  });

  const completedPapersByAttempt = new Map<string, Set<string>>();
  pAttemptsList.forEach((pa) => {
    if (pa.status === "completed" || pa.status === "time_expired") {
      const set = completedPapersByAttempt.get(pa.attempt_id) ?? new Set<string>();
      set.add(pa.paper_id);
      completedPapersByAttempt.set(pa.attempt_id, set);
    }
  });

  const completedAttempts: typeof attemptsList = [];
  attemptsList.forEach((a) => {
    const exam = examById.get(a.exam_id);
    if (!exam) return;
    const totalPapers = publishedPapersByExam.get(a.exam_id)?.length ?? 0;
    const donePapers = completedPapersByAttempt.get(a.id)?.size ?? 0;
    if (totalPapers > 0 && donePapers >= totalPapers) {
      completedAttempts.push(a);
    }
  });

  // ─── 6. Calcular scores por mock ─────────────────────────────
  // Para cada attempt completado, calculamos:
  //   overall_pct = suma(raw_score) / suma(max_score) * 100
  //   reading_pct = igual pero solo con papers de code que contenga "reading"
  //   writing_pct = igual con "writing"

  const paScoresByAttempt = new Map<
    string,
    { total_raw: number; total_max: number; by_code: Record<string, [number, number]> }
  >();

  pAttemptsList.forEach((pa) => {
    if (pa.raw_score === null || pa.max_score === null) return;
    if (!(pa.status === "completed" || pa.status === "time_expired")) return;
    const paper = paperById.get(pa.paper_id);
    if (!paper) return;
    const rec = paScoresByAttempt.get(pa.attempt_id) ?? {
      total_raw: 0,
      total_max: 0,
      by_code: {} as Record<string, [number, number]>,
    };
    rec.total_raw += Number(pa.raw_score);
    rec.total_max += Number(pa.max_score);
    const codeLow = paper.code.toLowerCase();
    if (!rec.by_code[codeLow]) rec.by_code[codeLow] = [0, 0];
    rec.by_code[codeLow][0] += Number(pa.raw_score);
    rec.by_code[codeLow][1] += Number(pa.max_score);
    paScoresByAttempt.set(pa.attempt_id, rec);
  });

  const evolution: MockScorePoint[] = completedAttempts
    .map((a) => {
      const exam = examById.get(a.exam_id)!;
      const scores = paScoresByAttempt.get(a.id);
      if (!scores || scores.total_max === 0) return null;
      const overall = (scores.total_raw / scores.total_max) * 100;

      // Detectar reading/writing por code del paper
      let readingPct: number | null = null;
      let writingPct: number | null = null;
      Object.entries(scores.by_code).forEach(([code, [raw, max]]) => {
        if (max === 0) return;
        const pct = (raw / max) * 100;
        if (code.includes("reading") || code === "rw") {
          readingPct = pct;
        } else if (code.includes("writing")) {
          writingPct = pct;
        }
      });

      return {
        attempt_id: a.id,
        exam_id: a.exam_id,
        exam_title: exam.title,
        mock_number: exam.mock_number,
        completed_at: a.submitted_at ?? new Date().toISOString(),
        reading_pct: readingPct,
        writing_pct: writingPct,
        overall_pct: Math.round(overall),
      } as MockScorePoint;
    })
    .filter((x): x is MockScorePoint => x !== null)
    .sort(
      (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    );

  // ─── 7. Hero stats ──────────────────────────────────────────
  const averagePct =
    evolution.length > 0
      ? Math.round(
          evolution.reduce((s, e) => s + e.overall_pct, 0) / evolution.length
        )
      : null;

  const lastPoint = evolution[evolution.length - 1];
  const hero: HeroStats = {
    average_score_pct: averagePct,
    mocks_completed: evolution.length,
    last_score_pct: lastPoint?.overall_pct ?? null,
    last_mock_title: lastPoint?.exam_title ?? null,
    last_mock_date: lastPoint?.completed_at ?? null,
  };

  // ─── 8. Part breakdown ──────────────────────────────────────
  // Agrupamos answers por part_id → question_id → part
  const completedAttemptIds = completedAttempts.map((a) => a.id);

  const { data: answers } = completedAttemptIds.length
    ? await admin
        .from("answers")
        .select("id, question_id, is_correct, points_earned, time_spent_seconds, attempt_id")
        .in("attempt_id", completedAttemptIds)
    : { data: [] };

  const questionIds = Array.from(
    new Set((answers ?? []).map((a) => a.question_id))
  );

  const { data: questions } = questionIds.length
    ? await admin
        .from("questions")
        .select("id, part_id, points")
        .in("id", questionIds)
    : { data: [] };
  const questionById = new Map<
    string,
    { part_id: string; points: number }
  >();
  (questions ?? []).forEach((q) =>
    questionById.set(q.id, { part_id: q.part_id, points: Number(q.points ?? 1) })
  );

  const partIds = Array.from(
    new Set((questions ?? []).map((q) => q.part_id).filter(Boolean))
  );

  const { data: parts } = partIds.length
    ? await admin
        .from("exam_parts")
        .select("id, part_number, title, skill, paper_id, order_index")
        .in("id", partIds)
    : { data: [] };

  // partId → parte + paper code
  const partById = new Map<
    string,
    { part_number: number; title: string | null; skill: string; paper_id: string; order_index: number }
  >();
  (parts ?? []).forEach((p) =>
    partById.set(p.id, {
      part_number: p.part_number,
      title: p.title,
      skill: p.skill,
      paper_id: p.paper_id ?? "",
      order_index: p.order_index,
    })
  );

  // Agregado por part_id
  const partAgg = new Map<
    string,
    { correct: number; total: number; attempts: number }
  >();
  (answers ?? []).forEach((a) => {
    const q = questionById.get(a.question_id);
    if (!q) return;
    const rec = partAgg.get(q.part_id) ?? { correct: 0, total: 0, attempts: 0 };
    rec.total += 1;
    if (a.is_correct) rec.correct += 1;
    rec.attempts += 1;
    partAgg.set(q.part_id, rec);
  });

  const partsBreakdown: PartBreakdownRow[] = Array.from(partAgg.entries())
    .map(([partId, agg]) => {
      const p = partById.get(partId);
      if (!p) return null;
      const paper = paperById.get(p.paper_id);
      return {
        part_id: partId,
        part_number: p.part_number,
        part_title: p.title,
        paper_code: paper?.code ?? "",
        skill: p.skill,
        attempts_count: agg.attempts,
        correct_count: agg.correct,
        total_count: agg.total,
        accuracy_pct:
          agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0,
      } as PartBreakdownRow;
    })
    .filter((x): x is PartBreakdownRow => x !== null)
    .sort((a, b) => {
      // Ordenar por paper_code primero, luego part_number
      if (a.paper_code !== b.paper_code)
        return a.paper_code.localeCompare(b.paper_code);
      return a.part_number - b.part_number;
    });

  // ─── 9. Time stats ──────────────────────────────────────────
  // Agrupamos paper_attempts completados por paper_code para calcular
  // tiempo medio empleado vs máximo permitido

  const timeAggByCode = new Map<
    string,
    { title: string; total_time: number; count: number; max_time: number }
  >();

  pAttemptsList.forEach((pa) => {
    if (!(pa.status === "completed" || pa.status === "time_expired")) return;
    if (!pa.started_at || !pa.completed_at) return;
    const paper = paperById.get(pa.paper_id);
    if (!paper) return;

    const durationSec = paper.duration_minutes
      ? paper.duration_minutes * 60
      : 0;

    const spent =
      (new Date(pa.completed_at).getTime() -
        new Date(pa.started_at).getTime()) /
      1000;
    if (spent <= 0 || spent > durationSec + 300) return; // filtrar outliers

    const rec = timeAggByCode.get(paper.code) ?? {
      title: paper.title,
      total_time: 0,
      count: 0,
      max_time: durationSec,
    };
    rec.total_time += spent;
    rec.count += 1;
    rec.max_time = durationSec;
    timeAggByCode.set(paper.code, rec);
  });

  const times: TimeStat[] = Array.from(timeAggByCode.entries()).map(
    ([code, agg]) => {
      const avg = agg.count > 0 ? agg.total_time / agg.count : 0;
      return {
        paper_code: code,
        paper_title: agg.title,
        avg_time_seconds: Math.round(avg),
        max_time_seconds: agg.max_time,
        usage_pct: agg.max_time > 0 ? Math.round((avg / agg.max_time) * 100) : 0,
        attempts_count: agg.count,
      };
    }
  );

  return {
    hero,
    evolution,
    parts: partsBreakdown,
    times,
    student_level: studentLevel,
  };
}


// ─── Utilidad de formato de tiempo ─────────────────────────────

export function formatSecondsToMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}min ${s.toString().padStart(2, "0")}s`;
}
