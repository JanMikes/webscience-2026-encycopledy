import { AnimatePresence, motion } from "framer-motion";
import type { TypeName } from "../data/types";

const TYPE_COLOR: Record<TypeName, string> = {
  normal: "#a8a878", fire: "#ff8030", water: "#6890f0", electric: "#f8d030",
  grass: "#78c850", ice: "#98d8d8", fighting: "#c03028", poison: "#a040a0",
  ground: "#e0c068", flying: "#a890f0", psychic: "#f85888", bug: "#a8b820",
  rock: "#b8a038", ghost: "#705898", dragon: "#7038f8", dark: "#705848",
  steel: "#b8b8d0", fairy: "#ee99ac",
};

type Burst = { id: number; side: "left" | "right"; type: TypeName };

export default function ParticleBurst({ bursts }: { bursts: Burst[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <AnimatePresence>
        {bursts.map((b) => (
          <BurstCloud key={b.id} side={b.side} color={TYPE_COLOR[b.type] ?? "#fff"} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function BurstCloud({ side, color }: { side: "left" | "right"; color: string }) {
  const count = 22;
  const cx = side === "left" ? "26%" : "74%";
  return (
    <div className="absolute" style={{ left: cx, top: "55%" }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const dist = 80 + Math.random() * 180;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 40;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="absolute block rounded-full"
            style={{
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              background: color,
              boxShadow: `0 0 16px ${color}, 0 0 32px ${color}`,
            }}
          />
        );
      })}
      {/* shockwave ring */}
      <motion.span
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute block rounded-full border-4"
        style={{
          width: 80,
          height: 80,
          left: -40,
          top: -40,
          borderColor: color,
          boxShadow: `0 0 30px ${color}`,
        }}
      />
    </div>
  );
}
