import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

export default async function ProfesorAlumnosPage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: assignments } = await supabase
    .from("teacher_students")
    .select("student_id")
    .eq("teacher_id", user.id);

  const studentIds = (assignments ?? []).map((a) => a.student_id);

  const { data: students } = studentIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, current_level, created_at")
        .in("id", studentIds)
        .eq("is_active", true)
        .order("full_name", { ascending: true })
    : { data: [] };

  return (
    <div className="px-8 py-8 max-w-4xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Alumnos</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Tus alumnos
        </h1>
        <p className="text-sm text-muted mt-2">
          {students && students.length > 0
            ? `${students.length} alumno${students.length === 1 ? "" : "s"} asignado${students.length === 1 ? "" : "s"}.`
            : "Sin alumnos asignados aún."}
        </p>
      </header>

      <section className="rounded border border-rule bg-white">
        {students && students.length > 0 ? (
          <ul className="divide-y divide-rule">
            {students.map((s) => (
              <li key={s.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink font-medium">
                    {s.full_name ?? "Sin nombre"}
                  </p>
                  <p className="text-xs text-muted font-mono">{s.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.current_level && (
                    <span className="text-xs font-mono px-2 py-1 rounded bg-navy-50 text-navy">
                      {s.current_level}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-12 text-center">
            <Users className="h-8 w-8 text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted mb-1">
              Aún no tienes alumnos asignados.
            </p>
            <p className="text-xs text-muted">
              Pide a tu academia que te asigne alumnos desde su panel de
              profesores.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
