// Punk-rock fake-AI commentator lines. Mixed Czech + English.
// {a} = attacker, {d} = defender, {w} = winner, {move} = move name

export const PRE_BATTLE = [
  "{a} vstupuje do arény. Voní vágně po pochybách.",
  "{d} just yawned at the crowd. Big mistake.",
  "Two legends. One arena. Zero refunds.",
  "Sázky uzavřeny! Audience už lituje svého života.",
  "{a} stretches. {d} sweats.",
  "Encyclopedic showdown — verified by 47 scholars.",
  "{a} vs {d}. Komentátor už si pere ponožky.",
];

export const ATTACK_NEUTRAL = [
  "{a} útočí: {move}! Pretty average. Pretty mid.",
  "{move} from {a}. The crowd murmurs.",
  "{a} swings {move}. It connects. Mildly.",
  "{a} kope {move}. Acceptable damage.",
  "{move}. Yep. That happened.",
  "{a}: \"{move}!\" {d}: \"...ok.\"",
];

export const ATTACK_SUPER = [
  "SUPER EFFECTIVE! {d} právě objevil(a) pokoru.",
  "OUCH. {move} just rearranged {d}'s ancestry.",
  "{move} hits like rent day. SUPER EFFECTIVE!",
  "Zničující {move}! {d} přehodnocuje životní volby.",
  "Effective beyond legal limits. {d} sees God.",
  "{d}: 404 dignity not found.",
];

export const ATTACK_WEAK = [
  "{move}? Bro. {d} barely felt it.",
  "Not very effective. {a} se omlouvá.",
  "{a} just slapped {d} with a wet napkin.",
  "Weak sauce. {d} laughs in {d}'s mother tongue.",
];

export const ATTACK_IMMUNE = [
  "ZERO DAMAGE. {a} hit empty air. Embarrassing.",
  "No effect! {d} fyzicky neexistuje pro tenhle útok.",
  "{move} passed through {d} like fog. Awkward.",
];

export const CRIT = [
  "KRITICKÝ ZÁSAH! Pediatři budou volat o pomoc.",
  "CRITICAL HIT — {d}'s soul left chat.",
  "That was a CRIT. {d} se ptá kde je telefon.",
  "DEVASTATING. Doctor recommends emotional support.",
];

export const MISS = [
  "{a} tries {move}... AND MISSES. Crowd boos.",
  "MISS! Vítr foukl, šance utekly.",
  "Air. {a} fought the air. Air won.",
  "{a}: 'I meant to do that.' Sure, buddy.",
];

export const LOW_HP = [
  "{d} je na vlásku! One more hit and we're DONE.",
  "{d} is RUNNING on vibes alone.",
  "Survival math: {d} = 1 papírový sáček of HP.",
];

export const VICTORY = [
  "{w} TAKES IT. Nepřišel(a) sem dělat přátele.",
  "{w} WINS. Encyclopædia entry updated.",
  "Game over. {w} requires praise. Loud.",
  "WINNER: {w}. Banned in 3 regions for excellence.",
  "{w} dropped the mic. Crowd is HOWLING.",
];

export const FILLER = [
  "Backstage commentary: tohle bude bolet.",
  "Audience is on the edge of their crocs.",
  "Quick reminder: this is all real. Trust the encyclopedia.",
  "Studio guests are crying. Not sad. Just art.",
];

export function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
