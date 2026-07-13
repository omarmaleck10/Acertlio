import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { InviteForm } from "@/components/academia/invite-form";
import { createClient } from "@/lib/supabase/server";

export default async function AcademiaProfesoresPage() {
  const supabase = createClient();

  // Profesores existentes con conteo de alumnos asignados
  const { data: teachers } = await supabase
    .from("profiles")
    .select("id, full_name, email, is_active, created_at")
    .eq("role", "teacher")
    .order("created_at", { ascending: false });

  // Conteo de alumnos por profesor (subquery en JS por simplicidad)
  const teachersWithCounts = await Promise.all(
    (teachers ?? []).map(async (t) => {
      const { count } = await supabase
        .from("teacher_students")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", t.id);
      return { ...t, studentCount: count ?? 0 };
    })
  );

  // Invitaciones pendientes
  const { data: pending } = await supabase
    .from("invitations")
    .select("email, created_at, expires_at")
    .eq("role", "teacher")
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Profesores</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Tus profesores
        </h1>
        <p className="text-sm text-muted mt-2">
          Invita profesores y asígnales alumnos. Cada profesor solo verá los
          alumnos que le asignes.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <div className="rounded border border-rule bg-white p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-navy" />
              <h2 className="text-sm font-medium text-ink">Invitar profesor</h2>
            </div>
            <InviteForm kind="teacher" />
          </div>
        </aside>

        <div className="lg:col-span-2 space-y-6">
          <section className="rounded border border-rule bg-white">
            <header className="px-5 py-3 border-b border-rule">
              <h2 className="text-sm font-medium text-ink">
                Activos ({teachersWithCounts.length})
              </h2>
            </header>
            {teachersWithCounts.length > 0 ? (
              <ul className="divide-y divide-rule">
                {teachersWithCounts.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/academia/profesores/${t.id}`}
                      className="px-5 py-3 flex items-center justify-between hover:bg-paper transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-ink font-medium">
                          {t.full_name ?? "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted font-mono truncate">
                          {t.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-xs text-muted">
                          {t.studentCount} alumno
                          {t.studentCount === 1 ? "" : "s"}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-muted text-center">
                Aún no hay profesores activos. Invita al primero desde el formulario.
              </p>
            )}
          </section>

          {pending && pending.length > 0 && (
            <section className="rounded border border-rule bg-white">
              <header className="px-5 py-3 border-b border-rule">
                <h2 className="text-sm font-medium text-ink">
                  Pendientes de aceptar ({pending.length})
                </h2>
              </header>
              <ul className="divide-y divide-rule">
                {pending.map((inv, i) => (
                  <li
                    key={`${inv.email}-${i}`}
                    className="px-5 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-ink font-mono">{inv.email}</p>
                      <p className="text-xs text-muted mt-0.5">
                        Enviada{" "}
                        {new Date(inv.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <span className="text-xs text-saffron font-medium">
                      Pendiente
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
