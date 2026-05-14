export type TypeName =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export type Stats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type Pokemon = {
  id: number;
  name: string;            // capitalized display name
  slug: string;            // lowercase, for sprite URLs
  types: TypeName[];
  stats: Stats;
  cryUrl: string;
  artworkUrl: string;
  showdownUrl: string;     // animated GIF
};

export type Effectiveness = "immune" | "weak" | "normal" | "super";

export type BattleEvent =
  | { kind: "start"; p1: Pokemon; p2: Pokemon }
  | { kind: "turn"; attacker: 0 | 1; defender: 0 | 1; move: string; moveType: TypeName; damage: number; effectiveness: Effectiveness; crit: boolean; hpAfter: [number, number] }
  | { kind: "miss"; attacker: 0 | 1; move: string }
  | { kind: "ko"; winner: 0 | 1 };

export type Turn = Extract<BattleEvent, { kind: "turn" }>;

export type Scene = "pokedex" | "vs" | "battle" | "result";
