import Link from "next/link";
import { Ticket, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReleaseLicenseButton } from "@/components/academia/release-license-button";

export default async function AcademiaLicenciasPage() {
  const supabase = createClient();

  // Traer todas las licencias con datos del alumno (si tiene)
  const { data: licenses } = await supabase
    .from("licenses")
    .select(
      "id, student_id, assigned_at, is_active, profiles!licenses_student_id_fkey(full_name, email, current_level)"
    )
    .eq("is_active", true)
    .order("assigned_at", { ascending: false, nullsFirst: false });

  const total = licenses?.length ?? 0;
  const assigned = licenses?.filter((l) => l.student_id).length ?? 0;
  const free = total - assigned;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Licencias</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Plazas concurrentes
        </h1>
        <p className="text-sm text-muted mt-2">
          Cada plaza concurrente puede tener un alumno activo. Al archivar un
          alumno la plaza vuelve a estar disponible para otro.
        </p>
      </header>

      {/* Contador visual */}
      <div className="mb-6 rounded border border-rule bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-navy" />
            <span className="text-sm text-ink font-medium">
              {assigned} de {total} ocupadas
            </span>
          </div>
          <span className="text-xs text-muted">
            {free} libre{free === 1 ? "" : "s"}
          </span>
        </div>
        {/* Barra de progreso */}
        <div className="h-2 bg-paper rounded overflow-hidden">
          <div
            className="h-full bg-navy transition-all"
            style={{ width: total > 0 ? `${(assigned / total) * 100}%` : "0%" }}
          />
        </div>
        {free === 0 && total > 0 && (
          <p className="text-xs text-saffron mt-3">
            No quedan plazas libres. Libera una o{" "}
            <Link href="/academia/facturacion" className="underline">
              sube de plan
            </Link>{" "}
            para invitar más alumnos.
          </p>
        )}
      </div>

      {/* Lista de licencias */}
      <section className="rounded border border-rule bg-white overflow-hidden">
        <header className="px-5 py-3 border-b border-rule">
          <h2 className="text-sm font-medium text-ink">Detalle</h2>
        </header>
        {licenses && licenses.length > 0 ? (
          <ul className="divide-y divide-rule">
            {licenses.map((license, i) => {
              const profile = Array.isArray(license.profiles)
                ? license.profiles[0]
                : license.profiles;
              return (
                <li
                  key={license.id}
                  className="px-5 py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted w-10 tabular-nums">
                      #{String(i + 1).padStart(3, "0")}
                    </span>
                    {profile ? (
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-ink font-medium truncate">
                          {profile.full_name ?? "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted font-mono truncate">
                          {profile.email}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted italic">Libre</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {profile?.current_level && (
                      <span className="text-xs font-mono px-2 py-1 rounded bg-navy-50 text-navy">
                        {profile.current_level}
                      </span>
                    )}
                    {license.assigned_at && (
                      <span className="text-xs text-muted hidden sm:inline">
                        Desde{" "}
                        {new Date(license.assigned_at).toLocaleDateString("es-ES")}
                      </span>
                    )}
                    {license.student_id && profile && (
                      <ReleaseLicenseButton
                        licenseId={license.id}
                        studentName={profile.full_name ?? profile.email}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-10 text-sm text-muted text-center">
            No hay licencias activas.
          </p>
        )}
      </section>

      {free < total * 0.1 && free > 0 && (
        <div className="mt-6 rounded border border-saffron/30 bg-saffron/5 p-4">
          <p className="text-sm text-ink font-medium">
            Quedan pocas plazas libres
          </p>
          <p className="text-xs text-muted mt-1 mb-2">
            Si tu academia va a crecer este curso, plantéate subir de plan para
            no bloquearte al invitar nuevos alumnos.
          </p>
          <Link
            href="/academia/facturacion"
            className="text-xs text-navy hover:underline inline-flex items-center gap-1"
          >
            Ver planes <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
