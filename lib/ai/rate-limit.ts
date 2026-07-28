import { createAdminClient } from "@/lib/supabase/admin";

export const AI_DAILY_LIMIT_PER_STUDENT = 10;


/**
 * Comprueba si el alumno ha superado el límite diario de correcciones IA.
 * Cuenta ai_corrections con status='success' en las últimas 24h.
 *
 * Retorna { allowed, used, limit, resetsAt }
 */
export async function checkAIRateLimit(studentId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  resetsAt: string;
}> {
  const admin = createAdminClient();
  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const { count } = await admin
    .from("ai_corrections")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("status", "success")
    .gte("created_at", twentyFourHoursAgo);

  const used = count ?? 0;
  const allowed = used < AI_DAILY_LIMIT_PER_STUDENT;

  // Reset "aproximado": no es una ventana fija, es rolling 24h
  // Devolvemos un timestamp orientativo (24h desde la corrección más antigua)
  const resetsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    allowed,
    used,
    limit: AI_DAILY_LIMIT_PER_STUDENT,
    resetsAt,
  };
}
