"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Send, Loader2, Users2, CheckCircle2 } from "lucide-react";
import { StudentMultiSelect, type StudentOption } from "./student-multi-select";
import {
  GroupPickerModal,
  type GroupPickerOption,
} from "./group-picker-modal";
import { createAssignmentsAction } from "@/app/profesor/asignaciones/actions";

export interface ExamOption {
  id: string;
  title: string;
  level: string;
  mock_number: number | null;
}

interface Props {
  exams: ExamOption[];
  students: StudentOption[];
  groups?: GroupPickerOption[];
  prefillGroupId?: string; // si viene de "asignar mock al grupo"
}

export function AssignmentForm({
  exams,
  students,
  groups = [],
  prefillGroupId,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [examId, setExamId] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [lastPickedGroup, setLastPickedGroup] = useState<string | null>(null);

  // Precargar alumnos de un grupo si viene por query param
  useEffect(() => {
    if (!prefillGroupId || groups.length === 0) return;
    const g = groups.find((x) => x.id === prefillGroupId);
    if (g && g.student_ids.length > 0) {
      setSelectedStudents(g.student_ids);
      setLastPickedGroup(g.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillGroupId]);

  const selectedExam = exams.find((e) => e.id === examId);

  // Filtrar alumnos por nivel del examen seleccionado (soft-filter, no obliga)
  const relevantLevel = selectedExam?.level ?? undefined;

  const handleSubmit = () => {
    setError(null);

    if (!examId) {
      setError("Selecciona un simulacro.");
      return;
    }
    if (selectedStudents.length === 0) {
      setError("Selecciona al menos un alumno.");
      return;
    }
    if (hasDueDate) {
      if (!dueDate) {
        setError("Introduce una fecha límite o desactívala.");
        return;
      }
      const d = new Date(dueDate);
      if (d.getTime() <= Date.now()) {
        setError("La fecha límite debe ser futura.");
        return;
      }
    }

    startTransition(async () => {
      const res = await createAssignmentsAction({
        examId,
        studentIds: selectedStudents,
        dueDate: hasDueDate ? new Date(dueDate).toISOString() : null,
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      router.push(
        `/profesor/asignaciones?created=${res.created ?? 0}`
      );
      router.refresh();
    });
  };

  // Sugerir un default de deadline (mañana a las 20:00)
  const suggestedDefault = (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(20, 0, 0, 0);
    return t.toISOString().slice(0, 16); // formato datetime-local
  })();

  return (
    <div className="space-y-8 max-w-2xl">
      {/* 1. Selector examen */}
      <section>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          1. Simulacro
        </label>
        {exams.length === 0 ? (
          <div className="rounded border border-saffron/30 bg-saffron/5 p-4">
            <p className="text-sm text-ink">
              No hay simulacros publicados todavía.
            </p>
          </div>
        ) : (
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="w-full rounded border border-rule bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors"
          >
            <option value="">— Elige un simulacro —</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.level} · Mock {e.mock_number ?? "?"} — {e.title}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* 2. Selector alumnos */}
      <section>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <label className="text-xs uppercase tracking-wider text-navy font-medium">
            2. Alumnos
          </label>
          {groups.length > 0 && (
            <button
              type="button"
              onClick={() => setGroupModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-navy hover:text-ink font-medium transition-colors"
            >
              <Users2 className="h-3.5 w-3.5" />
              Elegir de grupo
            </button>
          )}
        </div>

        {lastPickedGroup && (
          <div className="mb-3 rounded border border-ok/30 bg-ok/5 p-2.5 flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-ok flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ink leading-relaxed">
              Cargados los alumnos del grupo{" "}
              <strong>&ldquo;{lastPickedGroup}&rdquo;</strong>. Puedes quitar
              alumnos concretos si es necesario.
            </p>
          </div>
        )}

        <StudentMultiSelect
          students={students}
          selectedIds={selectedStudents}
          onChange={setSelectedStudents}
          requiredLevel={relevantLevel}
        />
      </section>

      {/* 3. Deadline */}
      <section>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          3. Fecha límite
        </label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDueDate}
              onChange={(e) => {
                setHasDueDate(e.target.checked);
                if (e.target.checked && !dueDate) {
                  setDueDate(suggestedDefault);
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-rule text-navy focus:ring-navy"
            />
            <div>
              <p className="text-sm text-ink font-medium">
                Poner fecha límite
              </p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                Útil si quieres que lo hagan en clase o antes de una fecha.
                Sin fecha, el alumno lo hace cuando quiera.
              </p>
            </div>
          </label>

          {hasDueDate && (
            <div className="pl-7">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded border border-rule bg-white text-sm text-ink px-3 py-2 focus:outline-none focus:border-navy transition-colors"
              />
              <p className="text-xs text-muted mt-1.5">
                Tras esta fecha, el alumno podrá terminarlo pero aparecerá
                marcado como &ldquo;vencido&rdquo;.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Errores */}
      {error && (
        <div className="rounded border border-error/40 bg-error/10 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-rule">
        <p className="text-xs text-muted">
          {selectedStudents.length > 0 && examId ? (
            <>
              Se creará <strong className="text-ink">{selectedStudents.length}</strong>{" "}
              {selectedStudents.length === 1 ? "asignación" : "asignaciones"}
              {" "}y se enviarán {selectedStudents.length === 1 ? "un email" : "emails"}.
            </>
          ) : (
            "Elige un simulacro y al menos un alumno."
          )}
        </p>
        <button
          onClick={handleSubmit}
          disabled={pending || !examId || selectedStudents.length === 0}
          className="inline-flex items-center gap-2 rounded bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Asignar
            </>
          )}
        </button>
      </div>

      {/* Modal elegir grupo */}
      <GroupPickerModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        groups={groups}
        onPickGroup={(studentIds, groupName) => {
          // Fusionamos con lo ya seleccionado (sin duplicar)
          setSelectedStudents((prev) => {
            const merged = new Set(prev);
            studentIds.forEach((id) => merged.add(id));
            return Array.from(merged);
          });
          setLastPickedGroup(groupName);
        }}
      />
    </div>
  );
}
