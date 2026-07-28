"use client";

import { useState, useMemo } from "react";
import { X, Users2, Search, Users } from "lucide-react";

export interface GroupPickerOption {
  id: string;
  name: string;
  level: string | null;
  member_count: number;
  student_ids: string[]; // ya vienen los ids de alumnos del grupo
}

interface Props {
  open: boolean;
  onClose: () => void;
  groups: GroupPickerOption[];
  onPickGroup: (studentIds: string[], groupName: string) => void;
}

/**
 * Modal que muestra los grupos del profesor. Al elegir uno,
 * llama al callback con los IDs de sus alumnos.
 *
 * Se usa desde el formulario de nueva asignación para poblar la
 * selección múltiple de alumnos a partir de un grupo entero.
 * El profesor puede seguir quitando alumnos concretos después.
 */
export function GroupPickerModal({
  open,
  onClose,
  groups,
  onPickGroup,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.level ?? "").toLowerCase().includes(q)
    );
  }, [groups, search]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-navy" />
            <h2 className="text-lg font-semibold text-ink">Elegir de grupo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {groups.length === 0 ? (
            <div className="py-8 text-center">
              <Users2 className="h-8 w-8 text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted">
                No eres titular de ningún grupo todavía.
              </p>
              <p className="text-xs text-muted mt-1">
                Pide al admin que te asigne como titular de una clase.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                Elige un grupo y sus alumnos se añadirán a la selección
                actual. Podrás quitar alumnos concretos después si es
                necesario.
              </p>

              {/* Buscador */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar grupo…"
                  className="w-full pl-8 pr-3 py-1.5 rounded border border-rule bg-white text-sm text-ink focus:outline-none focus:border-navy transition-colors"
                />
              </div>

              {/* Lista */}
              {filtered.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted">
                    Ningún grupo coincide con la búsqueda.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        onPickGroup(g.student_ids, g.name);
                        onClose();
                      }}
                      disabled={g.member_count === 0}
                      className="w-full text-left rounded-lg border border-rule bg-white p-3 hover:border-navy/40 hover:bg-paper transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-medium text-ink">
                              {g.name}
                            </p>
                            {g.level && (
                              <span className="text-[10px] uppercase tracking-wider text-navy font-semibold px-1.5 py-0.5 rounded bg-navy/5">
                                {g.level}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted inline-flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {g.member_count}{" "}
                            {g.member_count === 1 ? "alumno" : "alumnos"}
                          </p>
                        </div>
                        {g.member_count > 0 ? (
                          <span className="text-xs text-navy font-medium group-hover:underline flex-shrink-0">
                            Elegir →
                          </span>
                        ) : (
                          <span className="text-xs text-muted flex-shrink-0">
                            Sin alumnos
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-rule flex items-center justify-end bg-paper">
          <button
            onClick={onClose}
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
