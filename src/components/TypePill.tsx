import type { TypeName } from "../data/types";

const COLOR: Record<TypeName, string> = {
  normal: "bg-normal", fire: "bg-fire", water: "bg-water", electric: "bg-electric text-ink",
  grass: "bg-grass", ice: "bg-ice text-ink", fighting: "bg-fighting", poison: "bg-poison",
  ground: "bg-ground text-ink", flying: "bg-flying", psychic: "bg-psychic", bug: "bg-bug",
  rock: "bg-rock", ghost: "bg-ghost", dragon: "bg-dragon", dark: "bg-dark",
  steel: "bg-steel text-ink", fairy: "bg-fairy",
};

export default function TypePill({ type }: { type: TypeName }) {
  return (
    <span
      className={`${COLOR[type]} pixel text-[9px] px-2 py-1 uppercase tracking-wider rounded-sm shadow-[2px_2px_0_rgba(0,0,0,0.35)]`}
    >
      {type}
    </span>
  );
}
