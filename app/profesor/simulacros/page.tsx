import { ClipboardCheck } from "lucide-react";

export default function ProfesorSimulacrosPage() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Simulacros</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Asignar simulacros
        </h1>
      </header>
      <div className="rounded border border-saffron/30 bg-saffron/5 p-8 text-center">
        <ClipboardCheck className="h-10 w-10 text-saffron mx-auto mb-4 opacity-70" />
        <p className="text-sm text-ink font-medium mb-2">Próximamente</p>
        <p className="text-sm text-muted max-w-md mx-auto">
          Estamos terminando el catálogo de mocks B1, B2 y C1. Podrás asignar
          simulacros completos o partes sueltas a tus alumnos.
        </p>
      </div>
    </div>
  );
}
