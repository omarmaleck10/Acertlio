import {
  BookOpen,
  Type,
  ListOrdered,
  MessageSquareText,
  Users2,
  Lightbulb,
} from "lucide-react";

interface Suggestion {
  type: string;
  text: string;
  example?: string | null;
}

interface Props {
  suggestions: Suggestion[];
}

const TYPE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  grammar: {
    label: "Gramática",
    icon: BookOpen,
    color: "text-navy",
  },
  vocabulary: {
    label: "Vocabulario",
    icon: Type,
    color: "text-saffron",
  },
  structure: {
    label: "Estructura",
    icon: ListOrdered,
    color: "text-ok",
  },
  content: {
    label: "Contenido",
    icon: MessageSquareText,
    color: "text-navy",
  },
  register: {
    label: "Registro/tono",
    icon: Users2,
    color: "text-saffron",
  },
};


export function SuggestionsList({ suggestions }: Props) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wider text-navy font-medium mb-3 flex items-center gap-1.5">
        <Lightbulb className="h-3.5 w-3.5" />
        Sugerencias para mejorar
      </p>
      <div className="space-y-2.5">
        {suggestions.map((s, idx) => {
          const meta = TYPE_META[s.type] ?? {
            label: "Consejo",
            icon: Lightbulb,
            color: "text-muted",
          };
          const Icon = meta.icon;
          return (
            <div
              key={idx}
              className="rounded border border-rule bg-white p-3 flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`h-4 w-4 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] uppercase tracking-wider font-semibold ${meta.color} mb-1`}>
                  {meta.label}
                </p>
                <p className="text-sm text-ink leading-relaxed">{s.text}</p>
                {s.example && (
                  <div className="mt-2 rounded bg-paper p-2 text-xs text-muted border-l-2 border-navy/40">
                    <span className="uppercase tracking-wider text-[9px] font-semibold text-navy block mb-0.5">
                      Ejemplo
                    </span>
                    <span className="italic">{s.example}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
