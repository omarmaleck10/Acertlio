import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { correctAndSaveWriting } from "@/lib/ai/writing-correction";

/**
 * Cron job: encuentra Writings de alumnos de academia que llevan más de
 * 7 días sin corregir por profesor humano y los corrige con IA como
 * fallback. Envía email al alumno cuando termina.
 *
 * Se dispara a través de Vercel Cron (ver vercel.json).
 * Autenticación: header Authorization con CRON_SECRET.
 *
 * Ejecuta como max 20 correcciones por invocación para evitar
 * timeouts. Los sobrantes se procesarán en la siguiente ejecución.
 */

const MAX_CORRECTIONS_PER_RUN = 20;
const FALLBACK_AFTER_DAYS = 7;

export async function GET(request: NextRequest) {
  // Verificar autorización
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET no está configurada" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fecha límite: attempts submitted hace >7 días
  const cutoffDate = new Date(
    Date.now() - FALLBACK_AFTER_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  // Buscar attempts submitted hace >7d con al menos 1 writing pendiente
  // (sin fila en writing_corrections o con corrected_at null)
  const { data: candidates } = await admin
    .from("attempts")
    .select("id, student_id, exam_id, submitted_at, academy_id, exams(level)")
    .eq("status", "submitted")
    .not("academy_id", "is", null) // solo alumnos de academia
    .lt("submitted_at", cutoffDate)
    .order("submitted_at", { ascending: true })
    .limit(MAX_CORRECTIONS_PER_RUN);

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "No hay attempts pendientes >7d",
      processed: 0,
    });
  }

  const results = {
    processed: 0,
    corrected: 0,
    skipped: 0,
    errors: 0,
    details: [] as Array<{ attempt_id: string; result: string }>,
  };

  for (const attempt of candidates) {
    results.processed += 1;

    try {
      // Verificar que este attempt aún tiene writings pendientes
      const { data: pendingCheck } = await admin
        .from("writing_corrections")
        .select("question_id, status, corrected_by_ai")
        .eq("attempt_id", attempt.id);

      // Cargar preguntas Writing del examen
      const { data: parts } = await admin
        .from("exam_parts")
        .select("id, part_number")
        .eq("exam_id", attempt.exam_id);

      const partIds = (parts ?? []).map((p) => p.id);
      if (partIds.length === 0) {
        results.skipped += 1;
        results.details.push({
          attempt_id: attempt.id,
          result: "no exam parts",
        });
        continue;
      }

      const { data: questions } = await admin
        .from("questions")
        .select("id, part_id, question_type, stem, context")
        .in("part_id", partIds);

      const WRITING_TYPES = [
        "essay",
        "letter",
        "email",
        "article",
        "review",
        "report",
        "story",
        "open_response",
      ];

      const writingQuestions = (questions ?? []).filter((q) =>
        WRITING_TYPES.includes(q.question_type as string)
      );

      if (writingQuestions.length === 0) {
        results.skipped += 1;
        results.details.push({
          attempt_id: attempt.id,
          result: "no writing questions",
        });
        continue;
      }

      // Filtrar las que YA están corregidas
      const alreadyCorrected = new Set(
        (pendingCheck ?? [])
          .filter(
            (c) => c.status === "completed" || c.corrected_by_ai === true
          )
          .map((c) => c.question_id)
      );

      const pendingWritings = writingQuestions.filter(
        (q) => !alreadyCorrected.has(q.id)
      );

      if (pendingWritings.length === 0) {
        results.skipped += 1;
        results.details.push({
          attempt_id: attempt.id,
          result: "all already corrected",
        });
        continue;
      }

      // Cargar respuestas del alumno
      const questionIds = pendingWritings.map((q) => q.id);
      const { data: answers } = await admin
        .from("answers")
        .select("question_id, answer_text")
        .eq("attempt_id", attempt.id)
        .in("question_id", questionIds);

      const answerByQ = new Map(
        (answers ?? []).map((a) => [a.question_id, a.answer_text ?? ""])
      );

      // Corregir cada writing pendiente
      const examData = Array.isArray(attempt.exams)
        ? attempt.exams[0]
        : attempt.exams;
      const level = (examData?.level ?? "B1") as string;

      const partById = new Map(
        (parts ?? []).map((p) => [p.id, p.part_number])
      );

      for (const q of pendingWritings) {
        const answerText = answerByQ.get(q.id) ?? "";
        if (!answerText.trim()) continue; // saltar vacíos

        const context = (q.context ?? {}) as Record<string, unknown>;
        const taskInstruction =
          (context.task_instruction as string) ||
          (context.instruction as string) ||
          q.stem ||
          "";
        const wordMin = context.word_count_min as number | undefined;
        const wordMax = context.word_count_max as number | undefined;
        const taskType = (context.task_type as string) ?? null;

        try {
          const res = await correctAndSaveWriting({
            attemptId: attempt.id,
            questionId: q.id,
            studentId: attempt.student_id,
            academyId: attempt.academy_id ?? null,
            input: {
              cambridgeLevel: level,
              partNumber: partById.get(q.part_id) ?? 1,
              taskInstruction,
              taskType,
              studentResponse: answerText,
              wordCountTarget:
                wordMin && wordMax ? { min: wordMin, max: wordMax } : null,
            },
            triggeredBy: "fallback",
          });
          if (res.ok) {
            results.corrected += 1;
          } else {
            results.errors += 1;
            console.error(
              `[cron ai-fallback] q=${q.id} falló:`,
              res.error
            );
          }
        } catch (e) {
          console.error(
            `Fallback correction failed for ${q.id}:`,
            e instanceof Error ? e.message : String(e)
          );
          results.errors += 1;
        }
      }

      results.details.push({
        attempt_id: attempt.id,
        result: `processed ${pendingWritings.length} writings`,
      });
    } catch (e) {
      console.error(`Fallback for attempt ${attempt.id} failed:`, e);
      results.errors += 1;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}


// Vercel Cron solo hace GET, pero POST también funciona por si acaso
export const POST = GET;
