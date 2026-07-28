"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Loader2, AlertCircle } from "lucide-react";
import {
  StudentMultiSelect,
  type StudentOption,
} from "@/components/profesor/student-multi-select";
import {
  addStudentsToGroupAction,
  removeStudentFromGroupAction,
} from "@/app/academia/grupos/actions";

interface Member {
  student_id: string;
  full_name: string;
  email: string;
  level: string | null;
  joined_at: string;
}

interface Props {
  groupId: string;
  members: Member[];
  candidates: StudentOption[]; // alumnos de academia que aún NO son miembros
}

export function GroupMembersManager({ groupId, members, candidates }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (selected.length === 0) return;
    setError(null);
    startTransition(async () => {
      const res = await addStudentsToGroupAction({
        groupId,
        studentIds: selected,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSelected([]);
      setAddModalOpen(false);
      router.refresh();
    });
  };

  const handleRemove = (studentId: string, name: string) => {
    if (!confirm(`¿Quitar a ${name} del grupo?`)) return;
    startTransition(async () => {
      const res = await removeStudentFromGroupAction({
        groupId,
        studentId,
      });
      if (res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-ink uppercase tracking-wider">
          Miembros ({members.length})
        </h2>
        {candidates.length > 0 && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded bg-navy text-white text-xs font-medium px-3 py-1.5 hover:bg-navy/90 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Añadir alumnos
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-rule bg-white p-8 text-center">
          <p className="text-sm text-muted mb-3">
            Este grupo aún no tiene alumnos.
          </p>
          {candidates.length > 0 ? (
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded bg-navy text-white text-xs font-medium px-3 py-1.5 hover:bg-navy/90 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Añadir alumnos ahora
            </button>
          ) : (
            <p className="text-xs text-muted">
              Todos los alumnos de la academia ya están en este grupo.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-rule bg-white overflow-hidden">
          <div className="divide-y divide-rule">
            {members.map((m) => (
              <div
                key={m.student_id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {m.full_name}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {m.email}
                    {m.level && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-navy font-semibold px-1.5 py-0.5 rounded bg-navy/5">
                        {m.level}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(m.student_id, m.full_name)}
                  disabled={pending}
                  className="text-xs text-muted hover:text-error transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                  aria-label={`Quitar a ${m.full_name}`}
                >
                  <X className="h-3.5 w-3.5" />
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal añadir */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
              <h2 className="text-lg font-semibold text-ink">Añadir alumnos</h2>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-muted hover:text-ink transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1">
              <StudentMultiSelect
                students={candidates}
                selectedIds={selected}
                onChange={setSelected}
              />

              {error && (
                <div className="mt-3 rounded border border-error/40 bg-error/10 p-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-rule flex items-center justify-end gap-3 bg-paper">
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-sm text-muted hover:text-ink transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={pending || selected.length === 0}
                className="inline-flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Añadiendo…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Añadir {selected.length > 0 ? `(${selected.length})` : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
