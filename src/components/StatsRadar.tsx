import type { Stats } from "../data/types";

type Props = { stats: Stats; size?: number; color?: string };

export default function StatsRadar({ stats, size = 140, color = "#c0ff00" }: Props) {
  const labels = ["HP", "ATK", "DEF", "SpA", "SpD", "SPE"] as const;
  const values = [
    stats.hp, stats.attack, stats.defense,
    stats.specialAttack, stats.specialDefense, stats.speed,
  ];
  const max = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;

  const points = values.map((v, i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const t = Math.min(1, v / max);
    return [cx + Math.cos(angle) * r * t, cy + Math.sin(angle) * r * t] as const;
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

  const ring = (frac: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      return [cx + Math.cos(angle) * r * frac, cy + Math.sin(angle) * r * frac];
    });
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <path key={f} d={ring(f)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      ))}
      {labels.map((_, i) => {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * r}
            y2={cy + Math.sin(angle) * r}
            stroke="rgba(255,255,255,0.08)"
          />
        );
      })}
      <path d={path} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1.5} />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={2.5} fill={color} />
      ))}
      {labels.map((l, i) => {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (r + 8);
        const ly = cy + Math.sin(angle) * (r + 8);
        return (
          <text
            key={l}
            x={lx}
            y={ly}
            fill="rgba(255,255,255,0.55)"
            fontSize="8"
            fontFamily="'Press Start 2P', monospace"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {l}
          </text>
        );
      })}
    </svg>
  );
}
