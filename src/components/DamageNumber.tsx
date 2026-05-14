import { motion } from "framer-motion";

type Props = {
  value: number;
  crit?: boolean;
  side: "left" | "right";
  keySeed: number;
};

export default function DamageNumber({ value, crit, side, keySeed }: Props) {
  const color = crit ? "#ffe04b" : "#ffffff";
  return (
    <motion.div
      key={keySeed}
      initial={{ opacity: 0, y: 20, scale: 0.7, rotate: side === "left" ? -10 : 10 }}
      animate={{ opacity: 1, y: -100, scale: crit ? 1.6 : 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="absolute pointer-events-none"
      style={{
        left: side === "left" ? "22%" : "62%",
        bottom: "38%",
        fontFamily: "'Bungee', sans-serif",
        fontSize: crit ? 92 : 56,
        color,
        WebkitTextStroke: "3px #0a0a14",
        textShadow: `0 0 24px ${crit ? "#ffe04b" : "#fff"}, 4px 6px 0 #0a0a14`,
        zIndex: 30,
      }}
    >
      {crit ? `CRIT! ${value}` : `-${value}`}
    </motion.div>
  );
}
