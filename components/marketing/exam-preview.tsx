import {
  Clock,
  Wifi,
  Bell,
  Menu,
  Edit3,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mini-mockup del simulador para el hero de la home.
 * Refleja la pantalla real que verá el alumno: estilo moderno, limpio,
 * dos columnas (texto con huecos + párrafos seleccionables), barra de partes abajo.
 */
export function ExamPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md overflow-hidden border border-gray-200 bg-white shadow-[0_24px_60px_-24px_rgba(10,14,26,0.25)] text-[11px]",
        className
      )}
    >
      {/* HEADER */}
      <div className="h-9 px-3 flex items-center justify-between bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[12px] text-ink">
            Acertl<span className="relative inline-block">ı<span className="absolute" style={{ top: "-0.45em", left: "50%", width: "0.18em", height: "0.32em", backgroundColor: "#C5894A", transform: "translateX(-30%) rotate(20deg)", borderRadius: "0.04em" }} /></span>o
          </span>
          <span className="text-[10px] text-gray-700 font-medium">Candidate ID</span>
          <span className="text-[10px] text-gray-400 font-mono">AC-2026-0341</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-navy-50 border border-navy/15 rounded-full">
            <Clock className="h-2.5 w-2.5 text-navy" />
            <span className="font-mono font-semibold text-navy tabular-nums text-[10px]">88:42</span>
          </div>
          <Wifi className="h-3 w-3 text-gray-400" />
          <Bell className="h-3 w-3 text-gray-400" />
          <Menu className="h-3 w-3 text-gray-400" />
          <Edit3 className="h-3 w-3 text-gray-400" />
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-200">
        <p className="font-semibold text-[10px] text-gray-900">Questions 41–46</p>
        <p className="text-[9px] text-gray-700 mt-0.5 leading-snug">
          Six paragraphs have been removed from the text below. Choose the correct paragraph for each gap.
        </p>
      </div>

      {/* BODY */}
      <div className="grid grid-cols-12 gap-2 px-3 py-3 bg-gray-50 min-h-[200px]">
        {/* Text column */}
        <div className="col-span-7 bg-white rounded border border-gray-200 p-3">
          <p className="font-bold text-[12px] text-gray-900 mb-2">The Scottish Wildcat</p>
          <p className="text-[10px] text-gray-800 leading-relaxed mb-2">
            On my living-room wall I have a painting of a wildcat by John Holmes of which I am extremely fond.
          </p>
          {/* Gap 41 - active */}
          <div className="w-full h-7 rounded border-2 border-dashed border-navy bg-navy-50/40 flex items-center justify-center font-mono text-[10px] text-navy">
            41
          </div>
          <p className="text-[10px] text-gray-800 leading-relaxed mt-2">
            However, the physical differences are tangible. The wildcat is a much larger animal, weighing in some cases up to seven kilos…
          </p>
        </div>

        {/* Paragraphs column */}
        <div className="col-span-4 space-y-1.5">
          {[
            { id: "A", selected: true, text: "Conservation groups, alarmed by the steady decline, began a series of targeted breeding programmes…" },
            { id: "B", text: "The wildcat waits for a while in rapt concentration, ears twitching and eyes watching…" },
            { id: "C", text: "The results, which are expected shortly, will be fascinating. But anyone who has seen…" },
          ].map((p) => (
            <div
              key={p.id}
              className={cn(
                "p-1.5 rounded border-2 bg-white",
                p.selected ? "border-navy ring-2 ring-navy/10" : "border-gray-200"
              )}
            >
              <div className="flex items-start gap-1.5">
                <span
                  className={cn(
                    "shrink-0 h-3.5 w-3.5 rounded text-[9px] font-bold font-mono flex items-center justify-center",
                    p.selected ? "bg-navy text-white" : "bg-gray-100 text-gray-700"
                  )}
                >
                  {p.id}
                </span>
                <p className="text-[9px] text-gray-700 leading-snug line-clamp-2">{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right rail */}
        <div className="col-span-1 flex flex-col items-center justify-between py-1">
          <div className="h-5 w-5 rounded bg-white border border-gray-300 flex items-center justify-center">
            <Bookmark className="h-3 w-3 text-gray-400" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-7 w-7 rounded bg-gray-200 flex items-center justify-center">
              <ChevronLeft className="h-3.5 w-3.5 text-gray-700" />
            </div>
            <div className="h-7 w-7 rounded bg-navy flex items-center justify-center">
              <ChevronRight className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-white border-t border-gray-200 h-10 flex items-stretch">
        {[
          { name: "Part 1", t: "1 de 8" },
          { name: "Part 2", t: "0 de 8" },
          { name: "Part 3", t: "0 de 8" },
          { name: "Part 4", t: "0 de 6" },
          { name: "Part 5", t: "0 de 6" },
          { name: "Part 6", t: "0 de 4" },
        ].map((p) => (
          <div key={p.name} className="flex-1 px-1 flex flex-col items-center justify-center border-r border-gray-200">
            <p className="text-[8px] font-medium text-gray-900">{p.name}</p>
            <p className="text-[7px] text-gray-500 font-mono">{p.t}</p>
          </div>
        ))}
        <div className="flex-[2.5] px-2 bg-gray-50 border-r border-gray-200 flex items-center gap-1.5">
          <span className="text-[8px] font-semibold text-gray-900">Part 7</span>
          <div className="flex gap-0.5">
            {[41, 42, 43, 44, 45, 46].map((n) => (
              <span
                key={n}
                className={cn(
                  "h-4 w-4 rounded text-[8px] font-mono font-medium flex items-center justify-center",
                  n === 41 ? "bg-navy text-white" : "bg-white border border-gray-300 text-gray-600"
                )}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 px-1 flex flex-col items-center justify-center border-r border-gray-200">
          <p className="text-[8px] font-medium text-gray-900">Part 8</p>
          <p className="text-[7px] text-gray-500 font-mono">0 de 10</p>
        </div>
        <div className="px-2 flex items-center">
          <div className="h-5 w-5 rounded-full bg-ok/15 flex items-center justify-center">
            <Check className="h-3 w-3 text-ok" />
          </div>
        </div>
      </div>
    </div>
  );
}
