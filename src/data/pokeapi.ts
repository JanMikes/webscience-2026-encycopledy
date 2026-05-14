import type { Pokemon, Stats, TypeName } from "./types";
import { ROSTER, type RosterEntry } from "./roster";

const CACHE_VERSION = "v1";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Cached = { ts: number; data: Pokemon };

function readCache(id: number): Pokemon | null {
  try {
    const raw = localStorage.getItem(`poke:${id}:${CACHE_VERSION}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as Cached;
    if (Date.now() - ts > TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(id: number, data: Pokemon) {
  try {
    localStorage.setItem(`poke:${id}:${CACHE_VERSION}`, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // localStorage full or disabled - silently ignore
  }
}

function statsFrom(api: any): Stats {
  const get = (key: string) =>
    api.stats.find((s: any) => s.stat.name === key)?.base_stat ?? 50;
  return {
    hp: get("hp"),
    attack: get("attack"),
    defense: get("defense"),
    specialAttack: get("special-attack"),
    specialDefense: get("special-defense"),
    speed: get("speed"),
  };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function fetchOne(entry: RosterEntry): Promise<Pokemon> {
  const cached = readCache(entry.id);
  if (cached) return cached;

  const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${entry.id}`);
  if (!r.ok) throw new Error(`PokéAPI ${entry.id} failed`);
  const api = await r.json();

  const types: TypeName[] = api.types
    .sort((a: any, b: any) => a.slot - b.slot)
    .map((t: any) => t.type.name as TypeName);

  const pkm: Pokemon = {
    id: entry.id,
    name: entry.name,
    slug: entry.slug,
    types,
    stats: statsFrom(api),
    cryUrl: api.cries?.latest ?? api.cries?.legacy ?? "",
    artworkUrl: api.sprites?.other?.["official-artwork"]?.front_default ??
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`,
    showdownUrl: api.sprites?.other?.showdown?.front_default ??
                 `https://play.pokemonshowdown.com/sprites/ani/${entry.slug}.gif`,
  };
  writeCache(entry.id, pkm);
  void cap; // not used; kept for future
  return pkm;
}

export async function loadRoster(): Promise<Pokemon[]> {
  return Promise.all(ROSTER.map(fetchOne));
}
