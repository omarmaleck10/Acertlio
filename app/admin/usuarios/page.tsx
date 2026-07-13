import { Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminUsuariosPage() {
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email, role, current_level, is_active, created_at, academies(name)")
    .order("created_at", { ascending: false })
    .limit(200); // paginación real en futuras iteraciones

  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Superadmin</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Usuarios
        </h1>
        <p className="text-sm text-muted mt-2">
          {profiles?.length ?? 0} usuario{(profiles?.length ?? 0) === 1 ? "" : "s"} · Mostrando últimos 200
        </p>
      </header>

      <section className="rounded border border-rule bg-white overflow-hidden">
        {profiles && profiles.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-rule">
              <tr className="text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 font-medium">Rol</th>
                <th className="text-left px-4 py-3 font-medium">Academia</th>
                <th className="text-left px-4 py-3 font-medium">Nivel</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {profiles.map((p) => {
                const acad = Array.isArray(p.academies) ? p.academies[0] : p.academies;
                return (
                  <tr key={p.id} className="hover:bg-paper">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {p.full_name ?? "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted font-mono">{p.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink capitalize">
                      {p.role.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {acad?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {p.current_level ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.is_active
                            ? "text-xs font-medium px-2 py-1 rounded bg-ok/10 text-ok"
                            : "text-xs font-medium px-2 py-1 rounded bg-muted/10 text-muted"
                        }
                      >
                        {p.is_active ? "activo" : "archivado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted">
                      {new Date(p.created_at).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-5 py-12 text-center">
            <Users className="h-8 w-8 text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted">Aún no hay usuarios registrados.</p>
          </div>
        )}
      </section>
    </div>
  );
}
