import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Pantalla mostrada tras enviar el examen (o al intentar acceder a un attempt
 * que ya fue enviado). No muestra resultados todavía — eso es la Fase 3E.
 */
export default async function ExamenEnviadoPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, student_id, status, submitted_at, time_spent_seconds, exams(title, level)")
    .eq("id", params.attemptId)
    .maybeSingle();

  if (!attempt) notFound();
  if (attempt.student_id !== user.id && user.profile.role !== "super_admin") {
    notFound();
  }

  const examData = Array.isArray(attempt.exams) ? attempt.exams[0] : attempt.exams;
  const submittedAt = attempt.submitted_at ? new Date(attempt.submitted_at) : null;
  const timeSpentMin = Math.round((attempt.time_spent_seconds ?? 0) / 60);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full bg-white rounded-lg border border-rule p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ok/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-ok" />
        </div>

        <h1 className="text-2xl font-semibold text-ink mb-2">
          Examen enviado
        </h1>

        <p className="text-sm text-muted mb-6 leading-relaxed">
          Tu examen se ha guardado correctamente. Tu profesor lo corregirá pronto
          y podrás ver los resultados en cuanto estén listos.
        </p>

        <div className="rounded border border-rule bg-paper p-4 mb-6 text-left space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Examen</span>
            <span className="font-medium text-ink">{examData?.title ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Nivel</span>
            <span className="font-mono text-navy">{examData?.level ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Enviado</span>
            <span className="text-ink">
              {submittedAt
                ? submittedAt.toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Tiempo usado
            </span>
            <span className="text-ink">{timeSpentMin} min</span>
          </div>
        </div>

        <Link
          href="/alumno"
          className="inline-flex items-center justify-center h-10 px-5 rounded bg-navy text-white text-sm font-medium hover:bg-navy-600"
        >
          Volver a mi dashboard
        </Link>
      </div>
    </div>
  );
}
