import { createAdminClient } from "@/lib/supabase/admin";

export interface GroupSummary {
  id: string;
  name: string;
  level: string | null;
  description: string | null;
  teacher_id: string;
  teacher_name: string | null;
  member_count: number;
  is_archived: boolean;
  created_at: string;
}

export interface GroupDetail extends GroupSummary {
  members: {
    student_id: string;
    full_name: string;
    email: string;
    level: string | null;
    joined_at: string;
  }[];
}


/**
 * Carga los grupos visibles para el usuario.
 *
 * · academy_admin: todos los grupos de su academia
 * · teacher: solo los grupos donde es titular
 */
export async function loadAcademyGroups(params: {
  academyId: string;
  userId: string;
  isAdmin: boolean;
  includeArchived?: boolean;
}): Promise<GroupSummary[]> {
  const admin = createAdminClient();

  let query = admin
    .from("student_groups")
    .select("id, name, level, description, teacher_id, is_archived, created_at")
    .eq("academy_id", params.academyId);

  if (!params.includeArchived) {
    query = query.eq("is_archived", false);
  }

  if (!params.isAdmin) {
    query = query.eq("teacher_id", params.userId);
  }

  const { data: groups } = await query.order("created_at", { ascending: false });
  if (!groups || groups.length === 0) return [];

  // Contar miembros
  const groupIds = groups.map((g) => g.id);
  const { data: members } = await admin
    .from("student_group_members")
    .select("group_id")
    .in("group_id", groupIds);

  const countByGroup = new Map<string, number>();
  (members ?? []).forEach((m) => {
    countByGroup.set(m.group_id, (countByGroup.get(m.group_id) ?? 0) + 1);
  });

  // Nombres de profesores
  const teacherIds = Array.from(new Set(groups.map((g) => g.teacher_id)));
  const { data: teachers } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", teacherIds);

  const nameByTeacher = new Map<string, string>();
  (teachers ?? []).forEach((t) => nameByTeacher.set(t.id, t.full_name ?? "—"));

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    level: g.level,
    description: g.description,
    teacher_id: g.teacher_id,
    teacher_name: nameByTeacher.get(g.teacher_id) ?? null,
    member_count: countByGroup.get(g.id) ?? 0,
    is_archived: g.is_archived,
    created_at: g.created_at,
  }));
}


/**
 * Detalle de un grupo con sus miembros.
 */
export async function loadGroupDetail(
  groupId: string
): Promise<GroupDetail | null> {
  const admin = createAdminClient();

  const { data: group } = await admin
    .from("student_groups")
    .select("id, name, level, description, teacher_id, is_archived, created_at, academy_id")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) return null;

  // Miembros
  const { data: members } = await admin
    .from("student_group_members")
    .select("student_id, joined_at")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: false });

  const studentIds = (members ?? []).map((m) => m.student_id);

  const { data: profiles } = studentIds.length
    ? await admin
        .from("profiles")
        .select("id, full_name, email, current_level")
        .in("id", studentIds)
    : { data: [] };

  const profileById = new Map<
    string,
    { name: string; email: string; level: string | null }
  >();
  (profiles ?? []).forEach((p) =>
    profileById.set(p.id, {
      name: p.full_name ?? "—",
      email: p.email ?? "",
      level: p.current_level ?? null,
    })
  );

  // Nombre profesor
  const { data: teacher } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", group.teacher_id)
    .maybeSingle();

  const memberList = (members ?? []).map((m) => {
    const p = profileById.get(m.student_id);
    return {
      student_id: m.student_id,
      full_name: p?.name ?? "—",
      email: p?.email ?? "",
      level: p?.level ?? null,
      joined_at: m.joined_at,
    };
  });

  return {
    id: group.id,
    name: group.name,
    level: group.level,
    description: group.description,
    teacher_id: group.teacher_id,
    teacher_name: teacher?.full_name ?? null,
    member_count: memberList.length,
    is_archived: group.is_archived,
    created_at: group.created_at,
    members: memberList,
  };
}
