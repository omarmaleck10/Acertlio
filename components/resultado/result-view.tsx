"use client";

import { useState, useRef } from "react";
import { ResultPartTabs } from "./result-part-tabs";
import { ResultQuestionReview } from "./result-question-review";
import { ResultSidebar } from "./result-sidebar";
import type { ResultData } from "@/lib/exam/result-loader";

interface Props {
  data: ResultData;
}

export function ResultView({ data }: Props) {
  const [activePartIndex, setActivePartIndex] = useState(0);
  const partRefs = useRef<Array<HTMLDivElement | null>>([]);

  const activePart = data.parts[activePartIndex];

  const handleChangePart = (idx: number) => {
    setActivePartIndex(idx);
    // Scroll suave al inicio de la sección
    const el = partRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      {/* Columna principal */}
      <div>
        <ResultPartTabs
          parts={data.parts}
          activePartIndex={activePartIndex}
          onChange={handleChangePart}
        />

        {activePart && (
          <section
            ref={(el: HTMLElement | null) => {
              partRefs.current[activePartIndex] = el as HTMLDivElement | null;
            }}
            className="space-y-4"
          >
            <div className="mb-2">
              <p className="text-xs uppercase tracking-wider text-navy font-medium">
                Part {activePart.part_number}
              </p>
              {activePart.title && (
                <h2 className="text-lg font-semibold text-ink mt-0.5">
                  {activePart.title}
                </h2>
              )}
            </div>

            {activePart.questions.length === 0 ? (
              <p className="text-sm text-muted italic">
                No hay preguntas en esta parte.
              </p>
            ) : (
              activePart.questions.map((q) => (
                <ResultQuestionReview
                  key={q.id}
                  question={q}
                  partSettings={activePart.settings}
                />
              ))
            )}
          </section>
        )}
      </div>

      {/* Sidebar derecha */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <ResultSidebar data={data} onJumpToPart={handleChangePart} />
      </div>
    </div>
  );
}
