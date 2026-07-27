import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, GraduationCap, BookOpenCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadStudentStats } from "@/lib/stats/student";
import { loadStudentComparison } from "@/lib/stats/comparison";
import { HeroStatsSection } from "@/components/alumno/stats/hero-stats";
import { EvolutionChart } from "@/components/alumno/stats/evolution-chart";
import { PartBreakdown } from "@/components/alumno/stats/part-breakdown";
import { TimeStatsSection } from "@/components/alumno/stats/time-stats";
import { ComparisonCard } from "@/components/profesor/stats/comparison-card";
import { StudentAttemptsHistory } from "@/components/profesor/stats/attempts-history";

interface Props {
  params: { studentId: string };
}

export default async function ProfesorAlumnoDetallePage({ params }: Props) {
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

  const admin = createAdminClient();

  // Verificar que el alumno existe y pertenece a la misma academia
  const { data: student } = await admin
    .from("profiles")
    .select("id, full_name, email, current_level, academy_id, role")
    .eq("id", params.studentId)
    .maybeSingle();

  if (!student || student.role !== "student") {
    notFound();
  }

  if (
    profile.role !== "super_admin" &&
    student.academy_id !== profile.academy_id
  ) {
    return (
      <div className="px-6 md:px-8 py-8">
        <p className="text-sm text-error">
          Este alumno no pertenece a tu academia.
        </p>
        <Link
          href="/profesor/estadisticas"
          className="text-sm text-navy hover:underline mt-4 inline-block"
        >
          Volver a estadísticas
        </Link>
      </div>
    );
  }

  // Si es teacher (no admin), verificar que enseña a este alumno
  const isAdmin =
    profile.role === "academy_admin" || profile.role === "super_admin";

  if (!isAdmin) {
    const { data: relation } = await admin
      .from("teacher_students")
      .select("student_id")
      .eq("teacher_id", user.id)
      .eq("student_id", params.studentId)
      .maybeSingle();

    if (!relation) {
      return (
        <div className="px-6 md:px-8 py-8">
          <p className="text-sm text-error">
            No estás vinculado a este alumno.
          </p>
          <Link
            href="/profesor/estadisticas"
            className="text-sm text-navy hover:underline mt-4 inline-block"
          >
            Volver a estadísticas
          </Link>
        </div>
      );
    }
  }

  const level = student.current_level ?? null;

  // Cargar stats + comparativa en paralelo
  const [stats, comparison] = await Promise.all([
    loadStudentStats(student.id, level),
    loadStudentComparison({
      studentId: student.id,
      academyId: profile.academy_id!,
      studentLevel: level,
    }),
  ]);

  const hasAnyData = stats.hero.mocks_completed > 0;

  return (
    <div className="px-6 md:px-8 py-8 max-w-5xl">
      {/* Volver */}
      <Link
        href="/profesor/estadisticas"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a estadísticas
      </Link>

      {/* Header alumno */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">
          Perfil del alumno
        </p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
          {student.full_name}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {student.email}
          </span>
          {level && (
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Nivel {level}
            </span>
          )}
        </div>
      </header>

      {!hasAnyData ? (
        <div className="rounded-lg border border-rule bg-white p-10 text-center">
          <BookOpenCheck className="h-12 w-12 text-muted mx-auto mb-4 opacity-40" />
          <p className="text-base font-medium text-ink mb-2">
            Este alumno aún no ha completado ningún mock
          </p>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            Cuando complete su primer mock (todos los papers), aparecerán
            aquí sus notas, evolución, aciertos por Part y tiempo empleado.
          </p>
        </div>
      ) : (
        <>
          <HeroStatsSection hero={stats.hero} />
          <ComparisonCard comparison={comparison} studentLevel={level} />
          <EvolutionChart points={stats.evolution} />
          <StudentAttemptsHistory attempts={stats.evolution} />
          <PartBreakdown parts={stats.parts} />
          <TimeStatsSection times={stats.times} />
        </>
      )}
    </div>
  );
}
