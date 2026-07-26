"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, User, CalendarX, XCircle, MoreVertical } from "lucide-react";
import {
  formatDueDate,
  statusColorClass,
  type AssignmentSummary,
} from "@/lib/assignments/status";
import { cancelAssignmentAction } from "@/app/profesor/asignaciones/actions";

interface Props {
  assignment: AssignmentSummary;
}

export function AssignmentCard({ assignment }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const c = statusColorClass(assignment.status);
  const dueLabel = formatDueDate(assignment.due_date);
  const isOverdue = assignment.status === "overdue";
  const isCancelled = assignment.status === "cancelled";
  const isCompleted = assignment.status === "completed";

  const handleCancel = () => {
    if (!confirm("¿Cancelar esta asignación? El alumno dejará de verla.")) return;
    startTransition(async () => {
      const res = await cancelAssignmentAction({
        assignmentId: assignment.id,
      });
      if (res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div
      className={`rounded-lg border ${c.border} bg-white p-4 relative ${
        isCancelled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Alumno + estado */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
              <User className="h-3.5 w-3.5 text-muted" />
              {assignment.student_name}
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${c.bg} ${c.text}`}
            >
              {c.label}
            </span>
          </div>

          {/* Examen */}
          <p className="text-xs uppercase tracking-wider text-navy font-medium">
            {assignment.exam_level} · Mock {assignment.mock_number ?? "?"}
          </p>
          <p className="text-sm text-ink font-medium mt-0.5">
            {assignment.exam_title}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted flex-wrap">
            {dueLabel && (
              <span
                className={`inline-flex items-center gap-1 ${
                  isOverdue ? "text-error font-medium" : ""
                }`}
              >
                {isOverdue ? (
                  <CalendarX className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {dueLabel}
              </span>
            )}
            {assignment.progress_papers_total > 0 && !isCancelled && (
              <span>
                <strong className="text-ink">
                  {assignment.progress_papers_done}
                </strong>
                /{assignment.progress_papers_total} papers
              </span>
            )}
            {assignment.assigned_by_name && (
              <span>Por {assignment.assigned_by_name}</span>
            )}
          </div>
        </div>

        {/* Menú acciones */}
        {!isCompleted && !isCancelled && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center h-8 w-8 rounded hover:bg-paper transition-colors text-muted hover:text-ink"
              aria-label="Opciones"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 z-20 bg-white border border-rule rounded shadow-lg min-w-[160px] py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleCancel();
                    }}
                    disabled={pending}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar asignación
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
