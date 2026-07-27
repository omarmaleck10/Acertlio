"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpenCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { TrialCapModal } from "./trial-cap-modal";
import { startOrResumePaperAction } from "@/app/alumno/examenes/actions";

export interface IndividualMockCardData {
  exam_id: string;
  title: string;
  level: string;
  mock_number: number | null;
  state: "not_started" | "in_progress" | "completed";
  progress_papers_done: number;
  progress_papers_total: number;
  first_paper_code: string | null;
}

interface Props {
  mocks: IndividualMockCardData[];
  canStartNew: boolean; // false si el alumno está trialing_capped
  daysLeftInTrial: number | null;
}

export function IndividualMocksList({
  mocks,
  canStartNew,
  daysLeftInTrial,
}: Props) {
  const router = useRouter();
  const [capModalOpen, setCapModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleClick = (m: IndividualMockCardData) => {
    // Si ya empezó → siempre puede continuar
    if (m.state !== "not_started") {
      router.push(`/alumno/examenes/${m.exam_id}`);
      return;
    }

    // Nuevo mock → verificar cap
    if (!canStartNew) {
      setCapModalOpen(true);
      return;
    }

    router.push(`/alumno/examenes/${m.exam_id}`);
  };

  if (mocks.length === 0) {
    return (
      <div className="rounded-lg border border-rule bg-white p-10 text-center">
        <BookOpenCheck className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium text-ink mb-1">
          Aún no hay simulacros publicados para tu nivel
        </p>
        <p className="text-sm text-muted max-w-md mx-auto">
          Estamos añadiendo contenido continuamente. Vuelve pronto o
          contáctanos si tienes prisa.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {mocks.map((m) => (
          <MockCard
            key={m.exam_id}
            mock={m}
            onClick={() => handleClick(m)}
            disabled={pending}
          />
        ))}
      </div>

      <TrialCapModal
        open={capModalOpen}
        onClose={() => setCapModalOpen(false)}
        daysLeftInTrial={daysLeftInTrial}
      />
    </>
  );
}


function MockCard({
  mock,
  onClick,
  disabled,
}: {
  mock: IndividualMockCardData;
  onClick: () => void;
  disabled: boolean;
}) {
  const isCompleted = mock.state === "completed";
  const isInProgress = mock.state === "in_progress";

  const stateLabel = isCompleted
    ? "Completado"
    : isInProgress
    ? "En progreso"
    : "Empezar";

  const stateColor = isCompleted
    ? "text-ok"
    : isInProgress
    ? "text-saffron"
    : "text-navy";

  const stateBg = isCompleted
    ? "border-ok/30"
    : isInProgress
    ? "border-saffron/50 hover:border-saffron"
    : "border-rule hover:border-navy";

  const Icon = isCompleted ? CheckCircle2 : isInProgress ? Clock : PlayCircle;

  const cta = isCompleted
    ? "Ver mi resultado"
    : isInProgress
    ? "Continuar"
    : "Empezar";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`block w-full text-left bg-white rounded-lg border-2 ${stateBg} p-4 transition-colors group disabled:opacity-60`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-xs uppercase tracking-wider text-navy font-medium">
              {mock.level} · Mock {mock.mock_number ?? "?"}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                isCompleted
                  ? "bg-ok/10 text-ok"
                  : isInProgress
                  ? "bg-saffron/10 text-saffron"
                  : "bg-navy/5 text-navy"
              }`}
            >
              {stateLabel}
            </span>
          </div>
          <p className="text-base font-medium text-ink">{mock.title}</p>

          {mock.progress_papers_total > 0 && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted">
              <span>
                <strong className="text-ink">
                  {mock.progress_papers_done}
                </strong>
                /{mock.progress_papers_total} papers
              </span>
            </div>
          )}
        </div>

        <div
          className={`inline-flex items-center gap-1 text-sm font-medium ${stateColor} group-hover:gap-2 transition-all flex-shrink-0 self-center`}
        >
          <Icon className="h-4 w-4" />
          {cta}
        </div>
      </div>
    </button>
  );
}
