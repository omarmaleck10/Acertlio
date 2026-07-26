import { CheckCircle2, Clock, AlertCircle, CalendarDays } from "lucide-react";
import type { ResultData } from "@/lib/exam/result-loader";

interface Props {
  data: ResultData;
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ResultHeader({ data }: Props) {
  const isWritingPaper =
    data.paper_code === "writing" || data.total_gradeable === 0;

  const pct = data.score_pct ?? 0;
  const scoreColor =
    pct >= 70 ? "text-ok" : pct >= 50 ? "text-saffron" : "text-error";

  const bgColor =
    pct >= 70
      ? "bg-ok/5 border-ok/20"
      : pct >= 50
      ? "bg-saffron/5 border-saffron/20"
      : "bg-error/5 border-error/20";

  return (
    <div className="mb-8">
      {/* Meta arriba */}
      <p className="text-xs uppercase tracking-wider text-navy font-medium">
        {data.exam_level} · Mock {data.mock_number ?? "—"} · Resultado del paper
      </p>
      <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
        {data.paper_title}
      </h1>
      <p className="text-sm text-muted mt-2">{data.exam_title}</p>

      {/* Card principal con la nota */}
      {!isWritingPaper ? (
        <div
          className={`mt-6 rounded-lg border-2 ${bgColor} p-6 md:p-8`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-2">
                Tu nota
              </p>
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl md:text-7xl font-bold tabular-nums ${scoreColor}`}>
                  {data.score_pct != null ? data.score_pct : "—"}
                </span>
                <span className={`text-3xl font-semibold ${scoreColor}`}>%</span>
              </div>
              <p className="text-sm text-ink mt-2">
                <span className="font-semibold">
                  {data.raw_score}
                </span>
                <span className="text-muted"> de </span>
                <span className="font-semibold">{data.max_score}</span>
                <span className="text-muted"> puntos</span>
                {" · "}
                <span className="font-semibold">{data.correct_count}</span>
                <span className="text-muted"> de </span>
                <span className="font-semibold">{data.total_gradeable}</span>
                <span className="text-muted"> preguntas correctas</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:min-w-[280px]">
              <StatBox
                icon={data.auto_closed ? AlertCircle : CheckCircle2}
                label="Estado"
                value={data.auto_closed ? "Cerrado por tiempo" : "Completado"}
                iconColor={data.auto_closed ? "text-saffron" : "text-ok"}
              />
              <StatBox
                icon={Clock}
                label="Tiempo usado"
                value={formatDuration(data.time_used_seconds)}
              />
              <StatBox
                icon={CalendarDays}
                label="Terminado"
                value={formatDate(data.completed_at)}
                small
              />
              <StatBox
                icon={Clock}
                label="Duración"
                value={`${data.paper_duration_minutes} min`}
              />
            </div>
          </div>
        </div>
      ) : (
        <WritingResultCard data={data} />
      )}
    </div>
  );
}


function StatBox({
  icon: Icon,
  label,
  value,
  iconColor = "text-navy",
  small = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-white rounded border border-rule px-3 py-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className={`h-3 w-3 ${iconColor}`} />
        <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
          {label}
        </p>
      </div>
      <p className={`${small ? "text-xs" : "text-sm"} font-semibold text-ink`}>
        {value}
      </p>
    </div>
  );
}


function WritingResultCard({ data }: { data: ResultData }) {
  const allCorrected = data.writing_pending === 0 && data.writing_max_score > 0;

  if (!allCorrected) {
    return (
      <div className="mt-6 rounded-lg border-2 border-saffron/30 bg-saffron/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-saffron/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-saffron" />
          </div>
          <div>
            <p className="text-lg font-semibold text-ink">
              Pendiente de corrección
            </p>
            <p className="text-sm text-muted mt-1 leading-relaxed max-w-lg">
              Tu profesor corregirá tus tareas de Writing con la rúbrica
              oficial Cambridge. Recibirás la nota cuando esté lista.
            </p>
            <p className="text-xs text-muted mt-3">
              {data.writing_pending} de{" "}
              {data.parts.reduce(
                (n, p) => n + p.questions.filter((q) => q.question_type === "writing_task").length,
                0
              )}{" "}
              tareas pendientes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Todas corregidas
  const total = data.writing_current_score ?? 0;
  const pct =
    data.writing_max_score > 0
      ? Math.round((total / data.writing_max_score) * 100)
      : 0;
  const scoreColor =
    pct >= 70 ? "text-ok" : pct >= 50 ? "text-saffron" : "text-error";
  const bgColor =
    pct >= 70
      ? "bg-ok/5 border-ok/20"
      : pct >= 50
      ? "bg-saffron/5 border-saffron/20"
      : "bg-error/5 border-error/20";

  return (
    <div className={`mt-6 rounded-lg border-2 ${bgColor} p-6 md:p-8`}>
      <p className="text-xs uppercase tracking-wider text-muted font-medium mb-2">
        Nota del Writing
      </p>
      <div className="flex items-baseline gap-3">
        <span className={`text-6xl md:text-7xl font-bold tabular-nums ${scoreColor}`}>
          {pct}
        </span>
        <span className={`text-3xl font-semibold ${scoreColor}`}>%</span>
      </div>
      <p className="text-sm text-ink mt-2">
        <span className="font-semibold">{total}</span>
        <span className="text-muted"> de </span>
        <span className="font-semibold">{data.writing_max_score}</span>
        <span className="text-muted"> puntos según rúbrica Cambridge</span>
      </p>
    </div>
  );
}
