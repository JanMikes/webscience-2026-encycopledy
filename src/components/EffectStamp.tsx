import { AnimatePresence, motion } from "framer-motion";

type Props = {
  text: string | null;
  tone?: "super" | "weak" | "immune" | "miss" | "crit";
  keySeed: number;
};

const COLORS: Record<NonNullable<Props["tone"]>, string> = {
  super:  "text-electric",
  weak:   "text-water",
  immune: "text-white/70",
  miss:   "text-white/80",
  crit:   "text-hot",
};

export default function EffectStamp({ text, tone = "super", keySeed }: Props) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={keySeed}
          initial={{ scale: 4, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: -8 }}
          exit={{ opacity: 0, scale: 1.4 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          className="absolute left-1/2 top-[32%] -translate-x-1/2 pointer-events-none z-30"
        >
          <div
            className={`display text-[100px] leading-none ${COLORS[tone]}`}
            style={{
              WebkitTextStroke: "6px #0a0a14",
              textShadow: "0 0 32px currentColor, 6px 8px 0 #0a0a14",
            }}
          >
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
