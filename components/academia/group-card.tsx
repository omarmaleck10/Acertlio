"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, Archive, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { GroupSummary } from "@/lib/groups/loader";
import { archiveGroupAction, deleteGroupAction } from "@/app/academia/grupos/actions";

interface Props {
  group: GroupSummary;
}

export function GroupCard({ group }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleArchive = () => {
    if (!confirm(`¿Archivar el grupo "${group.name}"? Podrás verlo en el filtro de archivados.`)) return;
    startTransition(async () => {
      const res = await archiveGroupAction({ groupId: group.id });
      if (res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE el grupo "${group.name}"?\n\nLos alumnos no se borran, solo su pertenencia al grupo. Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const res = await deleteGroupAction({ groupId: group.id });
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <div className={`rounded-lg border bg-white p-5 relative ${group.is_archived ? "border-rule opacity-70" : "border-rule hover:border-navy/40 transition-colors"}`}>
      <Link
        href={`/academia/grupos/${group.id}`}
        className="block"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {group.level && (
              <span className="text-[10px] uppercase tracking-wider text-navy font-semibold px-2 py-0.5 rounded bg-navy/5">
                {group.level}
              </span>
            )}
            {group.is_archived && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted font-semibold px-2 py-0.5 rounded bg-paper">
                <Archive className="h-3 w-3" />
                Archivado
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-ink mb-1">{group.name}</h3>

        {group.description && (
          <p className="text-sm text-muted line-clamp-2 mb-3">
            {group.description}
          </p>
        )}

        <div className="space-y-1.5 mt-4 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3 w-3" />
            <span>Profesor: <strong className="text-ink font-medium">{group.teacher_name ?? "—"}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>
              <strong className="text-ink font-medium">{group.member_count}</strong>{" "}
              {group.member_count === 1 ? "alumno" : "alumnos"}
            </span>
          </div>
        </div>
      </Link>

      {/* Menú acciones */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center justify-center h-7 w-7 rounded hover:bg-paper text-muted hover:text-ink transition-colors"
          aria-label="Opciones del grupo"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-9 z-20 bg-white border border-rule rounded shadow-lg min-w-[180px] py-1">
              <Link
                href={`/academia/grupos/${group.id}`}
                className="block px-3 py-2 text-sm text-ink hover:bg-paper transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil className="h-3.5 w-3.5 inline mr-2" />
                Editar
              </Link>
              {!group.is_archived && (
                <button
                  onClick={() => { setMenuOpen(false); handleArchive(); }}
                  disabled={pending}
                  className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-paper transition-colors disabled:opacity-50"
                >
                  <Archive className="h-3.5 w-3.5 inline mr-2" />
                  Archivar
                </button>
              )}
              <button
                onClick={() => { setMenuOpen(false); handleDelete(); }}
                disabled={pending}
                className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5 inline mr-2" />
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
