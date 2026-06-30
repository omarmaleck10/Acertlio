import { StatCard } from "@/components/dashboard/stat-card";

const academies = [
  { name: "English Studio Madrid", plan: "Pro", seats: "38 / 50", mrr: "79 €" },
  { name: "Cambridge House Sevilla", plan: "Business", seats: "84 / 100", mrr: "139 €" },
  { name: "Speak Up Valencia", plan: "Starter", seats: "12 / 20", mrr: "39 €" },
  { name: "British Bilbao", plan: "Pro", seats: "47 / 50", mrr: "79 €" },
  { name: "FluentLab Barcelona", plan: "Business", seats: "62 / 100", mrr: "139 €" },
  { name: "Anglo Málaga", plan: "Pro", seats: "31 / 50", mrr: "79 €" },
];

export default function AdminDashboard() {
  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Plataforma · Vista global</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">Acertlio</h1>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard label="Academias activas" value="6" trend={{ value: "+1 este mes", positive: true }} />
        <StatCard label="Alumnos totales" value="274" trend={{ value: "+38", positive: true }} />
        <StatCard label="MRR" value="554 €" hint="Ingreso mensual recurrente" />
        <StatCard label="Mocks realizados (30 d)" value="412" trend={{ value: "+18 %", positive: true }} />
      </div>

      <section className="rounded border border-rule bg-white">
        <header className="px-6 py-4 border-b border-rule flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Academias</h2>
          <button className="text-xs text-muted hover:text-ink">Ver todas</button>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr className="text-left">
                <th className="font-medium text-muted px-6 py-3">Academia</th>
                <th className="font-medium text-muted px-6 py-3">Plan</th>
                <th className="font-medium text-muted px-6 py-3 text-right">Licencias</th>
                <th className="font-medium text-muted px-6 py-3 text-right">MRR</th>
                <th className="font-medium text-muted px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {academies.map((a) => (
                <tr key={a.name}>
                  <td className="px-6 py-3 text-ink">{a.name}</td>
                  <td className="px-6 py-3 text-muted">{a.plan}</td>
                  <td className="px-6 py-3 text-right font-mono tabular-nums text-ink">{a.seats}</td>
                  <td className="px-6 py-3 text-right font-mono tabular-nums text-ink">{a.mrr}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ok">
                      <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                      Activa
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
