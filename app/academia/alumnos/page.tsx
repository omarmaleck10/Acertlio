import { GraduationCap, Ticket } from "lucide-react";
import { InviteForm } from "@/components/academia/invite-form";
import { createClient } from "@/lib/supabase/server";

export default async function AcademiaAlumnosPage() {
  const supabase = createClient();

  // Alumnos activos (RLS filtra por academia)
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email, current_level, is_active, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  // Invitaciones pendientes de alumnos
  const { data: pending } = await supabase
    .from("invitations")
    .select("email, created_at")
    .eq("role", "student")
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  // Contar licencias libres y totales
  const { count: totalLicenses } = await supabase
    .from("licenses")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: usedLicenses } = await supabase
    .from("licenses")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .not("student_id", "is", null);

  const total = totalLicenses ?? 0;
  const used = usedLicenses ?? 0;
  const free = total - used;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Alumnos</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Tus alumnos
        </h1>
        <p className="text-sm text-muted mt-2">
          Da de alta alumnos por email. Cada uno ocupa una plaza concurrente
          hasta que se archive.
        </p>
      </header>

      {/* Contador de licencias */}
      <div className="mb-6 rounded border border-rule bg-white px-5 py-4 flex items-center gap-6">
        <Ticket className="h-5 w-5 text-navy shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-ink font-medium">
            {used} <span className="text-muted">de {total} plazas ocupadas</span>
          </p>
          <p className="text-xs text-muted mt-0.5">
            {free > 0
              ? `${free} plaza${free === 1 ? "" : "s"} libre${free === 1 ? "" : "s"}`
              : "No quedan plazas libres — libera una o sube de plan."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario de invitación */}
        <aside className="lg:col-span-1">
          <div className="rounded border border-rule bg-white p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-4 w-4 text-navy" />
              <h2 className="text-sm font-medium text-ink">Invitar alumno</h2>
            </div>
            <InviteForm kind="student" />
          </div>
        </aside>

        {/* Listados */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded border border-rule bg-white">
            <header className="px-5 py-3 border-b border-rule">
              <h2 className="text-sm font-medium text-ink">
                Activos ({students?.length ?? 0})
              </h2>
            </header>
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
                    {s.current_level && (
                      <span className="text-xs font-mono px-2 py-1 rounded bg-navy-50 text-navy">
                        {s.current_level}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-muted text-center">
                Aún no hay alumnos. Invita al primero desde el formulario.
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
                  <li key={`${inv.email}-${i}`} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ink font-mono">{inv.email}</p>
                      <p className="text-xs text-muted mt-0.5">
                        Enviada {new Date(inv.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <span className="text-xs text-saffron font-medium">Pendiente</span>
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
