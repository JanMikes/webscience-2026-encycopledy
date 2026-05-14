import type { TypeName, Effectiveness } from "../data/types";

type Chart = Partial<Record<TypeName, Partial<Record<TypeName, number>>>>;

// Defender type -> Attacker type multipliers, classic Gen 6+ chart
const CHART: Chart = {
  normal:   { fighting: 2, ghost: 0 },
  fire:     { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5 },
  water:    { electric: 2, grass: 2, water: 0.5, fire: 0.5, ice: 0.5, steel: 0.5 },
  electric: { ground: 2, electric: 0.5, flying: 0.5, steel: 0.5 },
  grass:    { fire: 2, ice: 2, poison: 2, flying: 2, bug: 2, water: 0.5, electric: 0.5, grass: 0.5, ground: 0.5 },
  ice:      { fire: 2, fighting: 2, rock: 2, steel: 2, ice: 0.5 },
  fighting: { flying: 2, psychic: 2, fairy: 2, bug: 0.5, rock: 0.5, dark: 0.5 },
  poison:   { ground: 2, psychic: 2, grass: 0.5, fighting: 0.5, poison: 0.5, bug: 0.5, fairy: 0.5 },
  ground:   { water: 2, grass: 2, ice: 2, poison: 0.5, rock: 0.5, electric: 0 },
  flying:   { electric: 2, ice: 2, rock: 2, grass: 0.5, fighting: 0.5, bug: 0.5, ground: 0 },
  psychic:  { bug: 2, ghost: 2, dark: 2, fighting: 0.5, psychic: 0.5 },
  bug:      { fire: 2, flying: 2, rock: 2, grass: 0.5, fighting: 0.5, ground: 0.5 },
  rock:     { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2, normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5 },
  ghost:    { ghost: 2, dark: 2, poison: 0.5, bug: 0.5, normal: 0, fighting: 0 },
  dragon:   { ice: 2, dragon: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5 },
  dark:     { fighting: 2, bug: 2, fairy: 2, ghost: 0.5, dark: 0.5, psychic: 0 },
  steel:    { fire: 2, fighting: 2, ground: 2, normal: 0.5, grass: 0.5, ice: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, poison: 0 },
  fairy:    { poison: 2, steel: 2, fighting: 0.5, bug: 0.5, dark: 0.5, dragon: 0 },
};

export function multiplier(attackType: TypeName, defenderTypes: TypeName[]): number {
  let mult = 1;
  for (const t of defenderTypes) {
    const m = CHART[t]?.[attackType];
    if (m !== undefined) mult *= m;
  }
  return mult;
}

export function effectivenessLabel(mult: number): Effectiveness {
  if (mult === 0) return "immune";
  if (mult >= 2) return "super";
  if (mult <= 0.5) return "weak";
  return "normal";
}

// A short flavor move name for each type
export const TYPE_MOVES: Record<TypeName, string[]> = {
  normal:   ["Body Slam", "Hyper Beam", "Tackle"],
  fire:     ["Flamethrower", "Fire Blast", "Inferno"],
  water:    ["Hydro Pump", "Surf", "Aqua Tail"],
  electric: ["Thunderbolt", "Thunder", "Volt Tackle"],
  grass:    ["Solar Beam", "Vine Whip", "Leaf Storm"],
  ice:      ["Ice Beam", "Blizzard", "Frost Breath"],
  fighting: ["Close Combat", "Dynamic Punch", "Sky Uppercut"],
  poison:   ["Sludge Bomb", "Toxic", "Acid Spray"],
  ground:   ["Earthquake", "Earth Power", "Bulldoze"],
  flying:   ["Air Slash", "Hurricane", "Aerial Ace"],
  psychic:  ["Psychic", "Psybeam", "Future Sight"],
  bug:      ["X-Scissor", "Bug Buzz", "Megahorn"],
  rock:     ["Stone Edge", "Rock Slide", "Rock Throw"],
  ghost:    ["Shadow Ball", "Shadow Sneak", "Hex"],
  dragon:   ["Dragon Pulse", "Outrage", "Draco Meteor"],
  dark:     ["Crunch", "Dark Pulse", "Foul Play"],
  steel:    ["Iron Tail", "Flash Cannon", "Meteor Mash"],
  fairy:    ["Moonblast", "Dazzling Gleam", "Play Rough"],
};

export function pickMove(types: TypeName[]): { name: string; type: TypeName } {
  const t = types[Math.floor(Math.random() * types.length)];
  const pool = TYPE_MOVES[t];
  return { name: pool[Math.floor(Math.random() * pool.length)], type: t };
}
