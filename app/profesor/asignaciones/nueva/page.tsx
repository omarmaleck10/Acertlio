import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { AssignmentForm } from "@/components/profesor/assignment-form";
import type { ExamOption } from "@/components/profesor/assignment-form";
import type { StudentOption } from "@/components/profesor/student-multi-select";

export default async function NuevaAsignacionPage({
  searchParams,
}: {
  searchParams: { groupId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { profile } = user;
  if (!profile.academy_id) {
    return (
      <div className="px-6 md:px-8 py-8">
        <p className="text-sm text-muted">
          Tu cuenta no está asociada a una academia.
        </p>
      </div>
    );
  }

  const admin = createAdminClient();

  // 1. Cargar exámenes publicados
  const { data: examsData } = await admin
    .from("exams")
    .select("id, title, level, mock_number")
    .eq("is_published", true)
    .order("level", { ascending: true })
    .order("mock_number", { ascending: true });

  const exams: ExamOption[] = (examsData ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    level: e.level,
    mock_number: e.mock_number,
  }));

  // 2. Cargar alumnos que puede asignar
  const isAdmin = profile.role === "academy_admin";

  let studentIds: string[] = [];
  if (isAdmin) {
    // El admin ve TODOS los alumnos de la academia
    const { data: allStudents } = await admin
      .from("profiles")
      .select("id")
      .eq("academy_id", profile.academy_id)
      .eq("role", "student");
    studentIds = (allStudents ?? []).map((s) => s.id);
  } else {
    // El profesor ve dos fuentes de alumnos:
    //   1. Relación directa teacher_students
    //   2. Alumnos que están en grupos donde él es el teacher_id
    //
    // Query en 2 pasos (no depende de foreign keys implícitas):
    //   a. Grupos del profesor
    //   b. Miembros de esos grupos
    const [directRes, myGroups] = await Promise.all([
      admin
        .from("teacher_students")
        .select("student_id")
        .eq("teacher_id", user.id),
      admin
        .from("student_groups")
        .select("id")
        .eq("teacher_id", user.id),
    ]);

    const directIds = (directRes.data ?? []).map((r) => r.student_id);
    const groupIds = (myGroups.data ?? []).map((g) => g.id);

    let studentsFromGroups: string[] = [];
    if (groupIds.length > 0) {
      const { data: members } = await admin
        .from("student_group_members")
        .select("student_id")
        .in("group_id", groupIds);
      studentsFromGroups = (members ?? []).map((m) => m.student_id);
    }

    // Log para debug (visible en Vercel logs)
    console.log(
      `[Asignaciones profesor] user=${user.id} directIds=${directIds.length} groups=${groupIds.length} groupStudents=${studentsFromGroups.length}`
    );

    // Dedup
    studentIds = Array.from(
      new Set([...directIds, ...studentsFromGroups])
    );
  }

  let students: StudentOption[] = [];
  if (studentIds.length > 0) {
    const { data: studentsData } = await admin
      .from("profiles")
      .select("id, full_name, email, level")
      .in("id", studentIds)
      .order("full_name", { ascending: true });

    students = (studentsData ?? []).map((s) => ({
      id: s.id,
      full_name: s.full_name ?? "—",
      email: s.email ?? "",
      level: (s as unknown as Record<string, unknown>).level as string | null,
    }));
  }

  // Cargar grupos del profesor (o todos si es admin) + sus miembros
  let groups: {
    id: string;
    name: string;
    level: string | null;
    member_count: number;
    student_ids: string[];
  }[] = [];

  let groupsQuery = admin
    .from("student_groups")
    .select("id, name, level, teacher_id")
    .eq("academy_id", profile.academy_id)
    .eq("is_archived", false);

  if (!isAdmin) {
    groupsQuery = groupsQuery.eq("teacher_id", user.id);
  }

  const { data: groupsData } = await groupsQuery.order("name", {
    ascending: true,
  });

  if (groupsData && groupsData.length > 0) {
    const groupIds = groupsData.map((g) => g.id);
    const { data: membersData } = await admin
      .from("student_group_members")
      .select("group_id, student_id")
      .in("group_id", groupIds);

    const memberByGroup = new Map<string, string[]>();
    (membersData ?? []).forEach((m) => {
      const arr = memberByGroup.get(m.group_id) ?? [];
      arr.push(m.student_id);
      memberByGroup.set(m.group_id, arr);
    });

    groups = groupsData.map((g) => {
      const ids = memberByGroup.get(g.id) ?? [];
      return {
        id: g.id,
        name: g.name,
        level: g.level,
        member_count: ids.length,
        student_ids: ids,
      };
    });
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-4xl">
      <Link
        href="/profesor/asignaciones"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a asignaciones
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          Asignaciones · Nueva
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          Asignar simulacro
        </h1>
        <p className="text-sm text-muted mt-2 max-w-xl">
          Elige un simulacro, uno o varios alumnos, y opcionalmente una fecha
          límite. Cada alumno recibirá un email de aviso al momento.
        </p>
      </header>

      {students.length === 0 ? (
        <div className="rounded border border-saffron/30 bg-saffron/5 p-6">
          <p className="text-sm text-ink font-medium mb-1">
            No tienes alumnos asignados todavía
          </p>
          <p className="text-sm text-muted">
            Antes de poder asignar simulacros, necesitas tener alumnos vinculados a tu cuenta.
            {" "}
            {isAdmin
              ? "Invita alumnos desde la sección de gestión de alumnos."
              : "Habla con el admin de tu academia para que te asigne alumnos."}
          </p>
        </div>
      ) : (
        <AssignmentForm
          exams={exams}
          students={students}
          groups={groups}
          prefillGroupId={searchParams.groupId}
        />
      )}
    </div>
  );
}
