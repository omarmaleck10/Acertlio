import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { AcademyConfigForm } from "@/components/academia/config-form";

export default async function AcademiaConfiguracionPage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user?.profile.academy_id) return null;

  const { data: academy } = await supabase
    .from("academies")
    .select("name, cif, phone, address, city, email, plan, slug")
    .eq("id", user.profile.academy_id)
    .single();

  if (!academy) return null;

  return (
    <div className="px-8 py-8 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Configuración</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Datos de la academia
        </h1>
        <p className="text-sm text-muted mt-2">
          Estos datos aparecen en las facturas cuando montemos el sistema de
          pagos. Puedes editarlos cuando quieras.
        </p>
      </header>

      {/* Datos editables */}
      <section className="rounded border border-rule bg-white p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="h-4 w-4 text-navy" />
          <h2 className="text-sm font-medium text-ink">Editables</h2>
        </div>
        <AcademyConfigForm academy={academy} />
      </section>

      {/* Datos fijos (solo lectura) */}
      <section className="rounded border border-rule bg-paper p-6">
        <h2 className="text-sm font-medium text-ink mb-4">Otros datos</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-baseline gap-3">
            <dt className="w-32 text-xs uppercase tracking-wider text-muted shrink-0">
              Email cuenta
            </dt>
            <dd className="text-ink font-mono text-xs">{academy.email}</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="w-32 text-xs uppercase tracking-wider text-muted shrink-0">
              Plan
            </dt>
            <dd className="text-ink capitalize">{academy.plan}</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="w-32 text-xs uppercase tracking-wider text-muted shrink-0">
              Slug URL
            </dt>
            <dd className="text-ink font-mono text-xs">{academy.slug}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted mt-4">
          Para cambiar el plan o el email de la cuenta, escribe a{" "}
          <a href="mailto:hola@acertlio.com" className="text-navy hover:underline">
            hola@acertlio.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
