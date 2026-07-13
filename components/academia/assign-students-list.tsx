"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, Plus } from "lucide-react";
import {
  assignStudentAction,
  unassignStudentAction,
} from "@/app/academia/profesores/actions";

interface Student {
  id: string;
  full_name: string | null;
  email: string;
  current_level: string | null;
  assigned: boolean;
}

interface Props {
  teacherId: string;
  students: Student[];
}

export function AssignStudentsList({ teacherId, students }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (studentId: string, currentlyAssigned: boolean) => {
    setPendingId(studentId);
    setError(null);
    setFlash(null);
    startTransition(async () => {
      const result = currentlyAssigned
        ? await unassignStudentAction(studentId)
        : await assignStudentAction(teacherId, studentId);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setFlash(result.success);
      }
      setPendingId(null);
    });
  };

  if (students.length === 0) {
    return (
      <p className="text-sm text-muted px-1 py-3">
        Aún no hay alumnos en la academia. Da de alta alumnos primero para poder
        asignarlos a un profesor.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {flash && (
        <div className="text-xs text-ok px-3 py-2 rounded bg-ok/5 border border-ok/20">
          {flash}
        </div>
      )}
      {error && (
        <div className="text-xs text-bad px-3 py-2 rounded bg-bad/5 border border-bad/20">
          {error}
        </div>
      )}
      <ul className="divide-y divide-rule">
        {students.map((s) => {
          const busy = isPending && pendingId === s.id;
          return (
            <li key={s.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink font-medium truncate">
                  {s.full_name ?? "Sin nombre"}
                </p>
                <p className="text-xs text-muted font-mono truncate">{s.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.current_level && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-navy-50 text-navy">
                    {s.current_level}
                  </span>
                )}
                <button
                  onClick={() => toggle(s.id, s.assigned)}
                  disabled={busy}
                  className={
                    s.assigned
                      ? "text-xs px-2.5 py-1 rounded bg-navy text-white flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
                      : "text-xs px-2.5 py-1 rounded border border-rule text-muted flex items-center gap-1 hover:border-navy hover:text-navy disabled:opacity-50"
                  }
                >
                  {busy ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : s.assigned ? (
                    <>
                      <Check className="h-3 w-3" />
                      Asignado
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      Asignar
                    </>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
