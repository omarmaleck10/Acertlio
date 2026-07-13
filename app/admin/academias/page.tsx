import { Building2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminAcademiasPage() {
  const admin = createAdminClient();

  const { data: academies } = await admin
    .from("academies")
    .select("id, name, cif, city, plan, total_seats, status, created_at, email")
    .order("created_at", { ascending: false });

  // Para cada academia, conteo de alumnos y licencias usadas
  const academiesEnriched = await Promise.all(
    (academies ?? []).map(async (a) => {
      const [{ count: students }, { count: usedLic }] = await Promise.all([
        admin
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("academy_id", a.id)
          .eq("role", "student")
          .eq("is_active", true),
        admin
          .from("licenses")
          .select("*", { count: "exact", head: true })
          .eq("academy_id", a.id)
          .eq("is_active", true)
          .not("student_id", "is", null),
      ]);
      return { ...a, studentCount: students ?? 0, usedLic: usedLic ?? 0 };
    })
  );

  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Superadmin</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Todas las academias
        </h1>
        <p className="text-sm text-muted mt-2">
          {academiesEnriched.length} academia{academiesEnriched.length === 1 ? "" : "s"} registrada{academiesEnriched.length === 1 ? "" : "s"}.
        </p>
      </header>

      <section className="rounded border border-rule bg-white overflow-hidden">
        {academiesEnriched.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-rule">
              <tr className="text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Academia</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-right px-4 py-3 font-medium">Plazas</th>
                <th className="text-right px-4 py-3 font-medium">Alumnos</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {academiesEnriched.map((a) => (
                <tr key={a.id} className="hover:bg-paper">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{a.name}</p>
                    <p className="text-xs text-muted font-mono">{a.email}</p>
                    {a.city && (
                      <p className="text-xs text-muted mt-0.5">{a.city}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink capitalize">{a.plan}</td>
                  <td className="px-4 py-3 text-right font-mono text-ink tabular-nums">
                    {a.usedLic}/{a.total_seats}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-ink tabular-nums">
                    {a.studentCount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        a.status === "active"
                          ? "text-xs font-medium px-2 py-1 rounded bg-ok/10 text-ok"
                          : "text-xs font-medium px-2 py-1 rounded bg-muted/10 text-muted"
                      }
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted">
                    {new Date(a.created_at).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-5 py-12 text-center">
            <Building2 className="h-8 w-8 text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted">Aún no hay academias registradas.</p>
          </div>
        )}
      </section>
    </div>
  );
}
