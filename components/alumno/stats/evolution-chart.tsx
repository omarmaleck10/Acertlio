"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { MockScorePoint } from "@/lib/stats/student";

interface Props {
  points: MockScorePoint[];
}

/**
 * Gráfica de evolución SVG casera (sin dependencias externas).
 * Muestra 2 líneas: overall + reading + writing (opcional).
 */
export function EvolutionChart({ points }: Props) {
  const chartData = useMemo(() => {
    if (points.length === 0) return null;

    const width = 720;
    const height = 260;
    const padding = { top: 20, right: 40, bottom: 40, left: 40 };

    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    // Escala X: distribuir puntos horizontalmente
    const n = points.length;
    const xStep = n === 1 ? innerW : innerW / (n - 1);

    // Escala Y: 0% a 100%
    const yScale = (pct: number) =>
      padding.top + innerH - (pct / 100) * innerH;

    const xScale = (i: number) => padding.left + i * xStep;

    // Series
    const overallPath = points
      .map((p, i) => {
        const x = xScale(i);
        const y = yScale(p.overall_pct);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    const readingPoints = points.filter((p) => p.reading_pct !== null);
    const readingPath =
      readingPoints.length > 0
        ? readingPoints
            .map((p, i) => {
              const idx = points.indexOf(p);
              const x = xScale(idx);
              const y = yScale(p.reading_pct!);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ")
        : "";

    const writingPoints = points.filter((p) => p.writing_pct !== null);
    const writingPath =
      writingPoints.length > 0
        ? writingPoints
            .map((p, i) => {
              const idx = points.indexOf(p);
              const x = xScale(idx);
              const y = yScale(p.writing_pct!);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ")
        : "";

    return {
      width,
      height,
      padding,
      innerH,
      xScale,
      yScale,
      overallPath,
      readingPath,
      writingPath,
    };
  }, [points]);

  if (points.length === 0) {
    return (
      <section className="mb-8">
        <SectionHeader />
        <div className="rounded-lg border border-rule bg-white p-10 text-center">
          <TrendingUp className="h-8 w-8 text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted">
            Cuando completes tu primer mock verás aquí tu evolución.
          </p>
        </div>
      </section>
    );
  }

  const c = chartData!;
  const yLabels = [0, 25, 50, 75, 100];

  return (
    <section className="mb-8">
      <SectionHeader />
      <div className="rounded-lg border border-rule bg-white p-6">
        {/* Leyenda */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <LegendItem color="#0B1F4F" label="Global" />
          <LegendItem color="#C5894A" label="Reading" dashed />
          <LegendItem color="#2E7D57" label="Writing" dashed />
        </div>

        {/* SVG */}
        <div className="overflow-x-auto">
          <svg
            width={c.width}
            height={c.height}
            viewBox={`0 0 ${c.width} ${c.height}`}
            className="w-full h-auto"
            style={{ minWidth: 500 }}
          >
            {/* Gridlines horizontales */}
            {yLabels.map((y) => (
              <g key={y}>
                <line
                  x1={c.padding.left}
                  y1={c.yScale(y)}
                  x2={c.width - c.padding.right}
                  y2={c.yScale(y)}
                  stroke="#E7E5E0"
                  strokeWidth="1"
                />
                <text
                  x={c.padding.left - 8}
                  y={c.yScale(y) + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {y}%
                </text>
              </g>
            ))}

            {/* Línea 60% (approbado approx) */}
            <line
              x1={c.padding.left}
              y1={c.yScale(60)}
              x2={c.width - c.padding.right}
              y2={c.yScale(60)}
              stroke="#2E7D57"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.4"
            />

            {/* Reading */}
            {c.readingPath && (
              <path
                d={c.readingPath}
                fill="none"
                stroke="#C5894A"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.7"
              />
            )}

            {/* Writing */}
            {c.writingPath && (
              <path
                d={c.writingPath}
                fill="none"
                stroke="#2E7D57"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.7"
              />
            )}

            {/* Overall (destacado) */}
            <path
              d={c.overallPath}
              fill="none"
              stroke="#0B1F4F"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Puntos overall */}
            {points.map((p, i) => (
              <g key={p.attempt_id}>
                <circle
                  cx={c.xScale(i)}
                  cy={c.yScale(p.overall_pct)}
                  r="4"
                  fill="#ffffff"
                  stroke="#0B1F4F"
                  strokeWidth="2"
                />
                <title>
                  {p.exam_title}: {p.overall_pct}%
                </title>
              </g>
            ))}

            {/* Labels X (mock number) */}
            {points.map((p, i) => (
              <text
                key={p.attempt_id + "-x"}
                x={c.xScale(i)}
                y={c.height - c.padding.bottom + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#6B7280"
              >
                {p.mock_number !== null ? `Mock ${p.mock_number}` : "Mock"}
              </text>
            ))}
          </svg>
        </div>

        <p className="text-xs text-muted mt-3 text-center">
          Línea discontinua verde = 60% (umbral aproximado de aprobado Cambridge)
        </p>
      </div>
    </section>
  );
}


function SectionHeader() {
  return (
    <h2 className="text-sm font-medium text-ink mb-4 uppercase tracking-wider flex items-center gap-2">
      <TrendingUp className="h-4 w-4 text-saffron" />
      Evolución de tus notas
    </h2>
  );
}


function LegendItem({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="20" height="4">
        <line
          x1="0"
          y1="2"
          x2="20"
          y2="2"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? "3 2" : undefined}
        />
      </svg>
      <span className="text-xs text-ink">{label}</span>
    </div>
  );
}
