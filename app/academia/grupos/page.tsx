import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadAcademyGroups } from "@/lib/groups/loader";
import { GroupCard } from "@/components/academia/group-card";

export default async function AcademiaGruposPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { profile } = user;
  if (
    profile.role !== "academy_admin" &&
    profile.role !== "super_admin"
  ) {
    redirect("/");
  }

  if (!profile.academy_id) {
    return (
      <div className="px-6 md:px-8 py-8">
        <p className="text-sm text-muted">
          Tu cuenta no está vinculada a una academia.
        </p>
      </div>
    );
  }

  const groups = await loadAcademyGroups({
    academyId: profile.academy_id,
    userId: user.id,
    isAdmin: true,
    includeArchived: false,
  });

  return (
    <div className="px-6 md:px-8 py-8 max-w-6xl">
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            Organización
          </p>
          <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
            Grupos y clases
          </h1>
          <p className="text-sm text-muted mt-2 max-w-xl">
            Organiza a tus alumnos por clases o grupos. Cada grupo tiene un
            profesor titular y facilita asignar mocks a varios alumnos a la vez.
          </p>
        </div>
        <Link
          href="/academia/grupos/nuevo"
          className="inline-flex items-center gap-2 rounded bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo grupo
        </Link>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-rule bg-white p-12 text-center">
          <Users className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-ink mb-1">
            Aún no has creado ningún grupo
          </p>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">
            Los grupos ayudan a tus profesores a asignar simulacros a
            varias personas a la vez. Cada grupo tiene un profesor titular.
          </p>
          <Link
            href="/academia/grupos/nuevo"
            className="inline-flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear el primer grupo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
