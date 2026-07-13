import { Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { ReleaseLicenseButton } from "@/components/academia/release-license-button";

interface LicenseWithStudent {
  id: string;
  student_id: string | null;
  assigned_at: string | null;
  student?: {
    full_name: string | null;
    email: string;
    current_level: string | null;
  } | null;
}

export default async function AcademiaLicenciasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const supabase = createClient();

  const { data: academy } = await admin
    .from("academies")
    .select("total_seats, plan")
    .eq("id", user.profile.academy_id!)
    .maybeSingle();

  // Traer licencias activas de esta academia
  const { data: licensesRaw } = await supabase
    .from("licenses")
    .select("id, student_id, assigned_at, released_at")
    .eq("is_active", true)
    .order("assigned_at", { ascending: false, nullsFirst: false });

  const licenses = licensesRaw ?? [];

  // Traer datos de todos los alumnos asignados en una sola query
  const studentIds = licenses.map((l) => l.student_id).filter((id): id is string => !!id);
  const { data: students } = studentIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, current_level")
        .in("id", studentIds)
    : { data: [] };

  const studentsById = new Map((students ?? []).map((s) => [s.id, s]));

  const occupied: LicenseWithStudent[] = licenses
    .filter((l) => l.student_id)
    .map((l) => ({
      ...l,
      student: studentsById.get(l.student_id!) as LicenseWithStudent["student"],
    }));

  const free = licenses.filter((l) => !l.student_id);

  const total = academy?.total_seats ?? 0;
  const used = occupied.length;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Licencias</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Plazas de tu academia
        </h1>
        <p className="text-sm text-muted mt-2">
          Cada licencia es una plaza concurrente. Al archivar un alumno, su plaza
          vuelve al pool y puedes asignársela a otro.
        </p>
      </header>

      {/* Resumen */}
      <div className="rounded border border-rule bg-white px-6 py-5 mb-6 flex items-center gap-6 flex-wrap">
        <Ticket className="h-8 w-8 text-navy shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-ink font-medium">
            {used} <span className="text-muted font-normal">de {total} plazas ocupadas</span>
          </p>
          <p className="text-xs text-muted mt-1">
            {free.length} plaza{free.length === 1 ? "" : "s"} libre
            {free.length === 1 ? "" : "s"} · Plan {academy?.plan}
          </p>
        </div>
        {/* Barra visual */}
        <div className="w-40 h-2 rounded-full bg-rule overflow-hidden">
          <div
            className="h-full bg-navy transition-all"
            style={{ width: `${total > 0 ? (used / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Licencias ocupadas */}
      <section className="rounded border border-rule bg-white mb-6">
        <header className="px-5 py-3 border-b border-rule">
          <h2 className="text-sm font-medium text-ink">Ocupadas ({used})</h2>
        </header>
        {occupied.length > 0 ? (
          <ul className="divide-y divide-rule">
            {occupied.map((l) => (
              <li
                key={l.id}
                className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div>
                    <p className="text-sm text-ink font-medium">
                      {l.student?.full_name ?? "Alumno sin nombre"}
                    </p>
                    <p className="text-xs text-muted font-mono">
                      {l.student?.email}
                    </p>
                  </div>
                  {l.student?.current_level && (
                    <span className="text-xs font-mono px-2 py-1 rounded bg-navy-50 text-navy">
                      {l.student.current_level}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {l.assigned_at && (
                    <span className="text-xs text-muted">
                      Desde{" "}
                      {new Date(l.assigned_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <ReleaseLicenseButton
                    licenseId={l.id}
                    studentName={l.student?.full_name ?? "este alumno"}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-sm text-muted text-center">
            Ninguna plaza ocupada aún.
          </p>
        )}
      </section>

      {/* Licencias libres */}
      <section className="rounded border border-rule bg-white">
        <header className="px-5 py-3 border-b border-rule">
          <h2 className="text-sm font-medium text-ink">Libres ({free.length})</h2>
        </header>
        {free.length > 0 ? (
          <div className="px-5 py-4 flex flex-wrap gap-2">
            {free.map((l) => (
              <span
                key={l.id}
                className="text-xs font-mono px-2 py-1 rounded bg-paper border border-rule text-muted"
              >
                Libre
              </span>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-sm text-muted text-center">
            No quedan plazas libres. Libera una o sube de plan.
          </p>
        )}
      </section>
    </div>
  );
}
