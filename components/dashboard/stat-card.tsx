import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({ label, value, hint, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded border border-rule bg-white p-5", className)}>
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-semibold text-3xl text-ink tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-mono",
              trend.positive ? "text-ok" : "text-bad"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}
