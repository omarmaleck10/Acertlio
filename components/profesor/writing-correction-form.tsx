"use client";

import { useState, useMemo } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trophy,
  ArrowRight,
} from "lucide-react";
import {
  saveWritingCorrectionAction,
  type CorrectionResult,
} from "@/app/profesor/simulacros/actions";

const initial: CorrectionResult = { error: null, success: null };

// Rúbrica Cambridge simplificada como guía en la interfaz
const RUBRIC_HINTS = {
  content: {
    title: "Content",
    subtitle: "¿Se han cubierto los puntos requeridos?",
    scale: [
      { score: 0, desc: "El contenido es irrelevante para la tarea." },
      { score: 2, desc: "Cubre parte de la tarea." },
      { score: 3, desc: "Cubre la tarea con algunas omisiones o desviaciones menores." },
      { score: 5, desc: "Cubre todos los puntos requeridos plenamente." },
    ],
  },
  communicative: {
    title: "Communicative Achievement",
    subtitle: "¿Registro apropiado? ¿El lector entiende con facilidad?",
    scale: [
      { score: 0, desc: "El texto no comunica el mensaje." },
      { score: 2, desc: "Registro no siempre apropiado, la comunicación se ve afectada." },
      { score: 3, desc: "Registro en general apropiado, el mensaje se entiende." },
      { score: 5, desc: "Registro totalmente apropiado, comunicación fluida y efectiva." },
    ],
  },
  organisation: {
    title: "Organisation",
    subtitle: "¿Hay estructura y coherencia?",
    scale: [
      { score: 0, desc: "Sin estructura o incoherente." },
      { score: 2, desc: "Organización básica, cohesión simple." },
      { score: 3, desc: "Organización clara con conectores básicos usados correctamente." },
      { score: 5, desc: "Organización coherente con variedad de conectores." },
    ],
  },
  language: {
    title: "Language",
    subtitle: "¿Vocabulario y gramática del nivel?",
    scale: [
      { score: 0, desc: "Los errores impiden la comunicación." },
      { score: 2, desc: "Vocabulario básico, errores frecuentes que a veces dificultan la comprensión." },
      { score: 3, desc: "Vocabulario adecuado del nivel, errores que no impiden la comunicación." },
      { score: 5, desc: "Rango amplio del nivel, precisión general con solo errores menores." },
    ],
  },
} as const;

interface Props {
  attemptId: string;
  questionId: string;
  existing: {
    content_score: number | null;
    communicative_score: number | null;
    organisation_score: number | null;
    language_score: number | null;
    feedback: string | null;
    status: string;
    corrected_at: string | null;
  } | null;
  nextWritingId: string | null;
  attemptDetailUrl: string;
}

export function WritingCorrectionForm({
  attemptId,
  questionId,
  existing,
  nextWritingId,
  attemptDetailUrl,
}: Props) {
  const [state, formAction] = useFormState(saveWritingCorrectionAction, initial);

  const [content, setContent] = useState<number>(existing?.content_score ?? 3);
  const [communicative, setCommunicative] = useState<number>(
    existing?.communicative_score ?? 3
  );
  const [organisation, setOrganisation] = useState<number>(
    existing?.organisation_score ?? 3
  );
  const [language, setLanguage] = useState<number>(existing?.language_score ?? 3);
  const [feedback, setFeedback] = useState<string>(existing?.feedback ?? "");
  const [redirectAfter, setRedirectAfter] = useState(false);

  const total = useMemo(
    () => content + communicative + organisation + language,
    [content, communicative, organisation, language]
  );

  const percentage = Math.round((total / 20) * 100);
  const passingThreshold = 12; // 60% del máximo
  const isPassing = total >= passingThreshold;
  const wasCorrected = existing?.status === "completed";

  // URL de redirección tras guardar: siguiente writing si hay, o detalle si es el último
  const redirectUrl = redirectAfter
    ? nextWritingId
      ? `/profesor/simulacros/${attemptId}/writing/${nextWritingId}`
      : attemptDetailUrl
    : "";

  return (
    <form action={formAction} className="bg-white rounded-lg border border-rule sticky top-4">
      <input type="hidden" name="attemptId" value={attemptId} />
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="redirect_to" value={redirectUrl} />

      {/* Header con total */}
      <header className="px-5 py-4 border-b border-rule bg-paper">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs uppercase tracking-wider text-muted font-medium">
            Rúbrica Cambridge
          </h2>
          {wasCorrected && (
            <span className="inline-flex items-center gap-1 text-xs text-ok">
              <CheckCircle2 className="h-3 w-3" />
              Corregido
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold font-mono tabular-nums text-ink">
            {total}
            <span className="text-lg text-muted">/20</span>
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isPassing ? "bg-ok/10 text-ok" : "bg-saffron/10 text-saffron"
            }`}
          >
            {isPassing ? (
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Pass
              </span>
            ) : (
              "Below pass"
            )}
          </span>
          <span className="text-xs text-muted ml-auto">{percentage}%</span>
        </div>
      </header>

      {/* 4 criterios */}
      <div className="divide-y divide-rule">
        <ScoreSlider
          name="content_score"
          label={RUBRIC_HINTS.content.title}
          subtitle={RUBRIC_HINTS.content.subtitle}
          scale={RUBRIC_HINTS.content.scale}
          value={content}
          onChange={setContent}
        />
        <ScoreSlider
          name="communicative_score"
          label={RUBRIC_HINTS.communicative.title}
          subtitle={RUBRIC_HINTS.communicative.subtitle}
          scale={RUBRIC_HINTS.communicative.scale}
          value={communicative}
          onChange={setCommunicative}
        />
        <ScoreSlider
          name="organisation_score"
          label={RUBRIC_HINTS.organisation.title}
          subtitle={RUBRIC_HINTS.organisation.subtitle}
          scale={RUBRIC_HINTS.organisation.scale}
          value={organisation}
          onChange={setOrganisation}
        />
        <ScoreSlider
          name="language_score"
          label={RUBRIC_HINTS.language.title}
          subtitle={RUBRIC_HINTS.language.subtitle}
          scale={RUBRIC_HINTS.language.scale}
          value={language}
          onChange={setLanguage}
        />
      </div>

      {/* Feedback */}
      <div className="px-5 py-4 border-t border-rule">
        <label className="text-xs uppercase tracking-wider text-muted font-medium mb-2 block">
          Comentario para el alumno (opcional)
        </label>
        <textarea
          name="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Ej: Buen registro y estructura. Cuida el uso de present perfect vs past simple. La nota 3 en Content es porque no incluiste el punto sobre..."
          className="w-full rounded border border-rule bg-white px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
        />
      </div>

      {/* Alerts */}
      {state.error && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded border border-bad/30 bg-bad/5 px-3 py-2 text-xs text-bad">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}
      {state.success && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded border border-ok/30 bg-ok/5 px-3 py-2 text-xs text-ok">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{state.success}</span>
        </div>
      )}

      {/* Botones */}
      <div className="px-5 py-4 border-t border-rule bg-paper flex flex-col gap-2">
        <SaveButton
          label="Guardar corrección"
          onClick={() => setRedirectAfter(false)}
        />
        {nextWritingId && (
          <SaveButton
            label="Guardar e ir al siguiente writing"
            icon={<ArrowRight className="h-4 w-4" />}
            secondary
            onClick={() => setRedirectAfter(true)}
          />
        )}
        {!nextWritingId && (
          <SaveButton
            label="Guardar y volver al intento"
            icon={<ArrowRight className="h-4 w-4" />}
            secondary
            onClick={() => setRedirectAfter(true)}
          />
        )}
      </div>
    </form>
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────
function ScoreSlider({
  name,
  label,
  subtitle,
  scale,
  value,
  onChange,
}: {
  name: string;
  label: string;
  subtitle: string;
  scale: readonly { score: number; desc: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  const currentHint = [...scale].reverse().find((s) => value >= s.score);

  return (
    <div className="px-5 py-4">
      <input type="hidden" name={name} value={value} />
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <span className="text-2xl font-bold font-mono tabular-nums text-navy shrink-0">
          {value}
          <span className="text-xs text-muted">/5</span>
        </span>
      </div>

      {/* Botones 0-5 */}
      <div className="flex items-center gap-1 mt-2">
        {[0, 1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`flex-1 h-9 rounded font-mono font-semibold text-sm transition-colors ${
              value === score
                ? "bg-navy text-white"
                : "bg-paper text-muted border border-rule hover:border-navy/40"
            }`}
            aria-label={`Puntuar ${score}`}
            aria-pressed={value === score}
          >
            {score}
          </button>
        ))}
      </div>

      {currentHint && (
        <p className="text-xs text-muted italic mt-2 leading-relaxed">
          {currentHint.desc}
        </p>
      )}
    </div>
  );
}

function SaveButton({
  label,
  icon,
  secondary = false,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  secondary?: boolean;
  onClick?: () => void;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded text-sm font-medium disabled:opacity-50 ${
        secondary
          ? "border-2 border-navy text-navy hover:bg-navy-50"
          : "bg-navy text-white hover:bg-navy-600"
      }`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Guardando…
        </>
      ) : (
        <>
          {icon ?? <Save className="h-4 w-4" />}
          {label}
        </>
      )}
    </button>
  );
}
