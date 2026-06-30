import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const writingsPending = [
  { student: "Lucía Romero", exam: "B2 First — Writing Part 1", submitted: "hace 4 h" },
  { student: "Daniel Ortega", exam: "B1 Preliminary — Writing Part 2", submitted: "hace 6 h" },
  { student: "Iván Molina", exam: "B2 First — Writing Part 2", submitted: "ayer" },
  { student: "Mónica Reyes", exam: "C1 Advanced — Writing Part 1", submitted: "ayer" },
];

const students = [
  { name: "Lucía Romero", level: "B2 First", mocks: 4, lastScore: "168/190", pace: "On track" },
  { name: "Pablo Castaño", level: "C1 Advanced", mocks: 2, lastScore: "152/210", pace: "Riesgo" },
  { name: "María Pérez", level: "B2 First", mocks: 6, lastScore: "174/190", pace: "On track" },
  { name: "Daniel Ortega", level: "B1 Preliminary", mocks: 3, lastScore: "138/170", pace: "On track" },
  { name: "Iván Molina", level: "B2 First", mocks: 5, lastScore: "172/190", pace: "On track" },
];

export default function ProfesorDashboard() {
  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Resumen</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">Hola, Helen</h1>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard label="Alumnos asignados" value="18" />
        <StatCard label="Mocks corregidos" value="42" hint="Este mes" />
        <StatCard label="Writings pendientes" value="4" hint="Plazo medio: 24 h" />
        <StatCard label="Media de aprobados" value="78 %" trend={{ value: "+3 %", positive: true }} />
      </div>

      <section className="rounded border border-rule bg-white mb-3">
        <header className="px-6 py-4 border-b border-rule flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-saffron" />
            <h2 className="text-sm font-medium text-ink">Writings pendientes de corrección</h2>
          </div>
          <Button size="sm" variant="secondary">Corregir el siguiente</Button>
        </header>
        <ul className="divide-y divide-rule">
          {writingsPending.map((w, i) => (
            <li key={i} className="px-6 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm text-ink font-medium">{w.student}</p>
                <p className="text-xs text-muted mt-0.5">{w.exam}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-muted">{w.submitted}</span>
                <button className="text-xs text-navy hover:underline">Corregir →</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded border border-rule bg-white">
        <header className="px-6 py-4 border-b border-rule">
          <h2 className="text-sm font-medium text-ink">Tus alumnos</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr className="text-left">
                <th className="font-medium text-muted px-6 py-3">Alumno</th>
                <th className="font-medium text-muted px-6 py-3">Nivel</th>
                <th className="font-medium text-muted px-6 py-3 text-right">Mocks</th>
                <th className="font-medium text-muted px-6 py-3 text-right">Última nota</th>
                <th className="font-medium text-muted px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {students.map((s) => (
                <tr key={s.name}>
                  <td className="px-6 py-3 text-ink">{s.name}</td>
                  <td className="px-6 py-3 text-muted">{s.level}</td>
                  <td className="px-6 py-3 text-right font-mono tabular-nums text-ink">{s.mocks}</td>
                  <td className="px-6 py-3 text-right font-mono tabular-nums text-ink">{s.lastScore}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        s.pace === "On track" ? "text-ok" : "text-bad"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          s.pace === "On track" ? "bg-ok" : "bg-bad"
                        }`}
                      />
                      {s.pace}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
