"use client";

import { Monitor } from "lucide-react";
import Link from "next/link";

interface Props {
  examId: string;
}

export function MobileWarning({ examId }: Props) {
  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-white flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-navy/5 flex items-center justify-center mb-6">
          <Monitor className="h-8 w-8 text-navy" />
        </div>
        <h1 className="text-2xl font-semibold text-ink mb-3">
          Solo desktop
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-6">
          El simulador de examen está diseñado para ordenador, igual que el
          examen oficial. Por favor, abre este enlace desde un ordenador para
          tener la experiencia completa.
        </p>
        <Link
          href={`/alumno/examenes/${examId}`}
          className="inline-flex items-center gap-2 rounded bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
        >
          Volver al mock
        </Link>
      </div>
    </div>
  );
}
