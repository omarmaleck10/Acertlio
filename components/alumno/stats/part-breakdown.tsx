import { LayoutGrid } from "lucide-react";
import type { PartBreakdownRow } from "@/lib/stats/student";

interface Props {
  parts: PartBreakdownRow[];
}

function pctColor(pct: number): string {
  if (pct >= 60) return "text-ok";
  if (pct >= 40) return "text-saffron";
  return "text-error";
}

function pctBgColor(pct: number): string {
  if (pct >= 60) return "bg-ok";
  if (pct >= 40) return "bg-saffron";
  return "bg-error";
}

export function PartBreakdown({ parts }: Props) {
  if (parts.length === 0) {
    return null; // No mostramos la sección si no hay data
  }

  // Agrupar por paper_code para separar visualmente
  const byPaper = new Map<string, PartBreakdownRow[]>();
  parts.forEach((p) => {
    const arr = byPaper.get(p.paper_code) ?? [];
    arr.push(p);
    byPaper.set(p.paper_code, arr);
  });

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium text-ink mb-4 uppercase tracking-wider flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-saffron" />
        Aciertos por Part
      </h2>

      <div className="rounded-lg border border-rule bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-rule">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                Part
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium hidden md:table-cell">
                Título
              </th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                Aciertos
              </th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                %
              </th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium hidden sm:table-cell w-32">
                Barra
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from(byPaper.entries()).map(([paperCode, rows], groupIdx) => (
              <>
                {groupIdx > 0 && (
                  <tr key={paperCode + "-sep"}>
                    <td colSpan={5} className="border-t border-rule" />
                  </tr>
                )}
                {rows.map((row) => (
                  <tr
                    key={row.part_id}
                    className="border-b border-rule last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm text-ink font-medium">
                        Part {row.part_number}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {row.paper_code}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-muted truncate max-w-xs">
                        {row.part_title ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-ink tabular-nums">
                      {row.correct_count}
                      <span className="text-muted"> / {row.total_count}</span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums ${pctColor(
                        row.accuracy_pct
                      )}`}
                    >
                      {row.accuracy_pct}%
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="w-full h-2 rounded-full bg-paper overflow-hidden">
                        <div
                          className={`h-full ${pctBgColor(row.accuracy_pct)} rounded-full transition-all`}
                          style={{ width: `${row.accuracy_pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted mt-3">
        Aciertos acumulados en todos los mocks completados. Verde ≥ 60%,
        naranja 40-59%, rojo &lt; 40%.
      </p>
    </section>
  );
}
