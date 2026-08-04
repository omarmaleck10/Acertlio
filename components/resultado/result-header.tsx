import { CheckCircle2, Clock, AlertCircle, CalendarDays } from "lucide-react";
import type { ResultData } from "@/lib/exam/result-loader";
import { DownloadPdfButton } from "./download-pdf-button";
import { RetryAIButton } from "./retry-ai-button";

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-navy font-medium">
            {data.exam_level} · Mock {data.mock_number ?? "—"} · Resultado del paper
          </p>
          <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">
            {data.paper_title}
          </h1>
          <p className="text-sm text-muted mt-2">{data.exam_title}</p>
        </div>
        <DownloadPdfButton
          filenameHint={`Acertlio - ${data.exam_level} Mock ${data.mock_number ?? ""} - ${data.paper_title}`.trim()}
        />
      </div>

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

            {/* Botón solo para alumnos individuales:
                permite re-disparar la IA si la automática falló */}
            <RetryAIButton
              examId={data.exam_id}
              isIndividual={data.is_individual}
            />

            {/* Diagnóstico técnico visible: qué hay realmente en la BBDD.
                Sirve para saber por qué la corrección no aparece. */}
            {data.writing_debug && data.writing_debug.length > 0 && (
              <details className="mt-4 text-xs text-muted">
                <summary className="cursor-pointer font-medium">
                  Diagnóstico técnico (writing_corrections en BBDD)
                </summary>
                <div className="mt-3 space-y-3 font-mono">
                  <p className="text-ink">
                    Filas encontradas: <strong>{data.writing_debug.length}</strong>
                  </p>
                  {data.writing_debug.map((d, i) => (
                    <div
                      key={i}
                      className="rounded border border-rule bg-white p-3 space-y-0.5"
                    >
                      <p className="text-ink font-semibold">Fila #{i + 1}</p>
                      <p>question_id: <code className="text-[10px]">{d.question_id.slice(0, 8)}…</code></p>
                      <p>
                        status: <strong className={
                          d.status === "completed" ? "text-ok" : "text-saffron"
                        }>{d.status ?? "(null)"}</strong>
                      </p>
                      <p>
                        corrected_by_ai: <strong>{String(d.corrected_by_ai)}</strong>
                      </p>
                      <p>
                        has_corrected_at: <strong className={
                          d.has_corrected_at ? "text-ok" : "text-error"
                        }>{String(d.has_corrected_at)}</strong>
                      </p>
                      <p>
                        has_updated_at: <strong>{String(d.has_updated_at)}</strong>
                      </p>
                      <p>total_score: <strong>{d.total_score ?? "null"}</strong> / max 20</p>
                      <p>
                        content/comm/org/lang:{" "}
                        <strong>
                          {d.content_score ?? "null"}/
                          {d.communicative_score ?? "null"}/
                          {d.organisation_score ?? "null"}/
                          {d.language_score ?? "null"}
                        </strong>
                      </p>
                      <p>feedback (chars): <strong>{d.feedback_len}</strong></p>
                      <p>
                        academy_id: <strong className={
                          d.academy_id_null ? "text-saffron" : "text-ok"
                        }>{d.academy_id_null ? "NULL (individual)" : "presente"}</strong>
                      </p>
                    </div>
                  ))}
                  <p className="text-ink mt-3 leading-relaxed">
                    <strong>Cómo interpretar:</strong>{" "}
                    Si las filas tienen puntuaciones (total_score, content_score, etc.)
                    <strong> no-null</strong> y feedback con caracteres, la corrección
                    está OK pero algo bloquea el render. Si están todas en <code>null</code>,
                    la IA no llegó a corregir realmente y solo se marcó como intentado.
                    Mándame captura de esto.
                  </p>
                </div>
              </details>
            )}

            {data.writing_debug && data.writing_debug.length === 0 && (
              <details className="mt-4 text-xs text-muted" open>
                <summary className="cursor-pointer font-medium">
                  Diagnóstico técnico completo
                </summary>
                <div className="mt-3 space-y-3 font-mono">
                  <p className="text-error font-semibold">
                    ❌ Sin filas de writing_corrections para este attempt.
                  </p>

                  {data.writing_debug_meta && (
                    <div className="rounded border border-rule bg-white p-3 space-y-1.5">
                      <p className="text-ink font-semibold">Meta del loader</p>
                      <p>
                        attempt_id usado:{" "}
                        <code className="text-[10px]">
                          {data.writing_debug_meta.attempt_id_used}
                        </code>
                      </p>
                      <p>
                        writing_questions encontradas:{" "}
                        <strong>
                          {data.writing_debug_meta.writing_questions_count}
                        </strong>
                      </p>
                      <p>
                        Filas en BBDD para este attempt (raw):{" "}
                        <strong
                          className={
                            data.writing_debug_meta.wc_raw_count > 0
                              ? "text-ok"
                              : "text-error"
                          }
                        >
                          {data.writing_debug_meta.wc_raw_count}
                        </strong>
                      </p>
                      <p>
                        Filas tras filtrar por question_id:{" "}
                        <strong
                          className={
                            data.writing_debug_meta.wc_filtered_count > 0
                              ? "text-ok"
                              : "text-error"
                          }
                        >
                          {data.writing_debug_meta.wc_filtered_count}
                        </strong>
                      </p>
                      {data.writing_debug_meta.writing_questions_first_ids
                        .length > 0 && (
                        <div>
                          <p>Primeras question_ids esperadas:</p>
                          {data.writing_debug_meta.writing_questions_first_ids.map(
                            (id, i) => (
                              <p key={i} className="ml-3">
                                · <code className="text-[10px]">{id}</code>
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {data.writing_debug_meta &&
                    data.writing_debug_meta.corrections_scanned_all.length >
                      0 && (
                      <div className="rounded border border-saffron/40 bg-saffron/5 p-3 space-y-1.5">
                        <p className="text-ink font-semibold">
                          🔍 Correcciones existentes para este alumno
                          (últimas 20, sin filtrar por attempt)
                        </p>
                        <p className="text-muted mb-2">
                          Si el attempt_id de estas filas es distinto al
                          &quot;attempt_id usado&quot; de arriba, la IA guardó
                          en otro attempt → bug de mismatch.
                        </p>
                        {data.writing_debug_meta.corrections_scanned_all.map(
                          (c, i) => {
                            const attemptMatches =
                              data.writing_debug_meta &&
                              c.attempt_id_short ===
                                data.writing_debug_meta.attempt_id_used.slice(
                                  0,
                                  8
                                ) + "…";
                            return (
                              <div
                                key={i}
                                className={`rounded p-2 border ${
                                  attemptMatches
                                    ? "border-ok bg-ok/5"
                                    : "border-error/30 bg-white"
                                }`}
                              >
                                <p>
                                  attempt:{" "}
                                  <code className="text-[10px]">
                                    {c.attempt_id_short}
                                  </code>
                                  {attemptMatches ? " ✓" : " ✗"}
                                </p>
                                <p>
                                  question:{" "}
                                  <code className="text-[10px]">
                                    {c.question_id_short}
                                  </code>
                                </p>
                                <p>
                                  status: <strong>{c.status ?? "null"}</strong>{" "}
                                  · IA:{" "}
                                  <strong>{String(c.corrected_by_ai)}</strong>{" "}
                                  · scores:{" "}
                                  <strong
                                    className={
                                      c.has_scores ? "text-ok" : "text-error"
                                    }
                                  >
                                    {String(c.has_scores)}
                                  </strong>
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}

                  {data.writing_debug_meta &&
                    data.writing_debug_meta.corrections_scanned_all.length ===
                      0 && (
                      <p className="text-error">
                        ❌ No hay NINGUNA corrección de este alumno en toda la
                        BBDD. La IA nunca ha guardado nada, ni siquiera con
                        otro attempt_id.
                      </p>
                    )}
                </div>
              </details>
            )}
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
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="h-5 w-5 text-ok" />
        <p className="text-xs uppercase tracking-wider text-ok font-semibold">
          Writing corregido
        </p>
      </div>
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
      <p className="text-xs text-muted mt-3 italic">
        Cada tarea de Writing muestra su corrección detallada más abajo,
        junto a tu respuesta.
      </p>
    </div>
  );
}
