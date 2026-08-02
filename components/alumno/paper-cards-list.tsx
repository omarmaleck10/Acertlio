"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PaperCard } from "./paper-card";
import { PaperInstructionsModal } from "./paper-instructions-modal";
import { DebugErrorBoundary } from "@/components/debug-error-boundary";
import { startOrResumePaperAction } from "@/app/alumno/examenes/actions";
import type { PaperWithStatus } from "@/lib/papers/status";

interface Props {
  examId: string;
  papers: PaperWithStatus[];
}

export function PaperCardsList({ examId, papers }: Props) {
  const router = useRouter();
  const [modalPaper, setModalPaper] = useState<PaperWithStatus | null>(null);
  const [pending, startTransition] = useTransition();

  const handleClickStart = (paperCode: string) => {
    const paper = papers.find((p) => p.code === paperCode);
    if (paper) setModalPaper(paper);
  };

  const handleClickContinue = (paperCode: string) => {
    // Continuar va directo al simulador, sin instrucciones (decisión k = A)
    startTransition(async () => {
      const res = await startOrResumePaperAction(examId, paperCode);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.redirectTo) {
        router.push(res.redirectTo);
      }
    });
  };

  const handleClickViewResult = (paperCode: string) => {
    router.push(`/alumno/examenes/${examId}/${paperCode}/resultado`);
  };

  const handleStart = async (paperCode: string) => {
    const res = await startOrResumePaperAction(examId, paperCode);
    if (res.error) {
      throw new Error(res.error);
    }
    if (res.redirectTo) {
      router.push(res.redirectTo);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {papers.map((paper) => (
          <PaperCard
            key={paper.id}
            paper={paper}
            onClickStart={handleClickStart}
            onClickContinue={handleClickContinue}
            onClickViewResult={handleClickViewResult}
          />
        ))}
      </div>

      <DebugErrorBoundary label="modal instrucciones">
        <PaperInstructionsModal
          paper={modalPaper}
          onClose={() => setModalPaper(null)}
          onStart={handleStart}
        />
      </DebugErrorBoundary>

      {pending && (
        <div className="fixed inset-0 z-40 bg-ink/40 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg px-6 py-3 shadow-lg text-sm text-ink">
            Cargando…
          </div>
        </div>
      )}
    </>
  );
}
