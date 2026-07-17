import Link from "next/link";
import { BookOpenCheck, Play, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AlumnoResumenPage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: academy } = user.profile.academy_id
    ? await supabase
        .from("academies")
        .select("name")
        .eq("id", user.profile.academy_id)
        .single()
    : { data: null };

  const admin = createAdminClient();
  const level = (user.profile as unknown as Record<string, unknown>).level as string | null | undefined;

  let examsQuery = admin
    .from("exams")
    .select("id, title, description, level, mock_number, total_time_minutes")
    .eq("is_published", true)
    .order("level", { ascending: true })
    .order("mock_number", { ascending: true });

  if (level) {
    examsQuery = examsQuery.eq("level", level);
  }

  const { data: availableExams } = await examsQuery;

  const { data: attempts } = await admin
    .from("attempts")
    .select("id, exam_id, status, started_at, submitted_at, exams(title, level)")
    .eq("student_id", user.id)
    .order("started_at", { ascending: false });

  const inProgress = (attempts ?? []).filter((a) => a.status === "in_progress");
  const submitted = (attempts ?? []).filter((a) => a.status !== "in_progress");
  const inProgressExamIds = new Set(inProgress.map((a) => a.exam_id));

  return (
    <div className="px-6 md:px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          {academy?.name ?? "Acertlio"} · Alumno
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          Hola, {user.profile.full_name?.split(" ")[0] ?? "alumno"}
        </h1>
        <p className="text-sm text-muted mt-2">
          {level ? (
            <>Preparación para el nivel <strong className="text-navy">{level}</strong>.</>
          ) : (
            "Aquí tienes los simulacros disponibles para tu preparación."
          )}
        </p>
      </header>

      {inProgress.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-ink mb-3 uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-saffron" />
            Continúa donde lo dejaste
          </h2>
          <div className="space-y-3">
            {inProgress.map((att) => {
              const examData = Array.isArray(att.exams) ? att.exams[0] : att.exams;
              return (
                <Link
                  key={att.id}
                  href={`/alumno/examen/${att.id}`}
                  className="block bg-white rounded-lg border-2 border-saffron/40 hover:border-saffron p-4 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-saffron font-medium">
                        En curso · {examData?.level}
                      </p>
                      <p className="text-base font-medium text-ink mt-0.5">
                        {examData?.title ?? "Examen"}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Empezado {new Date(att.started_at).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-saffron group-hover:gap-2 transition-all">
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-medium text-ink mb-3 uppercase tracking-wider flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-navy" />
          Simulacros disponibles
        </h2>

        {(availableExams?.filter((e) => !inProgressExamIds.has(e.id)) ?? []).length === 0 ? (
          <div className="bg-white rounded-lg border border-rule p-6 text-center">
            <p className="text-sm text-muted">
              No hay simulacros disponibles para ti todavía. Tu profesor te
              asignará exámenes pronto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(availableExams ?? [])
              .filter((e) => !inProgressExamIds.has(e.id))
              .map((exam) => (
                <Link
                  key={exam.id}
                  href={`/alumno/examen/inicio/${exam.id}`}
                  className="block bg-white rounded-lg border border-rule hover:border-navy p-4 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wider text-navy font-medium">
                      {exam.level} · Mock {exam.mock_number ?? "—"}
                    </span>
                    <span className="text-xs text-muted">
                      {exam.total_time_minutes} min
                    </span>
                  </div>
                  <p className="text-base font-medium text-ink group-hover:text-navy transition-colors">
                    {exam.title}
                  </p>
                  {exam.description && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {exam.description}
                    </p>
                  )}
                  <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-navy font-medium">
                    <Play className="h-3.5 w-3.5" />
                    Empezar
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>

      {submitted.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-ink mb-3 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-ok" />
            Exámenes completados
          </h2>
          <div className="bg-white rounded-lg border border-rule overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Examen</th>
                  <th className="text-left px-4 py-2 font-medium">Enviado</th>
                  <th className="text-left px-4 py-2 font-medium">Estado</th>
                  <th className="text-right px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {submitted.map((att) => {
                  const examData = Array.isArray(att.exams) ? att.exams[0] : att.exams;
                  return (
                    <tr key={att.id}>
                      <td className="px-4 py-3">
                        <p className="text-ink">{examData?.title ?? "—"}</p>
                        <p className="text-xs text-muted">{examData?.level}</p>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {att.submitted_at
                          ? new Date(att.submitted_at).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs">
                          {att.status === "submitted" && (
                            <>
                              <Clock className="h-3 w-3 text-saffron" />
                              <span className="text-saffron">Pendiente de corregir</span>
                            </>
                          )}
                          {att.status === "auto_graded" && (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-navy" />
                              <span className="text-navy">Autocorregido</span>
                            </>
                          )}
                          {att.status === "fully_graded" && (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-ok" />
                              <span className="text-ok">Corregido</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/alumno/examen/${att.id}/enviado`}
                          className="text-xs text-navy hover:underline"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
