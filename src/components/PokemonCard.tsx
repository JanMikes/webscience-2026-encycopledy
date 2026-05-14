import { motion } from "framer-motion";
import { useRef } from "react";
import type { Pokemon } from "../data/types";
import TypePill from "./TypePill";
import StatsRadar from "./StatsRadar";
import { playCry } from "../lib/audio";

type Props = {
  pokemon: Pokemon;
  selected: 1 | 2 | false;
  onPick: () => void;
};

export default function PokemonCard({ pokemon, selected, onPick }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${-y * 14}deg`);
    el.style.setProperty("--ry", `${x * 14}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  const ringColor =
    selected === 1 ? "ring-hot/90 shadow-[0_0_42px_rgba(255,31,122,0.6)]" :
    selected === 2 ? "ring-neon/90 shadow-[0_0_42px_rgba(0,229,255,0.6)]" :
    "ring-white/10";

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => playCry(pokemon.cryUrl, 0.18)}
      onClick={onPick}
      whileTap={{ scale: 0.97 }}
      className={`relative rounded-2xl bg-gradient-to-b from-ink-2 to-black/80 ring-2 ${ringColor} p-4 cursor-pointer transition-shadow`}
      style={{
        transform: "perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transformStyle: "preserve-3d",
      }}
    >
      {/* selection stamp */}
      {selected && (
        <div className={`absolute -top-3 -right-3 z-10 stamp text-xs ${selected === 1 ? "text-hot" : "text-neon"}`}>
          P{selected} PICKED
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-1 flex-wrap">
          {pokemon.types.map((t) => <TypePill key={t} type={t} />)}
        </div>
        <span className="pixel text-[10px] text-white/40">#{String(pokemon.id).padStart(3, "0")}</span>
      </div>

      <div className="relative h-44 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,255,0,0.25),transparent_60%)]" />
        <img
          src={pokemon.artworkUrl}
          alt={pokemon.name}
          loading="lazy"
          className="relative h-40 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
          style={{ animation: `floaty ${2.6 + (pokemon.id % 7) * 0.13}s ease-in-out infinite` }}
        />
      </div>

      <div className="mt-2 flex items-end justify-between">
        <h3 className="display text-2xl text-white">{pokemon.name.toUpperCase()}</h3>
      </div>

      <div className="mt-1 flex items-center justify-center">
        <StatsRadar stats={pokemon.stats} size={140} color="#c0ff00" />
      </div>
    </motion.div>
  );
}
