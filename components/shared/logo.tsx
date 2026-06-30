import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

/**
 * Wordmark Acertlio.
 * Detalle distintivo: acento gráfico saffron sobre la "í" (refuerza la pronunciación
 * "Acertlío" y diferencia el logo del de otras marcas con sufijo similar).
 */
export function Logo({ className, variant = "default" }: LogoProps) {
  const fg = variant === "light" ? "#FFFFFF" : "#0B1F4F";
  const accent = "#C5894A";
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-semibold text-2xl tracking-tight",
        className
      )}
      style={{ color: fg }}
      aria-label="Acertlio"
    >
      <span>Acertl</span>
      <span className="relative inline-block">
        {/* la i sin punto para que el acento saffron sea claramente distinto */}
        <span style={{ display: "inline-block" }}>ı</span>
        {/* acento agudo gráfico en saffron */}
        <span
          aria-hidden="true"
          className="absolute"
          style={{
            top: "-0.42em",
            left: "50%",
            width: "0.18em",
            height: "0.32em",
            backgroundColor: accent,
            transform: "translateX(-30%) rotate(20deg)",
            borderRadius: "0.04em",
          }}
        />
      </span>
      <span>o</span>
    </span>
  );
}
