import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useGameStore } from "../store/useGameStore";
import PokemonCard from "../components/PokemonCard";
import { winChance } from "../lib/battleEngine";

export default function PokedexScreen() {
  const roster = useGameStore((s) => s.roster);
  const selected = useGameStore((s) => s.selected);
  const toggle = useGameStore((s) => s.toggleSelect);
  const goVs = useGameStore((s) => s.goVs);
  const reset = useGameStore((s) => s.resetSelection);

  const both = !!(selected[0] && selected[1]);

  const odds = useMemo(() => {
    if (!selected[0] || !selected[1]) return null;
    const p1 = Math.round(winChance(selected[0], selected[1]) * 100);
    return { p1, p2: 100 - p1 };
  }, [selected[0]?.id, selected[1]?.id]);

  return (
    <div className="absolute inset-0 overflow-y-auto">
      {/* animated grid bg */}
      <div
        className="absolute inset-0 bg-grid pointer-events-none"
        style={{ animation: "grid-pan 28s linear infinite" }}
      />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-purp/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-hot/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-8 pt-10 pb-40">
        <header className="flex items-end justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="stamp text-acid text-[11px]">VERIFIED · 47 SCHOLARS</span>
              <span className="stamp text-hot text-[11px]" style={{ transform: "rotate(4deg)" }}>BANNED IN 3 REGIONS</span>
              <span className="stamp text-neon text-[11px]" style={{ transform: "rotate(-2deg)" }}>100% REAL FACTS</span>
            </div>
            <h1 className="wordmark text-[80px] leading-[0.92]">ENCYCLOPÆDIA</h1>
            <h1 className="wordmark text-[80px] leading-[0.92] -mt-2">POKÉMONICA</h1>
            <p className="display text-white/70 mt-3 text-lg">
              Pick 2. Watch them fight. <span className="text-acid">Believe nothing.</span>
            </p>
            <p className="pixel text-[10px] text-white/40 mt-2">
              VYBER DVA · NEVĚŘ NIKOMU · 2026 EDITION
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {roster.map((p, i) => {
            const sel = selected[0]?.id === p.id ? 1 : selected[1]?.id === p.id ? 2 : false;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
              >
                <PokemonCard pokemon={p} selected={sel as 1 | 2 | false} onPick={() => toggle(p)} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-md bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-center gap-6">
          <div className="flex items-center gap-3 flex-1">
            <Slot pokemon={selected[0]} label="P1" color="hot" winPct={odds?.p1} />
            <span className="display text-3xl text-white/40">VS</span>
            <Slot pokemon={selected[1]} label="P2" color="neon" winPct={odds?.p2} />
          </div>

          <AnimatePresence>
            {odds && (
              <motion.div
                key="odds-bar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="hidden md:flex flex-col items-center gap-1 px-4"
              >
                <div className="pixel text-[9px] text-white/50 tracking-widest">WIN CHANCE</div>
                <div className="flex items-baseline gap-3">
                  <span className="display text-3xl text-hot">{odds.p1}%</span>
                  <span className="pixel text-[10px] text-white/40">·</span>
                  <span className="display text-3xl text-neon">{odds.p2}%</span>
                </div>
                <div className="relative w-48 h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 bg-hot"
                    style={{ width: `${odds.p1}%` }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 bg-neon"
                    style={{ width: `${odds.p2}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={reset}
            className="pixel text-[10px] text-white/50 hover:text-white px-3 py-2"
          >
            CLEAR
          </button>

          <AnimatePresence>
            {both && (
              <motion.button
                key="ready"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                onClick={goVs}
                className="display text-2xl px-10 py-5 bg-acid text-ink rounded-xl"
                style={{ animation: "pulse-glow 1.6s ease-in-out infinite" }}
              >
                FIGHT! → READY
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Slot({
  pokemon,
  label,
  color,
  winPct,
}: {
  pokemon: ReturnType<typeof useGameStore.getState>["selected"][number];
  label: string;
  color: "hot" | "neon";
  winPct?: number;
}) {
  const bd = color === "hot" ? "border-hot" : "border-neon";
  const tx = color === "hot" ? "text-hot" : "text-neon";
  return (
    <div className={`relative flex items-center gap-3 px-3 py-2 border-2 ${bd} rounded-lg min-w-[200px]`}>
      <div className={`pixel text-[10px] ${tx}`}>{label}</div>
      {pokemon ? (
        <>
          <img src={pokemon.artworkUrl} alt={pokemon.name} className="h-12 w-12 object-contain" />
          <div className="display text-lg">{pokemon.name.toUpperCase()}</div>
          {winPct !== undefined && (
            <div className={`md:hidden ml-auto display text-base ${tx}`}>{winPct}%</div>
          )}
        </>
      ) : (
        <div className="pixel text-[10px] text-white/30">WAITING…</div>
      )}
    </div>
  );
}
