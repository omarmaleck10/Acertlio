"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Save } from "lucide-react";
import {
  StudentMultiSelect,
  type StudentOption,
} from "@/components/profesor/student-multi-select";
import {
  createGroupAction,
  updateGroupAction,
} from "@/app/academia/grupos/actions";

export interface TeacherOption {
  id: string;
  full_name: string;
  email: string;
}

interface Props {
  mode: "create" | "edit";
  groupId?: string;
  teachers: TeacherOption[];
  students: StudentOption[]; // solo se muestran en modo create
  initialData?: {
    name: string;
    level: string | null;
    teacherId: string;
    description: string | null;
  };
}

const LEVELS = ["A2", "B1", "B2", "C1", "C2"];

export function GroupForm({
  mode,
  groupId,
  teachers,
  students,
  initialData,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(initialData?.name ?? "");
  const [level, setLevel] = useState<string>(initialData?.level ?? "");
  const [teacherId, setTeacherId] = useState<string>(
    initialData?.teacherId ?? ""
  );
  const [description, setDescription] = useState<string>(
    initialData?.description ?? ""
  );
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);

    if (name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!teacherId) {
      setError("Selecciona un profesor titular.");
      return;
    }

    startTransition(async () => {
      if (mode === "create") {
        const res = await createGroupAction({
          name,
          level: level || null,
          teacherId,
          description: description || null,
          memberIds: selectedStudents,
        });

        if (res.error) {
          setError(res.error);
          return;
        }
        router.push(`/academia/grupos/${res.groupId}`);
        router.refresh();
      } else {
        if (!groupId) return;
        const res = await updateGroupAction({
          groupId,
          name,
          level: level || null,
          teacherId,
          description: description || null,
        });
        if (res.error) {
          setError(res.error);
          return;
        }
        router.push(`/academia/grupos/${groupId}`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Nombre */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          1. Nombre del grupo
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: B1 martes 18h"
          maxLength={80}
          className="w-full rounded border border-rule bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors"
        />
        <p className="text-xs text-muted mt-1">
          Un nombre corto que reconocerán tus profesores y alumnos.
        </p>
      </div>

      {/* Nivel */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          2. Nivel Cambridge (opcional)
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setLevel("")}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              level === ""
                ? "bg-navy text-white"
                : "bg-paper text-muted hover:text-ink"
            }`}
          >
            Sin nivel
          </button>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevel(lvl)}
              className={`text-xs px-3 py-1.5 rounded transition-colors ${
                level === lvl
                  ? "bg-navy text-white"
                  : "bg-paper text-muted hover:text-ink"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Profesor titular */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          3. Profesor titular
        </label>
        {teachers.length === 0 ? (
          <div className="rounded border border-saffron/30 bg-saffron/5 p-3">
            <p className="text-sm text-ink">
              Aún no hay profesores en la academia. Créalos primero desde{" "}
              <a
                href="/academia/profesores"
                className="text-navy underline hover:text-ink"
              >
                Profesores
              </a>
              .
            </p>
          </div>
        ) : (
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full rounded border border-rule bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors"
          >
            <option value="">— Elige un profesor —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name} · {t.email}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          4. Descripción (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Preparación B1 con exam en junio 2026"
          rows={2}
          className="w-full rounded border border-rule bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors resize-none"
        />
      </div>

      {/* Miembros (solo en create) */}
      {mode === "create" && (
        <div>
          <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
            5. Alumnos del grupo (opcional)
          </label>
          <p className="text-xs text-muted mb-3">
            Puedes añadir alumnos ahora o dejarlo vacío y hacerlo después.
          </p>
          <StudentMultiSelect
            students={students}
            selectedIds={selectedStudents}
            onChange={setSelectedStudents}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded border border-error/40 bg-error/10 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end pt-4 border-t border-rule gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={pending || teachers.length === 0}
          className="inline-flex items-center gap-2 rounded bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {mode === "create" ? "Crear grupo" : "Guardar cambios"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
