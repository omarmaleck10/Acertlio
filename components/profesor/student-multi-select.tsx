"use client";

import { useState, useMemo } from "react";
import { Search, Check, Users, X } from "lucide-react";

export interface StudentOption {
  id: string;
  full_name: string;
  email: string;
  level: string | null;
}

interface Props {
  students: StudentOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  requiredLevel?: string; // si se pasa, filtra alumnos de otros niveles al seleccionar todos
}

/**
 * Selector múltiple de alumnos con:
 * - Buscador por nombre / email (top)
 * - Filtro rápido por nivel (chips)
 * - Lista con checkboxes
 * - Botón "Seleccionar todos los filtrados"
 * - Chips de seleccionados arriba
 */
export function StudentMultiSelect({
  students,
  selectedIds,
  onChange,
  requiredLevel,
}: Props) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>(
    requiredLevel ?? null
  );

  // Niveles únicos disponibles
  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.level) set.add(s.level);
    });
    return Array.from(set).sort();
  }, [students]);

  // Alumnos filtrados por búsqueda + nivel
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
  }, [students, search, levelFilter]);

  const selectedSet = new Set(selectedIds);

  const toggle = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedSet);
    filtered.forEach((s) => next.add(s.id));
    onChange(Array.from(next));
  };

  const clearAll = () => onChange([]);

  const selectedStudents = students.filter((s) => selectedSet.has(s.id));

  return (
    <div className="space-y-4">
      {/* Chips de seleccionados */}
      {selectedStudents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-navy font-medium">
              Seleccionados ({selectedStudents.length})
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted hover:text-error transition-colors"
            >
              Quitar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedStudents.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy text-white px-3 py-1 text-xs font-medium hover:bg-navy/90 transition-colors group"
              >
                {s.full_name}
                <X className="h-3 w-3 opacity-70 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buscador */}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted font-medium mb-2 block">
          Alumnos disponibles
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email…"
            className="w-full pl-9 pr-3 py-2 rounded border border-rule bg-white text-sm text-ink focus:outline-none focus:border-navy transition-colors"
          />
        </div>
      </div>

      {/* Filtros de nivel */}
      {availableLevels.length > 1 && !requiredLevel && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted">Nivel:</span>
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

      {/* Lista */}
      <div className="border border-rule rounded-lg overflow-hidden bg-white">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-8 w-8 text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted">
              {search
                ? "Ningún alumno coincide con la búsqueda."
                : "No hay alumnos disponibles."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-2 bg-paper border-b border-rule">
              <p className="text-xs text-muted">
                {filtered.length} alumnos{search ? " · filtrado" : ""}
              </p>
              <button
                type="button"
                onClick={selectAllFiltered}
                className="text-xs text-navy hover:text-ink font-medium transition-colors"
              >
                Seleccionar todos
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-rule">
              {filtered.map((s) => {
                const isSelected = selectedSet.has(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-navy/5"
                        : "bg-white hover:bg-paper"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(s.id)}
                      className="h-4 w-4 rounded border-rule text-navy focus:ring-navy cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink font-medium truncate">
                        {s.full_name}
                      </p>
                      <p className="text-xs text-muted truncate">{s.email}</p>
                    </div>
                    {s.level && (
                      <span className="text-[10px] uppercase tracking-wider text-navy font-semibold px-2 py-0.5 rounded bg-navy/5">
                        {s.level}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-4 w-4 text-navy flex-shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
