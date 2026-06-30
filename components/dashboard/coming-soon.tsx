import { Sparkles, Check } from "lucide-react";

interface ComingSoonPanelProps {
  icon: React.ReactNode;
  title: string;
  eyebrow?: string;
  description: string;
  features: string[];
  phase?: string;
}

/**
 * Pantalla unificada para áreas del dashboard que estarán disponibles
 * en próximas fases. Mantiene la preview totalmente navegable.
 */
export function ComingSoonPanel({
  icon,
  title,
  eyebrow,
  description,
  features,
  phase = "Próxima fase",
}: ComingSoonPanelProps) {
  return (
    <div className="px-8 py-8 max-w-4xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">{eyebrow ?? title}</p>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mt-1">{title}</h1>
      </header>

      <div className="rounded border border-rule bg-white p-10 sm:p-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-navy-50 flex items-center justify-center text-navy mb-6 [&>svg]:h-7 [&>svg]:w-7">
            {icon}
          </div>
          <h2 className="text-2xl font-semibold text-ink mb-3">{title}</h2>
          <p className="text-muted leading-relaxed mb-8">{description}</p>

          <ul className="text-left space-y-2.5 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-saffron mt-0.5 shrink-0" strokeWidth={2.5} />
                <span className="text-ink">{f}</span>
              </li>
            ))}
          </ul>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-saffron/10 border border-saffron/20">
            <Sparkles className="h-3.5 w-3.5 text-saffron" />
            <span className="text-xs font-medium text-saffron">Disponible en {phase}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
