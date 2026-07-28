import Link from "next/link";
import { redirect } from "next/navigation";
import { Users2, GraduationCap, Users, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadAcademyGroups } from "@/lib/groups/loader";

export default async function ProfesorGruposPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { profile } = user;
  if (
    profile.role !== "teacher" &&
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

  const isAdmin =
    profile.role === "academy_admin" || profile.role === "super_admin";

  const groups = await loadAcademyGroups({
    academyId: profile.academy_id,
    userId: user.id,
    isAdmin, // teacher solo ve los suyos, admin ve todos
    includeArchived: false,
  });

  return (
    <div className="px-6 md:px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          Grupos y clases
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          {isAdmin ? "Grupos de la academia" : "Tus grupos"}
        </h1>
        <p className="text-sm text-muted mt-2 max-w-xl">
          {isAdmin
            ? "Todos los grupos activos de la academia. Puedes gestionarlos desde el panel de admin."
            : "Los grupos donde eres profesor titular. Puedes asignar simulacros a un grupo entero desde 'Asignaciones'."}
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-rule bg-white p-10 text-center">
          <Users2 className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-ink mb-1">
            {isAdmin
              ? "Aún no hay grupos creados en la academia"
              : "Aún no eres titular de ningún grupo"}
          </p>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            {isAdmin
              ? "Créalos desde el panel de admin. Los grupos ayudan a asignar mocks a varios alumnos a la vez."
              : "Habla con el admin de tu academia para que te asigne como titular de una clase."}
          </p>
          {isAdmin && (
            <Link
              href="/academia/grupos/nuevo"
              className="inline-flex items-center gap-2 rounded bg-navy px-4 py-2 mt-6 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
            >
              Crear un grupo
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/profesor/grupos/${g.id}`}
              className="block rounded-lg border border-rule bg-white p-5 hover:border-navy/40 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-3">
                {g.level && (
                  <span className="text-[10px] uppercase tracking-wider text-navy font-semibold px-2 py-0.5 rounded bg-navy/5">
                    {g.level}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-ink mb-1">{g.name}</h3>

              {g.description && (
                <p className="text-sm text-muted line-clamp-2 mb-3">
                  {g.description}
                </p>
              )}

              <div className="space-y-1.5 mt-4 text-xs text-muted">
                {isAdmin && g.teacher_name && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3 w-3" />
                    <span>
                      Profesor:{" "}
                      <strong className="text-ink font-medium">
                        {g.teacher_name}
                      </strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  <span>
                    <strong className="text-ink font-medium">
                      {g.member_count}
                    </strong>{" "}
                    {g.member_count === 1 ? "alumno" : "alumnos"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-rule flex items-center justify-between">
                <p className="text-xs text-muted">Ver detalle</p>
                <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-navy transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
