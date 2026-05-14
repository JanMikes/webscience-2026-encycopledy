import { motion } from "framer-motion";
import type { Pokemon } from "../data/types";
import { maxHpOf } from "../lib/battleEngine";

type Props = {
  pokemon: Pokemon;
  hp: number;
  side: "left" | "right";
  accent: "hot" | "neon";
};

export default function HPBar({ pokemon, hp, side, accent }: Props) {
  const max = maxHpOf(pokemon);
  const pct = Math.max(0, Math.min(1, hp / max));
  const barColor =
    pct > 0.5 ? "from-acid via-acid to-acid"
    : pct > 0.25 ? "from-electric via-electric to-fire"
    : "from-fire via-hot to-hot";

  const align = side === "left" ? "items-start" : "items-end";
  const tx = accent === "hot" ? "text-hot" : "text-neon";
  const flipBar = side === "right";

  return (
    <div className={`flex flex-col ${align} gap-1.5 min-w-[420px]`}>
      <div className="flex items-center gap-3">
        <span className={`pixel text-[10px] ${tx}`}>#{String(pokemon.id).padStart(3, "0")}</span>
        <span className="display text-3xl text-white">{pokemon.name.toUpperCase()}</span>
      </div>
      <div className="relative w-full h-5 bg-black/70 border border-white/15 rounded-sm overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${barColor} ${flipBar ? "origin-right" : "origin-left"}`}
          style={{ transformOrigin: flipBar ? "right" : "left" }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.25)_0,rgba(0,0,0,0.25)_2px,transparent_2px,transparent_8px)] pointer-events-none" />
      </div>
      <div className="pixel text-[10px] text-white/70">
        {hp} / {max} HP
      </div>
    </div>
  );
}
