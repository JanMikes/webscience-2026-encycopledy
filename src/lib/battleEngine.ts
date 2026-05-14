import type { BattleEvent, Pokemon } from "../data/types";
import { effectivenessLabel, multiplier, pickMove } from "./typeChart";

function maxHp(p: Pokemon) {
  // Beefier than raw base stat so battles last ~6-10 turns
  return Math.round(p.stats.hp * 2.2 + 60);
}

function damageOf(attacker: Pokemon, defender: Pokemon, moveType: ReturnType<typeof pickMove>["type"]) {
  const atk = Math.max(attacker.stats.attack, attacker.stats.specialAttack);
  const def = Math.max(defender.stats.defense, defender.stats.specialDefense);
  const base = (atk / Math.max(def, 1)) * 22;
  const mult = multiplier(moveType, defender.types);
  const crit = Math.random() < 0.12;
  const jitter = 0.85 + Math.random() * 0.15;
  const dmg = Math.max(1, Math.round(base * mult * (crit ? 1.6 : 1) * jitter));
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
    const move = pickMove(fighters[attacker].types);

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
