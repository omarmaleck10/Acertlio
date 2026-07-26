"use client";

import { Lock, CheckCircle2, Play, Clock, Headphones, BookOpen, PenLine } from "lucide-react";
import type { PaperWithStatus } from "@/lib/papers/status";

interface Props {
  paper: PaperWithStatus;
  onClickStart: (paperCode: string) => void;
  onClickContinue: (paperCode: string) => void;
  onClickViewResult: (paperCode: string) => void;
}

function iconForPaper(code: string) {
  if (code === "listening") return Headphones;
  if (code === "writing") return PenLine;
  return BookOpen; // reading, reading_writing, reading_use_english
}

export function PaperCard({
  paper,
  onClickStart,
  onClickContinue,
  onClickViewResult,
}: Props) {
  const Icon = iconForPaper(paper.code);

  // ───── Estado: no disponible ─────
  if (paper.status === "unavailable") {
    return (
      <div className="relative bg-white rounded-lg border border-rule p-6 opacity-60">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-paper flex items-center justify-center">
            <Icon className="h-6 w-6 text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-ink">{paper.title}</h3>
              <span className="text-xs uppercase tracking-wider text-saffron font-medium">
                {paper.unavailable_reason ?? "No disponible"}
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              {paper.duration_minutes} minutes · {paper.short_description ?? ""}
            </p>
            <p className="text-xs text-muted mt-3 italic">
              Estamos preparando este paper. Estará disponible próximamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ───── Estado: bloqueado ─────
  if (paper.status === "locked") {
    return (
      <div className="relative bg-white rounded-lg border border-rule p-6 opacity-70">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-paper flex items-center justify-center">
            <Lock className="h-6 w-6 text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-ink">{paper.title}</h3>
              <span className="text-xs uppercase tracking-wider text-muted font-medium">
                Bloqueado
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              {paper.duration_minutes} minutes · {paper.short_description ?? ""}
            </p>
            <p className="text-xs text-muted mt-3 italic">
              Termina el paper anterior para desbloquear este.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ───── Estado: completado ─────
  if (paper.status === "completed") {
    const pct = paper.score_percentage;
    return (
      <div className="relative bg-white rounded-lg border-2 border-ok/40 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-ok/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-ok" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-ink">{paper.title}</h3>
              <span className="text-xs uppercase tracking-wider text-ok font-medium">
                Completado
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              {pct != null ? (
                <>
                  <span className="font-medium text-ink">{pct}%</span>
                  {paper.attempt?.raw_score != null && paper.attempt.max_score != null && (
                    <span className="text-muted">
                      {" "}· {paper.attempt.raw_score}/{paper.attempt.max_score}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted italic">Pendiente de corrección</span>
              )}
              {paper.attempt?.auto_closed && (
                <span className="text-muted italic"> · Cerrado por tiempo</span>
              )}
            </p>
            <button
              onClick={() => onClickViewResult(paper.code)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-ink transition-colors"
            >
              Ver mi resultado
              <span className="text-lg leading-none">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───── Estado: en progreso (pausado) ─────
  if (paper.status === "in_progress") {
    return (
      <div className="relative bg-white rounded-lg border-2 border-saffron/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-saffron/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-saffron" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-ink">{paper.title}</h3>
              <span className="text-xs uppercase tracking-wider text-saffron font-medium">
                En progreso
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              {paper.answered_questions > 0 && (
                <>
                  <span className="font-medium text-ink">
                    {paper.answered_questions}
                  </span>
                  <span className="text-muted">
                    /{paper.total_questions} preguntas respondidas
                  </span>
                </>
              )}
              {paper.time_remaining_display && (
                <>
                  {paper.answered_questions > 0 && <span> · </span>}
                  <span>Restante: </span>
                  <span className="font-medium text-ink">
                    {paper.time_remaining_display}
                  </span>
                </>
              )}
            </p>
            <button
              onClick={() => onClickContinue(paper.code)}
              className="mt-4 inline-flex items-center gap-2 rounded bg-saffron px-4 py-2 text-sm font-medium text-white hover:bg-saffron/90 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───── Estado: disponible ─────
  return (
    <div className="relative bg-white rounded-lg border border-rule hover:border-navy p-6 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-navy/5 flex items-center justify-center">
          <Icon className="h-6 w-6 text-navy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-ink">{paper.title}</h3>
            <span className="text-xs uppercase tracking-wider text-muted font-medium">
              {paper.duration_minutes} min
            </span>
          </div>
          {paper.short_description && (
            <p className="text-sm text-muted mt-1">{paper.short_description}</p>
          )}
          <button
            onClick={() => onClickStart(paper.code)}
            className="mt-4 inline-flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
          >
            Start
            <span className="text-lg leading-none">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
