import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";

export default function ResultScreen() {
  const goPokedex = useGameStore((s) => s.goPokedex);
  const winner = useGameStore((s) => s.winner);
  const [vw, setVw] = useState({ w: 1920, h: 1080 });

  useEffect(() => {
    const handle = () => setVw({ w: window.innerWidth, h: window.innerHeight });
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Allow click anywhere as safety
  return (
    <div
      className="absolute inset-0 bg-black overflow-hidden flex flex-col"
      onClick={goPokedex}
    >
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-acid/10 via-transparent to-hot/20" />

      {/* confetti */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ y: -40, x: Math.random() * vw.w, opacity: 1, rotate: 0 }}
          animate={{ y: vw.h + 40, rotate: 720 }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 1.5,
            repeat: Infinity,
          }}
          className="absolute block"
          style={{
            width: 8,
            height: 14,
            background: ["#c0ff00", "#ff1f7a", "#00e5ff", "#aa3bff", "#f8d030"][i % 5],
          }}
        />
      ))}

      {/* Main content (flexes to fill above the pinned button) */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center gap-4 px-6 py-6">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="stamp text-acid text-xl"
        >
          ★ WINNER ★
        </motion.div>

        {winner && (
          <motion.img
            src={winner.artworkUrl}
            alt={winner.name}
            initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
            className="object-contain"
            style={{
              height: "min(38vh, 280px)",
              filter:
                "drop-shadow(0 0 60px rgba(192,255,0,0.7)) drop-shadow(0 20px 40px rgba(0,0,0,0.8))",
              animation: "floaty 3s ease-in-out infinite",
            }}
          />
        )}

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="wordmark leading-none text-center"
          style={{ fontSize: "min(11vw, 110px)" }}
        >
          {winner?.name?.toUpperCase() ?? "DRAW"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pixel text-[11px] text-white/60 text-center"
        >
          ENCYCLOPÆDIA ENTRY UPDATED · ENTROPY +1
        </motion.div>
      </div>

      {/* Pinned restart button — always visible */}
      <div className="relative z-10 pb-8 pt-2 flex flex-col items-center gap-2">
        <motion.button
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 240, damping: 14 }}
          onClick={(e) => {
            e.stopPropagation();
            goPokedex();
          }}
          className="display text-3xl px-12 py-5 bg-acid text-ink rounded-xl shadow-[0_8px_28px_rgba(192,255,0,0.4)]"
          style={{ animation: "pulse-glow 1.6s ease-in-out infinite" }}
        >
          ↻ PLAY AGAIN
        </motion.button>
        <span className="pixel text-[9px] text-white/40">CLICK ANYWHERE TO RESTART</span>
      </div>
    </div>
  );
}
