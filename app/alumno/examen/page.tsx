"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Wifi,
  Bell,
  Menu,
  Edit3,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Maximize2,
  Minimize2,
  X,
  Palette,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

/* ----- Datos del simulacro (Reading Part 7 — Gapped Text) ----- */

const paragraphs = [
  {
    id: "A",
    text:
      "Conservation groups, alarmed by the steady decline, began a series of targeted breeding programmes in the early 2000s. These efforts were initially modest, but the genetic studies that followed transformed understanding of how isolated the surviving population had become.",
  },
  {
    id: "B",
    text:
      "The wildcat waits for a while in rapt concentration, ears twitching and eyes watching, seeing everything and hearing everything, trying to detect the tell-tale movement of a vole or a mouse. But there is nothing, and in another leap he disappears into the gloom.",
  },
  {
    id: "C",
    text:
      "The results, which are expected shortly, will be fascinating. But anyone who has seen one of these animals in the wild will be in little doubt that there is indeed a unique and distinctive presence living in the Highlands, whatever its background.",
  },
  {
    id: "D",
    text:
      "They probably used deciduous and coniferous woodland for shelter, particularly in winter, and hunted over more open areas such as forest edges, woodland thickets and scrub, grassy areas and marsh. Pressure from deforestation gradually pushed them to higher ground.",
  },
  {
    id: "E",
    text:
      "As the animals emerge, their curiosity is aroused by every movement and rustle in the vegetation. Later they will accompany their mother on hunting trips, learning the slow, patient work that defines a successful predator at this latitude.",
  },
  {
    id: "F",
    text:
      "Hybridisation with domestic cats remains the single greatest threat to the species. Without strict separation programmes, what looks like a wildcat today may genetically be something altogether different within only a few generations.",
  },
  {
    id: "G",
    text:
      "Recruitment of men to the armed forces during the conflict in Europe from 1914 to 1918 meant there was very little persecution, since gamekeepers went off to fight. As the number of gamekeepers decreased, the wildcat began to recover its former range and extinction was narrowly averted.",
  },
];

const paragraphLetters = paragraphs.map((p) => p.id);

const parts = [
  { name: "Part 1", from: 1, to: 8 },
  { name: "Part 2", from: 9, to: 16 },
  { name: "Part 3", from: 17, to: 24 },
  { name: "Part 4", from: 25, to: 30 },
  { name: "Part 5", from: 31, to: 36 },
  { name: "Part 6", from: 37, to: 40 },
  { name: "Part 7", from: 41, to: 46 },
  { name: "Part 8", from: 47, to: 56 },
];

const ACTIVE_PART_INDEX = 6; // Part 7

/* ----- Página ----- */

export default function ExamenSimulatorPage() {
  const [active, setActive] = useState(41);
  const [selectedPara, setSelectedPara] = useState<string | null>(null);
  /** Asignación: gap (número) → letra de párrafo */
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 min en segundos
  const rootRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen state sync
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await rootRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* user denied / unsupported */
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const isPlaced = (letter: string) =>
    Object.values(assignments).some((v) => v === letter);

  const placedAt = (letter: string): number | null => {
    const entry = Object.entries(assignments).find(([, v]) => v === letter);
    return entry ? Number(entry[0]) : null;
  };

  const onParagraphClick = (letter: string) => {
    if (isPlaced(letter)) {
      // Si ya estaba colocado, devolverlo al pool
      const at = placedAt(letter);
      if (at !== null) {
        setAssignments((prev) => {
          const next = { ...prev };
          delete next[at];
          return next;
        });
      }
      setSelectedPara(null);
      return;
    }
    setSelectedPara((cur) => (cur === letter ? null : letter));
  };

  const onGapClick = (n: number) => {
    setActive(n);
    if (selectedPara && !assignments[n]) {
      setAssignments((prev) => ({ ...prev, [n]: selectedPara }));
      setSelectedPara(null);
    } else if (assignments[n]) {
      // Clear the gap
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[n];
        return next;
      });
    }
  };

  const toggleBookmark = (n: number) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const goPrev = () => setActive((n) => Math.max(41, n - 1));
  const goNext = () => setActive((n) => Math.min(46, n + 1));

  // Conteo de respondidas por parte (solo Part 7 tiene datos reales)
  const answeredInActivePart = Object.keys(assignments).length;

  return (
    <div
      ref={rootRef}
      className="h-screen flex flex-col bg-gray-50 overflow-hidden"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      {/* ───── HEADER ───── */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Acertlio">
            <Logo />
          </Link>
          <div>
            <p className="text-sm font-semibold text-gray-900">Candidate ID</p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">AC-2026-0341</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-navy-50 border border-navy/15 rounded-full mr-3">
            <Clock className="h-4 w-4 text-navy" />
            <span className="font-mono font-semibold text-navy tabular-nums text-sm">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-navy/70 uppercase tracking-wider ml-0.5">restantes</span>
          </div>

          {/* Toolbar icons */}
          <IconBtn label={isFullscreen ? "Salir pantalla completa" : "Pantalla completa"} onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </IconBtn>
          <IconBtn label="Conexión"><Wifi className="h-4 w-4" /></IconBtn>
          <IconBtn label="Notificaciones"><Bell className="h-4 w-4" /></IconBtn>
          <IconBtn label="Menú"><Menu className="h-4 w-4" /></IconBtn>
          <IconBtn label="Notas"><Edit3 className="h-4 w-4" /></IconBtn>

          <Link
            href="/alumno"
            className="ml-2 h-9 w-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Salir del simulacro"
            title="Salir"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* ───── INSTRUCTIONS ───── */}
      <div className="bg-gray-100 border-b border-gray-200 px-8 py-3.5 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">Questions 41–46</p>
        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
          Read an extract from a magazine article. Six paragraphs have been removed from the text below. For each question, choose from the paragraphs <strong>A–G</strong> the one that fits each gap. There is one extra paragraph which you do not need to use.
        </p>
      </div>

      {/* ───── MAIN ───── */}
      <main className="flex-1 grid grid-cols-12 gap-4 px-6 py-5 overflow-hidden min-h-0">
        {/* LEFT — text with gaps */}
        <article className="col-span-7 bg-white rounded border border-gray-200 overflow-y-auto px-7 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">The Scottish Wildcat</h2>

          <div className="text-[15px] text-gray-900 leading-[1.75] space-y-4">
            <p>
              On my living-room wall I have a painting of a wildcat by John Holmes of which I am extremely fond. It depicts a snarling, spitting animal, teeth bared and back arched: a taut coiled spring ready to unleash some unknown fury.
            </p>

            <Gap n={41} active={active === 41} bookmarked={bookmarked.has(41)} letter={assignments[41]} onClick={() => onGapClick(41)} hasSelection={!!selectedPara} />

            <p>
              However, the physical differences are tangible. The wildcat is a much larger animal, weighing in some cases up to seven kilos, the same as a typical male fox. The coat pattern is superficially similar to a domestic tabby cat but it is all stripes and no spots. The tail is thicker and blunter, with three to five black rings. The animal has an altogether heavier look.
            </p>

            <p>
              The Scottish wildcat was originally distinguished as a separate subspecies in 1912, but it is now generally recognised that there is little difference between the Scottish and other European populations. According to an excellent report on the wildcat printed in 1991, the animals originally occurred in a variety of habitats throughout Europe.
            </p>

            <Gap n={42} active={active === 42} bookmarked={bookmarked.has(42)} letter={assignments[42]} onClick={() => onGapClick(42)} hasSelection={!!selectedPara} />

            <p>
              Persecution by humans accelerated this retreat. By the late nineteenth century, the wildcat had virtually disappeared from England and Wales and clung on only in the remoter glens of the Scottish Highlands.
            </p>

            <Gap n={43} active={active === 43} bookmarked={bookmarked.has(43)} letter={assignments[43]} onClick={() => onGapClick(43)} hasSelection={!!selectedPara} />

            <p>
              Despite this brief reprieve, threats of a different kind soon emerged. The expansion of forestry plantations changed the landscape, and increased traffic on rural roads added a new and constant source of mortality, particularly for young animals dispersing from their birth territories.
            </p>

            <Gap n={44} active={active === 44} bookmarked={bookmarked.has(44)} letter={assignments[44]} onClick={() => onGapClick(44)} hasSelection={!!selectedPara} />

            <p>
              In the dens, kittens are born blind and helpless in April or May. For the first month they barely move, but as their senses develop, the world outside the den begins to call.
            </p>

            <Gap n={45} active={active === 45} bookmarked={bookmarked.has(45)} letter={assignments[45]} onClick={() => onGapClick(45)} hasSelection={!!selectedPara} />

            <p>
              Today, researchers are using camera traps and DNA sampling to estimate how many true wildcats remain in Scotland. Estimates vary widely, from a few hundred to fewer than forty pure individuals, depending on the criteria applied.
            </p>

            <Gap n={46} active={active === 46} bookmarked={bookmarked.has(46)} letter={assignments[46]} onClick={() => onGapClick(46)} hasSelection={!!selectedPara} />

            <p>
              Whatever the precise number, the wildcat&apos;s story is a reminder of how easily a species can slip away — and how much patient work it takes to bring one back from the edge.
            </p>
          </div>
        </article>

        {/* RIGHT — paragraphs */}
        <aside className="col-span-4 overflow-y-auto pr-1 space-y-2.5">
          {paragraphs.map((p) => {
            const placed = isPlaced(p.id);
            const selected = selectedPara === p.id;
            const placedNumber = placedAt(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onParagraphClick(p.id)}
                className={cn(
                  "w-full text-left p-4 rounded-md border-2 transition-all bg-white",
                  selected && "border-navy ring-4 ring-navy/10",
                  !selected && placed && "border-saffron/60 bg-saffron/5 opacity-60",
                  !selected && !placed && "border-gray-200 hover:border-gray-400"
                )}
                aria-pressed={selected}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "shrink-0 h-6 w-6 rounded flex items-center justify-center text-xs font-bold font-mono",
                      selected
                        ? "bg-navy text-white"
                        : placed
                        ? "bg-saffron text-white"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {p.id}
                  </span>
                  <p className="text-[13.5px] text-gray-800 leading-relaxed flex-1">
                    {p.text}
                  </p>
                </div>
                {placed && placedNumber !== null && (
                  <p className="mt-2 ml-9 text-[11px] font-mono text-saffron font-semibold">
                    Colocado en el hueco {placedNumber} · click para devolver
                  </p>
                )}
              </button>
            );
          })}
        </aside>

        {/* RIGHT RAIL — bookmark + nav arrows */}
        <div className="col-span-1 flex flex-col items-center justify-between py-2">
          <button
            onClick={() => toggleBookmark(active)}
            className={cn(
              "h-11 w-11 rounded-md flex items-center justify-center transition-colors",
              bookmarked.has(active)
                ? "bg-saffron text-white"
                : "bg-white border border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400"
            )}
            aria-label="Marcar pregunta"
            title="Marcar para revisar"
          >
            <Bookmark className={cn("h-5 w-5", bookmarked.has(active) && "fill-white")} />
          </button>

          <div className="flex flex-col gap-2">
            <button
              onClick={goPrev}
              className="h-14 w-14 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              aria-label="Pregunta anterior"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={goNext}
              className="h-14 w-14 rounded-md bg-navy hover:bg-navy-600 flex items-center justify-center transition-colors"
              aria-label="Pregunta siguiente"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </main>

      {/* ───── BOTTOM BAR ───── */}
      <footer className="h-[72px] bg-white border-t border-gray-200 flex items-stretch shrink-0">
        {parts.map((p, idx) => {
          const isActivePart = idx === ACTIVE_PART_INDEX;
          const total = p.to - p.from + 1;
          const answered = isActivePart ? answeredInActivePart : 0;

          if (isActivePart) {
            return (
              <div
                key={p.name}
                className="flex-[3] px-4 flex flex-col justify-center border-r border-gray-200 bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                    {p.name}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: total }, (_, i) => {
                      const n = p.from + i;
                      const isCurrent = active === n;
                      const isAnswered = !!assignments[n];
                      const isBookmarked = bookmarked.has(n);
                      return (
                        <button
                          key={n}
                          onClick={() => setActive(n)}
                          className={cn(
                            "relative h-9 w-9 rounded text-sm font-mono font-medium transition-colors",
                            isCurrent
                              ? "bg-navy text-white"
                              : isAnswered
                              ? "bg-navy-50 text-navy border border-navy/30"
                              : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                          )}
                        >
                          {n}
                          {isBookmarked && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-saffron" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={p.name}
              className="flex-1 px-3 flex flex-col items-center justify-center border-r border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{p.name}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                {answered} de {total}
              </p>
            </button>
          );
        })}

        {/* Final indicators */}
        <div className="flex items-center px-5 gap-3 shrink-0">
          <button
            className="h-10 w-10 rounded-full bg-ok/10 hover:bg-ok/20 flex items-center justify-center transition-colors"
            aria-label="Terminar simulacro"
            title="Terminar simulacro"
          >
            <Check className="h-5 w-5 text-ok" />
          </button>
          <button
            className="h-10 w-10 rounded-full bg-gradient-to-br from-saffron via-navy to-bad/80 flex items-center justify-center"
            aria-label="Resumen del examen"
            title="Resumen"
          >
            <Palette className="h-4 w-4 text-white" />
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ───── Helpers ───── */

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-9 w-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
    >
      {children}
    </button>
  );
}

function Gap({
  n,
  active,
  bookmarked,
  letter,
  hasSelection,
  onClick,
}: {
  n: number;
  active: boolean;
  bookmarked: boolean;
  letter?: string;
  hasSelection: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full h-12 rounded border-2 border-dashed flex items-center justify-center font-mono text-sm transition-all",
        letter
          ? "border-saffron/70 bg-saffron/10 text-ink border-solid"
          : active
          ? "border-navy bg-navy-50/40 text-navy"
          : hasSelection
          ? "border-navy/40 text-navy/60 hover:border-navy hover:bg-navy-50/40"
          : "border-gray-300 text-gray-400 hover:border-gray-400 hover:bg-gray-50"
      )}
      aria-label={`Hueco ${n}`}
    >
      {letter ? (
        <span className="font-semibold text-saffron">Párrafo {letter}</span>
      ) : (
        <span>{n}</span>
      )}
      {bookmarked && (
        <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-saffron" />
      )}
    </button>
  );
}
