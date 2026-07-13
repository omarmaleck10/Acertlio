import { BarChart3 } from "lucide-react";

export default function ProfesorEstadisticasPage() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Estadísticas</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Rendimiento de tus alumnos
        </h1>
      </header>
      <div className="rounded border border-saffron/30 bg-saffron/5 p-8 text-center">
        <BarChart3 className="h-10 w-10 text-saffron mx-auto mb-4 opacity-70" />
        <p className="text-sm text-ink font-medium mb-2">Aún no hay datos</p>
        <p className="text-sm text-muted max-w-md mx-auto">
          Cuando tus alumnos empiecen a hacer simulacros, aquí verás sus
          puntuaciones Cambridge, tiempo por parte, evolución en el tiempo y
          debilidades por skill.
        </p>
      </div>
    </div>
  );
}
