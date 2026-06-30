import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const recentActivity = [
  { who: "Lucía Romero", what: "Completó B2 First — Mock 03", when: "hace 12 min", score: "168 / 190" },
  { who: "Pablo Castaño", what: "Inició C1 Advanced — Mock 01", when: "hace 38 min", score: "—" },
  { who: "María Pérez", what: "Writing pendiente de corrección", when: "hace 1 h", score: "—" },
  { who: "Daniel Ortega", what: "Completó B1 Preliminary — Mock 02", when: "hace 2 h", score: "138 / 170" },
  { who: "Sara Núñez", what: "Liberada licencia (curso terminado)", when: "hace 3 h", score: "—" },
  { who: "Iván Molina", what: "Completó B2 First — Mock 02", when: "hace 5 h", score: "172 / 190" },
];

export default function AcademiaDashboard() {
  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Resumen · 27 de junio</p>
          <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">Buenos días</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Invitar alumno
        </Button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard label="Licencias usadas" value="38 / 50" hint="76 % de ocupación" />
        <StatCard label="Alumnos activos" value="38" trend={{ value: "+4 esta semana", positive: true }} />
        <StatCard label="Profesores" value="6" />
        <StatCard label="Media de aciertos" value="74 %" trend={{ value: "+2,1 % este mes", positive: true }} />
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <section className="lg:col-span-2 rounded border border-rule bg-white">
          <header className="px-6 py-4 border-b border-rule flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Actividad reciente</h2>
            <button className="text-xs text-muted hover:text-ink">Ver toda</button>
          </header>
          <ul className="divide-y divide-rule">
            {recentActivity.map((row, i) => (
              <li key={i} className="px-6 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">
                    <span className="font-medium">{row.who}</span>
                    <span className="text-muted"> · </span>
                    <span className="text-muted">{row.what}</span>
                  </p>
                </div>
                <div className="flex items-center gap-6 text-xs whitespace-nowrap">
                  <span className="text-ink font-mono tabular-nums">{row.score}</span>
                  <span className="text-muted w-20 text-right">{row.when}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded border border-rule bg-white">
          <header className="px-6 py-4 border-b border-rule">
            <h2 className="text-sm font-medium text-ink">Distribución por nivel</h2>
          </header>
          <div className="px-6 py-5 space-y-4">
            {[
              { level: "B1 Preliminary", count: 12, pct: 31 },
              { level: "B2 First", count: 18, pct: 47 },
              { level: "C1 Advanced", count: 8, pct: 22 },
            ].map((row) => (
              <div key={row.level}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-ink">{row.level}</span>
                  <span className="text-muted font-mono tabular-nums">{row.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-paper overflow-hidden">
                  <div
                    className="h-full bg-navy"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
