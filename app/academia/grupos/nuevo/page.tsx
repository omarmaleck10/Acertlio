import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { GroupForm, type TeacherOption } from "@/components/academia/group-form";
import type { StudentOption } from "@/components/profesor/student-multi-select";

export default async function NuevoGrupoPage() {
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

  const admin = createAdminClient();

  // Cargar profesores de la academia
  const { data: teachersData } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .eq("academy_id", profile.academy_id)
    .in("role", ["teacher", "academy_admin"])
    .order("full_name", { ascending: true });

  const teachers: TeacherOption[] = (teachersData ?? []).map((t) => ({
    id: t.id,
    full_name: t.full_name ?? "—",
    email: t.email ?? "",
  }));

  // Cargar alumnos de la academia
  const { data: studentsData } = await admin
    .from("profiles")
    .select("id, full_name, email, current_level")
    .eq("academy_id", profile.academy_id)
    .eq("role", "student")
    .order("full_name", { ascending: true });

  const students: StudentOption[] = (studentsData ?? []).map((s) => ({
    id: s.id,
    full_name: s.full_name ?? "—",
    email: s.email ?? "",
    level: s.current_level ?? null,
  }));

  return (
    <div className="px-6 md:px-8 py-8 max-w-4xl">
      <Link
        href="/academia/grupos"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a grupos
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          Grupos · Nuevo
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          Crear grupo
        </h1>
        <p className="text-sm text-muted mt-2 max-w-xl">
          Un grupo suele representar una clase real de la academia (ej: B1
          los martes a las 18h). Puedes añadir alumnos ahora o después.
        </p>
      </header>

      <GroupForm mode="create" teachers={teachers} students={students} />
    </div>
  );
}
