import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AssignStudentsList } from "@/components/academia/assign-students-list";

export default async function ProfesorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Datos del profesor
  const { data: teacher } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at, is_active")
    .eq("id", params.id)
    .eq("role", "teacher")
    .maybeSingle();

  if (!teacher) notFound();

  // Alumnos actualmente asignados a este profesor
  const { data: assignments } = await supabase
    .from("teacher_students")
    .select("student_id")
    .eq("teacher_id", params.id);

  const assignedIds = new Set((assignments ?? []).map((a) => a.student_id));

  // Todos los alumnos de la academia
  const { data: allStudents } = await supabase
    .from("profiles")
    .select("id, full_name, email, current_level")
    .eq("role", "student")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const studentList = (allStudents ?? []).map((s) => ({
    ...s,
    assigned: assignedIds.has(s.id),
  }));

  const assignedCount = studentList.filter((s) => s.assigned).length;

  return (
    <div className="px-8 py-8 max-w-4xl">
      <Link
        href="/academia/profesores"
        className="text-xs text-muted hover:text-ink inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a profesores
      </Link>

      <header className="mb-8">
        <h1 className="font-semibold text-3xl text-ink tracking-tight">
          {teacher.full_name ?? "Sin nombre"}
        </h1>
        <p className="text-sm text-muted font-mono mt-1">{teacher.email}</p>
      </header>

      <section className="rounded border border-rule bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="h-4 w-4 text-navy" />
          <h2 className="text-sm font-medium text-ink">
            Alumnos asignados ({assignedCount})
          </h2>
        </div>
        <p className="text-xs text-muted mb-4">
          Marca los alumnos que este profesor debe ver en su panel. Un alumno
          solo puede tener un profesor a la vez.
        </p>
        <AssignStudentsList
          teacherId={teacher.id}
          students={studentList}
        />
      </section>
    </div>
  );
}
