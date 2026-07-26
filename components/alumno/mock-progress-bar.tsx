import { CheckCircle2 } from "lucide-react";

interface Props {
  total: number;
  completed: number;
}

export function MockProgressBar({ total, completed }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isDone = completed === total && total > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wider text-muted font-medium">
          Progreso del mock
        </p>
        <p className="text-sm text-ink">
          <span className={isDone ? "font-semibold text-ok" : "font-semibold"}>
            {completed}
          </span>
          <span className="text-muted"> de {total} papers completados</span>
          {isDone && (
            <span className="ml-2 inline-flex items-center gap-1 text-ok">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          )}
        </p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-paper overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isDone ? "bg-ok" : "bg-saffron"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
