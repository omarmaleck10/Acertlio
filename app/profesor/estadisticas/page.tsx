import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { loadTeacherStats } from "@/lib/stats/teacher";
import { TeacherOverviewCards } from "@/components/profesor/stats/overview-cards";
import { AttentionSection } from "@/components/profesor/stats/attention-section";
import { TopSection } from "@/components/profesor/stats/top-section";
import { StudentsTable } from "@/components/profesor/stats/students-table";

export default async function ProfesorEstadisticasPage() {
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
          Tu cuenta no está asociada a una academia.
        </p>
      </div>
    );
  }

  const isAdmin =
    profile.role === "academy_admin" || profile.role === "super_admin";

  const stats = await loadTeacherStats({
    teacherId: user.id,
    academyId: profile.academy_id,
    isAdmin,
  });

  const hasStudents = stats.students.length > 0;
  const hasAnyData = stats.students.some((s) => s.mocks_completed > 0);

  return (
    <div className="px-6 md:px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          Estadísticas
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          {isAdmin ? "Panel de la academia" : "Cómo van tus alumnos"}
        </h1>
        <p className="text-sm text-muted mt-2">
          {isAdmin
            ? "Vista panorámica de todos los alumnos de tu academia."
            : "Vista panorámica de los alumnos que enseñas."}
        </p>
      </header>

      {!hasStudents ? (
        <div className="rounded-lg border border-rule bg-white p-10 text-center">
          <BarChart3 className="h-12 w-12 text-muted mx-auto mb-4 opacity-40" />
          <p className="text-base font-medium text-ink mb-2">
            {isAdmin
              ? "Aún no hay alumnos en la academia"
              : "Aún no tienes alumnos asignados"}
          </p>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            {isAdmin
              ? "Invita a tus primeros alumnos desde la sección de gestión de alumnos."
              : "Habla con el admin de tu academia para que te asigne alumnos."}
          </p>
        </div>
      ) : (
        <>
          <TeacherOverviewCards kpis={stats.kpis} />

          {!hasAnyData && (
            <div className="rounded-lg border border-navy/20 bg-navy/5 p-5 mb-8">
              <p className="text-sm text-ink">
                <strong>Tus alumnos aún no han completado ningún mock.</strong>
              </p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Cuando terminen su primer mock, empezarán a aparecer notas,
                tendencias y las secciones de atención/destacan.
              </p>
            </div>
          )}

          <AttentionSection
            lowScore={stats.attention_low_score}
            inactive={stats.attention_inactive}
          />

          <TopSection students={stats.top_students} />

          <StudentsTable students={stats.students} />
        </>
      )}
    </div>
  );
}
