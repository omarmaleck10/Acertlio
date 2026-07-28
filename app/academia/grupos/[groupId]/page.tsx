import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Users, GraduationCap, Calendar, Archive } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGroupDetail } from "@/lib/groups/loader";
import { GroupForm, type TeacherOption } from "@/components/academia/group-form";
import { GroupMembersManager } from "@/components/academia/group-members-manager";
import type { StudentOption } from "@/components/profesor/student-multi-select";

interface Props {
  params: { groupId: string };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default async function AcademiaGrupoDetallePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { profile } = user;
  if (profile.role !== "academy_admin" && profile.role !== "super_admin") {
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

  const group = await loadGroupDetail(params.groupId);
  if (!group) notFound();

  const admin = createAdminClient();

  // Verificar que el grupo es de la academia
  const { data: groupCheck } = await admin
    .from("student_groups")
    .select("academy_id")
    .eq("id", params.groupId)
    .maybeSingle();

  if (
    profile.role !== "super_admin" &&
    groupCheck?.academy_id !== profile.academy_id
  ) {
    return (
      <div className="px-6 md:px-8 py-8">
        <p className="text-sm text-error">
          Este grupo no pertenece a tu academia.
        </p>
        <Link
          href="/academia/grupos"
          className="text-sm text-navy hover:underline mt-4 inline-block"
        >
          Volver a grupos
        </Link>
      </div>
    );
  }

  // Cargar profesores para el selector
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

  // Cargar todos los alumnos de la academia
  const { data: allStudentsData } = await admin
    .from("profiles")
    .select("id, full_name, email, current_level")
    .eq("academy_id", profile.academy_id)
    .eq("role", "student")
    .order("full_name", { ascending: true });

  const memberIds = new Set(group.members.map((m) => m.student_id));
  const candidates: StudentOption[] = (allStudentsData ?? [])
    .filter((s) => !memberIds.has(s.id))
    .map((s) => ({
      id: s.id,
      full_name: s.full_name ?? "—",
      email: s.email ?? "",
      level: s.current_level ?? null,
    }));

  return (
    <div className="px-6 md:px-8 py-8 max-w-5xl">
      <Link
        href="/academia/grupos"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a grupos
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-xs uppercase tracking-wider text-muted">
            Grupo
          </p>
          {group.level && (
            <span className="text-[10px] uppercase tracking-wider text-navy font-semibold px-2 py-0.5 rounded bg-navy/5">
              {group.level}
            </span>
          )}
          {group.is_archived && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted font-semibold px-2 py-0.5 rounded bg-paper">
              <Archive className="h-3 w-3" />
              Archivado
            </span>
          )}
        </div>
        <h1 className="text-3xl font-semibold text-ink tracking-tight">
          {group.name}
        </h1>
        {group.description && (
          <p className="text-sm text-muted mt-2">{group.description}</p>
        )}

        <div className="flex items-center gap-4 mt-4 text-sm text-muted flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            {group.teacher_name}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {group.member_count}{" "}
            {group.member_count === 1 ? "alumno" : "alumnos"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Creado el {formatDate(group.created_at)}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
        {/* Columna izquierda: Editar datos */}
        <section>
          <h2 className="text-sm font-medium text-ink uppercase tracking-wider mb-4">
            Datos del grupo
          </h2>
          <GroupForm
            mode="edit"
            groupId={group.id}
            teachers={teachers}
            students={[]}
            initialData={{
              name: group.name,
              level: group.level,
              teacherId: group.teacher_id,
              description: group.description,
            }}
          />
        </section>

        {/* Columna derecha: Miembros */}
        <section>
          <GroupMembersManager
            groupId={group.id}
            members={group.members}
            candidates={candidates}
          />
        </section>
      </div>
    </div>
  );
}
