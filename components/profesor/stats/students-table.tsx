"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Users, ArrowRight, Search } from "lucide-react";
import type { StudentRow } from "@/lib/stats/teacher";
import { formatLastActivity } from "@/lib/stats/teacher";

interface Props {
  students: StudentRow[];
}

function scoreColor(pct: number | null): string {
  if (pct === null) return "text-muted";
  if (pct >= 60) return "text-ok";
  if (pct >= 40) return "text-saffron";
  return "text-error";
}

export function StudentsTable({ students }: Props) {
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.level) set.add(s.level);
    });
    return Array.from(set).sort();
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (levelFilter && s.level !== levelFilter) return false;
      if (!q) return true;
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [students, levelFilter, search]);

  if (students.length === 0) {
    return (
      <section className="mb-8">
        <SectionHeader />
        <div className="rounded-lg border border-rule bg-white p-10 text-center">
          <Users className="h-8 w-8 text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted">
            Aún no tienes alumnos vinculados a tu cuenta.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <SectionHeader />

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alumno…"
            className="w-full pl-8 pr-3 py-1.5 rounded border border-rule bg-white text-sm text-ink focus:outline-none focus:border-navy transition-colors"
          />
        </div>

        {/* Chips nivel */}
        {availableLevels.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted mr-1">Nivel:</span>
            <button
              type="button"
              onClick={() => setLevelFilter(null)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                levelFilter === null
                  ? "bg-navy text-white"
                  : "bg-paper text-muted hover:text-ink"
              }`}
            >
              Todos
            </button>
            {availableLevels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  levelFilter === lvl
                    ? "bg-navy text-white"
                    : "bg-paper text-muted hover:text-ink"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-muted ml-auto">
          {filtered.length} de {students.length}
        </p>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-rule bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted">
              Ningún alumno coincide con los filtros.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-rule">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                  Alumno
                </th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium hidden sm:table-cell">
                  Nivel
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                  Mocks
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                  Media
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium hidden md:table-cell">
                  Actividad
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.student_id}
                  className="border-b border-rule last:border-b-0 hover:bg-paper transition-colors group"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/profesor/alumnos/${s.student_id}`}
                      className="block"
                    >
                      <p className="text-sm text-ink font-medium truncate max-w-[200px] group-hover:underline">
                        {s.full_name}
                      </p>
                      <p className="text-xs text-muted truncate max-w-[200px]">
                        {s.email}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {s.level ? (
                      <span className="text-[10px] uppercase tracking-wider text-navy font-semibold px-2 py-0.5 rounded bg-navy/5">
                        {s.level}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-ink tabular-nums">
                    {s.mocks_completed}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold tabular-nums ${scoreColor(
                      s.average_score_pct
                    )}`}
                  >
                    {s.average_score_pct !== null
                      ? `${s.average_score_pct}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted hidden md:table-cell tabular-nums">
                    {formatLastActivity(s.last_activity_at)}
                  </td>
                  <td className="px-2 py-3">
                    <Link
                      href={`/profesor/alumnos/${s.student_id}`}
                      className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-ink/5 transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-ink" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}


function SectionHeader() {
  return (
    <h2 className="text-sm font-medium text-ink mb-4 uppercase tracking-wider flex items-center gap-2">
      <Users className="h-4 w-4 text-saffron" />
      Todos tus alumnos
    </h2>
  );
}
