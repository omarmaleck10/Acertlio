import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";

const upcoming = [
  { exam: "B2 First — Mock 04", parts: "Reading & UoE · Listening · Writing", duration: "3 h 30 min", assigned: "Asignado por Helen" },
  { exam: "B2 First — Mock 05", parts: "Completo", duration: "3 h 30 min", assigned: "Asignado por Helen" },
];

const history = [
  { exam: "B2 First — Mock 03", date: "27 jun", score: "168 / 190", grade: "B (Pass)", time: "3h 12min" },
  { exam: "B2 First — Mock 02", date: "20 jun", score: "162 / 190", grade: "B (Pass)", time: "3h 24min" },
  { exam: "B2 First — Mock 01", date: "13 jun", score: "155 / 190", grade: "C (Pass)", time: "3h 28min" },
];

export default function AlumnoDashboard() {
  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Tu progreso</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Buen trabajo, Lucía
        </h1>
        <p className="text-sm text-muted mt-1">
          Llevas 3 mocks completados. Tu media de B2 First está en{" "}
          <span className="text-ink font-medium">163 / 190</span>.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard label="Mocks completados" value="3" />
        <StatCard label="Última nota" value="168" hint="B2 First Pass" />
        <StatCard label="Mejor parte" value="Reading" hint="88 %" />
        <StatCard label="Parte a reforzar" value="Use of English" hint="62 %" />
      </div>

      <section className="rounded border border-rule bg-white mb-3">
        <header className="px-6 py-4 border-b border-rule">
          <h2 className="text-sm font-medium text-ink">Próximos simulacros</h2>
        </header>
        <ul className="divide-y divide-rule">
          {upcoming.map((s, i) => (
            <li key={i} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{s.exam}</p>
                <p className="text-xs text-muted mt-0.5">{s.parts}</p>
                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {s.duration}
                  <span>·</span>
                  <span>{s.assigned}</span>
                </p>
              </div>
              <Link href="/alumno/examen">
                <Button>
                  <Play className="h-4 w-4" />
                  Empezar
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded border border-rule bg-white">
        <header className="px-6 py-4 border-b border-rule">
          <h2 className="text-sm font-medium text-ink">Historial</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr className="text-left">
                <th className="font-medium text-muted px-6 py-3">Examen</th>
                <th className="font-medium text-muted px-6 py-3">Fecha</th>
                <th className="font-medium text-muted px-6 py-3 text-right">Puntuación</th>
                <th className="font-medium text-muted px-6 py-3">Grade</th>
                <th className="font-medium text-muted px-6 py-3 text-right">Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {history.map((h) => (
                <tr key={h.exam}>
                  <td className="px-6 py-3 text-ink">{h.exam}</td>
                  <td className="px-6 py-3 text-muted">{h.date}</td>
                  <td className="px-6 py-3 text-right font-mono tabular-nums text-ink">{h.score}</td>
                  <td className="px-6 py-3 text-muted">{h.grade}</td>
                  <td className="px-6 py-3 text-right font-mono tabular-nums text-muted">{h.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
