"use client";

import { Wifi, WifiOff, StickyNote, HelpCircle } from "lucide-react";
import { ExamTimer } from "./exam-timer";

interface Props {
  studentName: string;
  examTitle: string;
  paperTitle: string;
  timeRemainingSeconds: number;
  isOnline: boolean;
  timerHidden: boolean;
  onToggleTimer: () => void;
  onOpenNotes: () => void;
  onOpenHelp: () => void;
  onTick: (secondsLeft: number) => void;
  onExpire: () => void;
}

export function ExamHeader({
  studentName,
  examTitle,
  paperTitle,
  timeRemainingSeconds,
  isOnline,
  timerHidden,
  onToggleTimer,
  onOpenNotes,
  onOpenHelp,
  onTick,
  onExpire,
}: Props) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white border-b border-rule shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5 gap-4">
        {/* Izquierda: logo + nombre alumno + examen */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-semibold text-lg text-ink tracking-tight">
              Acertl<span className="text-saffron">i</span>o
            </span>
          </div>

          <div className="hidden md:block h-6 w-px bg-rule" />

          <div className="min-w-0 hidden md:block">
            <p className="text-[10px] uppercase tracking-wider text-muted font-medium leading-none">
              Candidate
            </p>
            <p className="text-sm text-ink font-medium truncate mt-0.5">
              {studentName}
            </p>
          </div>

          <div className="hidden lg:block h-6 w-px bg-rule" />

          <div className="min-w-0 hidden lg:block">
            <p className="text-[10px] uppercase tracking-wider text-muted font-medium leading-none">
              {examTitle}
            </p>
            <p className="text-sm text-ink font-medium truncate mt-0.5">
              {paperTitle}
            </p>
          </div>
        </div>

        {/* Derecha: timer + iconos */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <ExamTimer
            timeRemainingSeconds={timeRemainingSeconds}
            hidden={timerHidden}
            onToggle={onToggleTimer}
            onTick={onTick}
            onExpire={onExpire}
          />

          <div className="hidden md:block h-6 w-px bg-rule" />

          {/* Wifi indicator */}
          <div
            className={`flex items-center justify-center h-8 w-8 rounded ${
              isOnline ? "text-ok" : "text-error"
            }`}
            title={isOnline ? "Conectado" : "Sin conexión"}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
          </div>

          <button
            onClick={onOpenNotes}
            className="flex items-center justify-center h-8 w-8 rounded hover:bg-paper transition-colors text-muted hover:text-ink"
            title="Notas"
          >
            <StickyNote className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenHelp}
            className="flex items-center justify-center h-8 w-8 rounded hover:bg-paper transition-colors text-muted hover:text-ink"
            title="Ayuda"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
