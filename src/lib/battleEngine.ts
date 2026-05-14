import type { BattleEvent, Pokemon, TypeName } from "../data/types";
import { effectivenessLabel, multiplier, pickSmartMove } from "./typeChart";

function maxHp(p: Pokemon) {
  // Beefier than raw base stat so battles last ~6-10 turns
  return Math.round(p.stats.hp * 2.2 + 60);
}

function damageOf(
  attacker: Pokemon,
  defender: Pokemon,
  moveType: TypeName
) {
  const atk = Math.max(attacker.stats.attack, attacker.stats.specialAttack);
  const def = Math.max(defender.stats.defense, defender.stats.specialDefense);
  const base = (atk / Math.max(def, 1)) * 22;
  const mult = multiplier(moveType, defender.types);

  // STAB: same-type attack bonus — 1.5x when the move matches one of attacker's types
  const stab = attacker.types.includes(moveType) ? 1.5 : 1;

  // Super-effective hits crit more often (synergy bonus the user asked for)
  // mult >= 4: 35% crit, mult >= 2: 25%, mult <= 0.5: 6%, default 12%
  const critChance =
    mult >= 4 ? 0.35 :
    mult >= 2 ? 0.25 :
    mult <= 0.5 ? 0.06 :
    0.12;
  const crit = Math.random() < critChance;

  // Extra trait bonus on top of the chart multiplier so strong matchups feel decisive
  const traitBonus =
    mult >= 4 ? 1.25 :
    mult >= 2 ? 1.15 :
    mult <= 0.5 ? 0.9 :
    1;

  const jitter = 0.85 + Math.random() * 0.15;
  const dmg = Math.max(
    1,
    Math.round(base * mult * stab * traitBonus * (crit ? 1.6 : 1) * jitter)
  );
  return { dmg, mult, crit };
}

export function simulateBattle(p1: Pokemon, p2: Pokemon): BattleEvent[] {
  const out: BattleEvent[] = [{ kind: "start", p1, p2 }];
  const hp: [number, number] = [maxHp(p1), maxHp(p2)];
  const fighters = [p1, p2] as const;

  // Speed determines who goes first; tie = random
  const firstIdx: 0 | 1 =
    p1.stats.speed > p2.stats.speed ? 0 :
    p2.stats.speed > p1.stats.speed ? 1 :
    (Math.random() < 0.5 ? 0 : 1);

  let attacker: 0 | 1 = firstIdx;
  let safety = 30;

  while (hp[0] > 0 && hp[1] > 0 && safety-- > 0) {
    const defender: 0 | 1 = attacker === 0 ? 1 : 0;
    const move = pickSmartMove(fighters[attacker].types, fighters[defender].types);

    // ~7% miss
    if (Math.random() < 0.07) {
      out.push({ kind: "miss", attacker, move: move.name });
    } else {
      const { dmg, mult, crit } = damageOf(fighters[attacker], fighters[defender], move.type);
      hp[defender] = Math.max(0, hp[defender] - dmg);
      out.push({
        kind: "turn",
        attacker,
        defender,
        move: move.name,
        moveType: move.type,
        damage: dmg,
        effectiveness: effectivenessLabel(mult),
        crit,
        hpAfter: [hp[0], hp[1]],
      });
      if (hp[defender] <= 0) {
        out.push({ kind: "ko", winner: attacker });
        break;
      }
    }
    attacker = defender;
  }

  return out;
}

export function maxHpOf(p: Pokemon) {
  return maxHp(p);
}

// Lightweight simulation used only for win-chance estimation — skips event log allocation.
function simulateWinner(p1: Pokemon, p2: Pokemon): 0 | 1 | null {
  const hp: [number, number] = [maxHp(p1), maxHp(p2)];
  const fighters = [p1, p2] as const;

  let attacker: 0 | 1 =
    p1.stats.speed > p2.stats.speed ? 0 :
    p2.stats.speed > p1.stats.speed ? 1 :
    (Math.random() < 0.5 ? 0 : 1);

  let safety = 60;
  while (hp[0] > 0 && hp[1] > 0 && safety-- > 0) {
    const defender: 0 | 1 = attacker === 0 ? 1 : 0;
    const move = pickSmartMove(fighters[attacker].types, fighters[defender].types);
    if (Math.random() >= 0.07) {
      const { dmg } = damageOf(fighters[attacker], fighters[defender], move.type);
      hp[defender] = Math.max(0, hp[defender] - dmg);
      if (hp[defender] <= 0) return attacker;
    }
    attacker = defender;
  }
  // Tie-breaker: whoever has more HP left
  if (hp[0] === hp[1]) return null;
  return hp[0] > hp[1] ? 0 : 1;
}

const winChanceCache = new Map<string, number>();

// Returns probability (0..1) that p1 beats p2, estimated via Monte Carlo.
export function winChance(p1: Pokemon, p2: Pokemon, runs = 600): number {
  const key = `${p1.id}-${p2.id}-${runs}`;
  const cached = winChanceCache.get(key);
  if (cached !== undefined) return cached;

  let p1Wins = 0;
  let decisive = 0;
  for (let i = 0; i < runs; i++) {
    const w = simulateWinner(p1, p2);
    if (w === null) continue;
    decisive++;
    if (w === 0) p1Wins++;
  }
  const result = decisive === 0 ? 0.5 : p1Wins / decisive;
  winChanceCache.set(key, result);
  return result;
}
