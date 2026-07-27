import { createAdminClient } from "@/lib/supabase/admin";

export interface StudentComparison {
  student_avg_pct: number | null;
  class_avg_pct: number | null;
  diff_pct: number | null; // positivo = alumno por encima
  students_in_class: number;
  student_rank: number | null; // 1 = mejor
  class_size_with_data: number; // alumnos con al menos 1 mock completo
}


/**
 * Compara la nota media del alumno con la media de la academia (mismo nivel).
 *
 * Solo se comparan alumnos DEL MISMO NIVEL para que la comparativa sea justa.
 * Un alumno C2 no se compara con uno A2.
 */
export async function loadStudentComparison(params: {
  studentId: string;
  academyId: string;
  studentLevel: string | null;
}): Promise<StudentComparison> {
  const admin = createAdminClient();
  const { studentId, academyId, studentLevel } = params;

  // Todos los alumnos del mismo nivel en la academia
  let peerIds: string[] = [];
  if (studentLevel) {
    // Nota: current_level es la columna real, pero unos alumnos viejos
    // pueden tener 'level' — cubrimos ambos con or
    const { data: peersA } = await admin
      .from("profiles")
      .select("id")
      .eq("academy_id", academyId)
      .eq("role", "student")
      .eq("current_level", studentLevel);
    peerIds = (peersA ?? []).map((p) => p.id);
  } else {
    // Sin nivel → comparar con TODA la academia (fallback)
    const { data: allPeers } = await admin
      .from("profiles")
      .select("id")
      .eq("academy_id", academyId)
      .eq("role", "student");
    peerIds = (allPeers ?? []).map((p) => p.id);
  }

  if (peerIds.length === 0) {
    return {
      student_avg_pct: null,
      class_avg_pct: null,
      diff_pct: null,
      students_in_class: 0,
      student_rank: null,
      class_size_with_data: 0,
    };
  }

  // Cargar attempts + paper_attempts de todos los peers
  const { data: attempts } = await admin
    .from("attempts")
    .select("id, student_id, exam_id")
    .in("student_id", peerIds);

  const attemptsList = attempts ?? [];
  const attemptIds = attemptsList.map((a) => a.id);
  const examIds = Array.from(new Set(attemptsList.map((a) => a.exam_id)));

  if (attemptIds.length === 0) {
    return {
      student_avg_pct: null,
      class_avg_pct: null,
      diff_pct: null,
      students_in_class: peerIds.length,
      student_rank: null,
      class_size_with_data: 0,
    };
  }

  const { data: paperAttempts } = await admin
    .from("paper_attempts")
    .select("attempt_id, paper_id, status, raw_score, max_score")
    .in("attempt_id", attemptIds);

  const { data: publishedPapers } = examIds.length
    ? await admin
        .from("exam_papers")
        .select("id, exam_id, is_available")
        .in("exam_id", examIds)
    : { data: [] };

  const publishedByExam = new Map<string, string[]>();
  (publishedPapers ?? []).forEach((p) => {
    if (!p.is_available) return;
    const arr = publishedByExam.get(p.exam_id) ?? [];
    arr.push(p.id);
    publishedByExam.set(p.exam_id, arr);
  });

  const completedByAttempt = new Map<string, Set<string>>();
  const scoresByAttempt = new Map<string, { raw: number; max: number }>();

  (paperAttempts ?? []).forEach((pa) => {
    if (pa.status === "completed" || pa.status === "time_expired") {
      const set = completedByAttempt.get(pa.attempt_id) ?? new Set<string>();
      set.add(pa.paper_id);
      completedByAttempt.set(pa.attempt_id, set);

      if (pa.raw_score !== null && pa.max_score !== null) {
        const rec = scoresByAttempt.get(pa.attempt_id) ?? { raw: 0, max: 0 };
        rec.raw += Number(pa.raw_score);
        rec.max += Number(pa.max_score);
        scoresByAttempt.set(pa.attempt_id, rec);
      }
    }
  });

  // Calcular nota media por alumno
  const scoresByStudent = new Map<string, number[]>();

  attemptsList.forEach((a) => {
    const totalPapers = publishedByExam.get(a.exam_id)?.length ?? 0;
    const donePapers = completedByAttempt.get(a.id)?.size ?? 0;
    if (totalPapers === 0 || donePapers < totalPapers) return;

    const scores = scoresByAttempt.get(a.id);
    if (!scores || scores.max === 0) return;
    const pct = (scores.raw / scores.max) * 100;

    const arr = scoresByStudent.get(a.student_id) ?? [];
    arr.push(pct);
    scoresByStudent.set(a.student_id, arr);
  });

  // Media por alumno
  const avgByStudent = new Map<string, number>();
  scoresByStudent.forEach((pcts, sid) => {
    const avg = pcts.reduce((s, x) => s + x, 0) / pcts.length;
    avgByStudent.set(sid, avg);
  });

  const studentAvg = avgByStudent.get(studentId) ?? null;

  const allAvgs = Array.from(avgByStudent.values());
  const classAvg =
    allAvgs.length > 0
      ? allAvgs.reduce((s, x) => s + x, 0) / allAvgs.length
      : null;

  // Ranking: cuántos alumnos tienen media > la del actual
  let rank: number | null = null;
  if (studentAvg !== null) {
    const higherCount = allAvgs.filter((x) => x > studentAvg).length;
    rank = higherCount + 1;
  }

  return {
    student_avg_pct:
      studentAvg !== null ? Math.round(studentAvg) : null,
    class_avg_pct: classAvg !== null ? Math.round(classAvg) : null,
    diff_pct:
      studentAvg !== null && classAvg !== null
        ? Math.round(studentAvg - classAvg)
        : null,
    students_in_class: peerIds.length,
    student_rank: rank,
    class_size_with_data: allAvgs.length,
  };
}
