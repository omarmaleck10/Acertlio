import { FileWarning } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Superadmin</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Audit logs
        </h1>
      </header>
      <div className="rounded border border-saffron/30 bg-saffron/5 p-8 text-center">
        <FileWarning className="h-10 w-10 text-saffron mx-auto mb-4 opacity-70" />
        <p className="text-sm text-ink font-medium mb-2">Próximamente</p>
        <p className="text-sm text-muted max-w-md mx-auto">
          Registro de acciones sensibles: cambios de plan, impersonaciones de soporte, ediciones de exámenes, accesos privilegiados.
        </p>
      </div>
    </div>
  );
}
