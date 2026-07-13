import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { CreateExamForm } from "@/components/admin/create-exam-form";

export const metadata = { title: "Nuevo examen" };

export default async function AdminExamenNuevoPage() {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "super_admin") redirect("/login");

  return (
    <div className="px-8 py-8 max-w-2xl">
      <Link
        href="/admin/examenes"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-saffron">
          Nuevo examen
        </p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Crear un examen nuevo
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Elige el nivel y Acertlio generará la estructura oficial. Después
          rellenas las preguntas de cada parte.
        </p>
      </header>

      <CreateExamForm />
    </div>
  );
}
