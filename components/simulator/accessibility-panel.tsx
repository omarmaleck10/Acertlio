"use client";

import { useEffect, useRef } from "react";
import { X, Type, Palette } from "lucide-react";

export type FontSize = "sm" | "base" | "lg" | "xl";
export type ColorTheme = "paper" | "sepia" | "high-contrast" | "dark";

interface Props {
  open: boolean;
  onClose: () => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  colorTheme: ColorTheme;
  onColorThemeChange: (theme: ColorTheme) => void;
}

const FONT_SIZES: Array<{ value: FontSize; label: string; example: string }> = [
  { value: "sm", label: "Pequeño", example: "Aa" },
  { value: "base", label: "Normal", example: "Aa" },
  { value: "lg", label: "Grande", example: "Aa" },
  { value: "xl", label: "Muy grande", example: "Aa" },
];

const COLOR_THEMES: Array<{
  value: ColorTheme;
  label: string;
  bg: string;
  fg: string;
  desc: string;
}> = [
  { value: "paper", label: "Papel", bg: "#FAFAF7", fg: "#0A0E1A", desc: "Fondo claro estándar" },
  { value: "sepia", label: "Sepia", bg: "#F4EAD5", fg: "#3E2C1C", desc: "Suave para lectura larga" },
  { value: "high-contrast", label: "Alto contraste", bg: "#FFFFFF", fg: "#000000", desc: "Blanco puro sobre negro puro" },
  { value: "dark", label: "Oscuro", bg: "#1A1A1A", fg: "#F5F5F5", desc: "Para ojos cansados" },
];

/**
 * Panel de accesibilidad del simulador.
 * Cambridge también ofrece estos ajustes en su interfaz oficial.
 * Los cambios se aplican vía atributos data-* en el elemento raíz y CSS.
 */
export function AccessibilityPanel({
  open,
  onClose,
  fontSize,
  onFontSizeChange,
  colorTheme,
  onColorThemeChange,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar al pulsar Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 z-40"
        onClick={onClose}
        aria-label="Cerrar panel"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Ajustes de accesibilidad"
        className="fixed top-16 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg border border-rule shadow-xl z-50 overflow-hidden"
      >
        <header className="px-4 py-3 border-b border-rule flex items-center justify-between bg-paper">
          <h3 className="text-sm font-medium text-ink">Ajustes de pantalla</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white rounded"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </header>

        <div className="p-4 space-y-5">
          {/* Tamaño de letra */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-4 w-4 text-navy" />
              <h4 className="text-xs uppercase tracking-wider text-muted font-medium">
                Tamaño de letra
              </h4>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {FONT_SIZES.map((opt) => {
                const isActive = fontSize === opt.value;
                const scale =
                  opt.value === "sm"
                    ? "text-xs"
                    : opt.value === "base"
                    ? "text-sm"
                    : opt.value === "lg"
                    ? "text-base"
                    : "text-lg";
                return (
                  <button
                    key={opt.value}
                    onClick={() => onFontSizeChange(opt.value)}
                    className={`flex flex-col items-center gap-1 py-2 rounded border-2 transition-colors ${
                      isActive
                        ? "border-navy bg-navy-50 text-navy"
                        : "border-rule bg-white text-muted hover:border-navy/40"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className={`font-serif font-medium ${scale}`}>
                      {opt.example}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color de fondo */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-navy" />
              <h4 className="text-xs uppercase tracking-wider text-muted font-medium">
                Color de fondo
              </h4>
            </div>
            <div className="space-y-2">
              {COLOR_THEMES.map((opt) => {
                const isActive = colorTheme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onColorThemeChange(opt.value)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded border-2 transition-colors text-left ${
                      isActive
                        ? "border-navy bg-navy-50"
                        : "border-rule bg-white hover:border-navy/40"
                    }`}
                    aria-pressed={isActive}
                  >
                    <div
                      className="w-10 h-10 rounded border border-rule shrink-0 flex items-center justify-center font-serif text-lg"
                      style={{ backgroundColor: opt.bg, color: opt.fg }}
                    >
                      Aa
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink">
                        {opt.label}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-muted pt-2 border-t border-rule leading-relaxed">
            Tus preferencias se guardan y se aplican también en futuros exámenes.
          </p>
        </div>
      </div>
    </>
  );
}
