import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ClipboardCheck,
  PenLine,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Vista del profesor con los intentos de los alumnos de su academia.
 * Por simplicidad muestra TODOS los intentos de la academia; refinar por
 * relación profesor-alumno queda para más adelante.
 */
export default async function ProfesorSimulacrosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    user.profile.role !== "teacher" &&
    user.profile.role !== "academy_admin" &&
    user.profile.role !== "super_admin"
  ) {
    redirect("/");
  }

  const admin = createAdminClient();

  // Obtener intentos de la academia del profesor
  const academyId = user.profile.academy_id;
  if (!academyId && user.profile.role !== "super_admin") {
    return (
      <div className="px-8 py-8 max-w-3xl">
        <p className="text-sm text-muted">
          Tu cuenta no está asociada a ninguna academia.
        </p>
      </div>
    );
  }

  let attemptsQuery = admin
    .from("attempts")
    .select(
      "id, status, started_at, submitted_at, raw_score, cambridge_score, estimated_grade, student_id, exams(id, title, level, mock_number), profiles!attempts_student_id_fkey(id, full_name, email)"
    )
    .order("started_at", { ascending: false })
    .limit(50);

  if (academyId) {
    attemptsQuery = attemptsQuery.eq("academy_id", academyId);
  }

  const { data: attempts } = await attemptsQuery;

  // Contar por estado
  const submitted = (attempts ?? []).filter((a) => a.status === "submitted").length;
  const autoGraded = (attempts ?? []).filter((a) => a.status === "auto_graded").length;
  const fullyGraded = (attempts ?? []).filter((a) => a.status === "fully_graded").length;
  const inProgress = (attempts ?? []).filter((a) => a.status === "in_progress").length;

  return (
    <div className="px-6 md:px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Simulacros</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Intentos de mis alumnos
        </h1>
        <p className="text-sm text-muted mt-2">
          Revisa los últimos exámenes realizados por los alumnos de tu academia.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-lg border border-rule p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="h-4 w-4 text-muted" />
            <p className="text-xs uppercase tracking-wider text-muted">Total</p>
          </div>
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {attempts?.length ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-rule p-4">
          <div className="flex items-center gap-2 mb-1">
            <PenLine className="h-4 w-4 text-saffron" />
            <p className="text-xs uppercase tracking-wider text-muted">Writing pendiente</p>
          </div>
          <p className="text-2xl font-semibold text-saffron tabular-nums">
            {submitted}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-rule p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-navy" />
            <p className="text-xs uppercase tracking-wider text-muted">Autocorregidos</p>
          </div>
          <p className="text-2xl font-semibold text-navy tabular-nums">
            {autoGraded}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-rule p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-ok" />
            <p className="text-xs uppercase tracking-wider text-muted">Completados</p>
          </div>
          <p className="text-2xl font-semibold text-ok tabular-nums">
            {fullyGraded}
          </p>
        </div>
      </div>

      {/* Lista */}
      {!attempts || attempts.length === 0 ? (
        <div className="bg-white rounded-lg border border-rule p-8 text-center">
          <ClipboardCheck className="h-10 w-10 text-muted mx-auto mb-4 opacity-50" />
          <p className="text-sm text-ink font-medium mb-1">
            Todavía no hay intentos
          </p>
          <p className="text-sm text-muted max-w-md mx-auto">
            Cuando tus alumnos hagan simulacros, aparecerán aquí para que puedas
            revisar sus resultados.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-rule overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Alumno</th>
                <th className="text-left px-4 py-3 font-medium">Examen</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Enviado
                </th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Nota</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {attempts.map((att) => {
                const examData = Array.isArray(att.exams) ? att.exams[0] : att.exams;
                const studentProfile = Array.isArray(att.profiles)
                  ? att.profiles[0]
                  : att.profiles;
                return (
                  <tr key={att.id} className="hover:bg-paper/50">
                    <td className="px-4 py-3">
                      <p className="text-ink font-medium">
                        {studentProfile?.full_name ?? "Alumno"}
                      </p>
                      <p className="text-xs text-muted truncate max-w-[200px]">
                        {studentProfile?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink text-sm">{examData?.title ?? "—"}</p>
                      <p className="text-xs text-muted">
                        {examData?.level} · Mock {examData?.mock_number ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs hidden md:table-cell">
                      {att.submitted_at
                        ? new Date(att.submitted_at).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={att.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {att.cambridge_score ? (
                        <div>
                          <p className="font-mono text-ink text-sm">
                            {att.cambridge_score}
                          </p>
                          <p className="text-xs text-muted">
                            {att.estimated_grade}
                          </p>
                        </div>
                      ) : att.status === "in_progress" ? (
                        <span className="text-xs text-muted">—</span>
                      ) : (
                        <span className="text-xs text-muted">Pendiente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {att.status !== "in_progress" && (
                        <Link
                          href={`/profesor/simulacros/${att.id}`}
                          className="inline-flex items-center gap-1 text-xs text-navy hover:underline"
                        >
                          Ver
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3 text-muted" />
        <span className="text-muted">En curso</span>
      </span>
    );
  }
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <PenLine className="h-3 w-3 text-saffron" />
        <span className="text-saffron">Writing pendiente</span>
      </span>
    );
  }
  if (status === "auto_graded") {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <CheckCircle2 className="h-3 w-3 text-navy" />
        <span className="text-navy">Autocorregido</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <CheckCircle2 className="h-3 w-3 text-ok" />
      <span className="text-ok">Completado</span>
    </span>
  );
}
