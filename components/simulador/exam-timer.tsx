"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Clock } from "lucide-react";

interface Props {
  timeRemainingSeconds: number;
  hidden: boolean;
  onToggle: () => void;
  onTick: (secondsLeft: number) => void; // se llama cada segundo
  onExpire: () => void; // se llama cuando llega a 0
}

const WARN_SECONDS = 5 * 60; // aviso a los 5 minutos

function fmt(sec: number): string {
  if (sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function ExamTimer({
  timeRemainingSeconds,
  hidden,
  onToggle,
  onTick,
  onExpire,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(timeRemainingSeconds);
  const expiredRef = useRef(false);

  // Reset cuando cambia el tiempo inicial (nunca debería en producción pero…)
  useEffect(() => {
    setSecondsLeft(timeRemainingSeconds);
    expiredRef.current = false;
  }, [timeRemainingSeconds]);

  // Cuenta atrás
  useEffect(() => {
    const iv = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true;
          onExpire();
          return 0;
        }
        onTick(next);
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isWarning = secondsLeft <= WARN_SECONDS && secondsLeft > 0;

  return (
    <div className="flex items-center gap-1.5">
      {hidden ? (
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-sm text-muted hover:text-ink hover:bg-paper transition-colors"
          title="Mostrar tiempo"
        >
          <EyeOff className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Tiempo oculto</span>
        </button>
      ) : (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono font-semibold text-base tabular-nums transition-colors ${
            isWarning
              ? "bg-saffron/15 text-saffron"
              : "bg-navy/5 text-navy"
          }`}
        >
          <Clock className="h-4 w-4" />
          {fmt(secondsLeft)}
        </div>
      )}
      <button
        onClick={onToggle}
        className="hidden sm:flex items-center justify-center h-8 w-8 rounded hover:bg-paper transition-colors text-muted hover:text-ink"
        title={hidden ? "Mostrar tiempo" : "Ocultar tiempo"}
      >
        {hidden ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
