# PokéBattle Encyclopedia — Implementation Plan

**Context:** Vibe-coding demo for AI Battle stage. ~5 min demo. Audience entertainment > correctness. Must be visually loud, animated, and "WOW" on first frame.

**Concept:** A funky/punk Pokémon Encyclopedia where audience picks 2 Pokémon, watches them battle in a 3D arena with stats-driven mechanics and AI-generated trash talk.

---

## ⭐ FINAL DECISIONS (today's demo — overrides anything below)

| Decision | Locked answer |
|---|---|
| **Presenting** | Today. ~2 hr build. Phases 1-5 only, no stretch. |
| **Screen** | 16:9 / 1920×1080. Design HUD with safe margins. |
| **Assets** | **HD-2D approach.** No GLBs. Animated Showdown sprites + official-artwork PNGs on planes in a real 3D arena. Zero manual asset prep. Works for any Pokémon. |
| **Interactivity** | Auto-battle. Plus a 3-sec "WHO WINS?" audience shout screen before FIGHT. |
| **Language** | Mixed Czech + English punk-meme style. UI bilingual, stamps stay English ("SUPER EFFECTIVE!"). |
| **Names** | Real Pokémon names. No disclaimer. |
| **Audio** | **Deferred** — pass 2 after we have a working build. Build it muted-by-default-ready. |
| **Roster** | Pikachu, Charizard, Bulbasaur, Squirtle, Snorlax, Mewtwo, Gengar, Gyarados, Dragonite, Eevee |

### Asset URLs (no auth, no manual download)
- **Animated battle sprite:** `https://play.pokemonshowdown.com/sprites/ani/{name-lowercase}.gif`
- **Static hi-res 3D render:** `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- **Stats + cries:** `https://pokeapi.co/api/v2/pokemon/{id}`

### Composition technique ("looks 3D, isn't")
- R3F `<Canvas>` renders the ARENA only: platform, fog, point lights, particle bursts, bloom, slow orbiting camera
- HTML `<img>` sprites are positioned via CSS over the canvas — they bob, dash, get knocked back via Framer Motion
- Result: feels like Octopath Traveler / HD-2D fighting games. Audience reads it as 3D.
- For Pokédex cards: official-artwork PNG with floating CSS animation, no per-card Canvas needed (cheap and fast).

---

## 0. Decisions locked in

| Decision | Choice | Why |
|---|---|---|
| Framework | Vite + React 19 + TS (already scaffolded) | Fast HMR, modern |
| 3D | `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` | Best-in-class R3F stack |
| Animations | Framer Motion (UI) + GSAP (timeline-based battle FX) | FM for components, GSAP for choreography |
| Styling | Tailwind CSS v4 | Speed, no config |
| State | Zustand | Minimal, no boilerplate |
| Data | PokéAPI (`pokeapi.co/api/v2`) | Free, no auth, stats + types + sprites + cries |
| 3D Models | **Curated local GLBs in `/public/models/`** (see §3) | Fastest, no CDN flakiness |
| AI | **Stubbed pool of pre-written trash talk** (real Claude API as stretch goal) | User explicitly approved this |
| Sound | Native `<audio>` + Howler | Cry audio from PokéAPI |
| Battle mode | Auto-battle (turn-based), driven by stats | No combat skill needed mid-demo |

---

## 1. The 3D Model Problem & Solution

### What we tried
- `Pokemon-3D-api/assets` repo → jsDelivr blocks (repo too large, 403)
- `06wj/pokemon` repo → loads but uses non-standard `ALI_amc_mesh_compression` (won't open in vanilla GLTFLoader)
- Original PokéAPI → only 2D renders, no 3D meshes

### Solution: Curated local roster (8–12 Pokémon)
Demo only needs a handful. We hand-pick the most iconic + visually distinct ones, store GLBs in `/public/models/`, load via `useGLTF()` from drei.

**Roster (suggested, all iconic + recognizable to non-gamers):**
| # | Name | Type | Vibe |
|---|---|---|---|
| 025 | Pikachu | Electric | Mascot — must have |
| 006 | Charizard | Fire/Flying | Crowd favorite, intimidating |
| 001 | Bulbasaur | Grass/Poison | Underdog |
| 007 | Squirtle | Water | Cute |
| 143 | Snorlax | Normal | Funny silhouette |
| 150 | Mewtwo | Psychic | Cinematic villain |
| 094 | Gengar | Ghost/Poison | Spooky |
| 130 | Gyarados | Water/Flying | Dramatic |
| 149 | Dragonite | Dragon/Flying | Wholesome |
| 133 | Eevee | Normal | Cute |

**Model sources (Phase 0, manual, before coding):**
- Sketchfab "Downloadable + CC" filter for each Pokémon name → download as GLB
- Fallback per slot: a stylized low-poly version if licensed one is missing
- Each GLB target: <500 KB, ~5-10k triangles
- Filename: `public/models/pikachu.glb`, etc. (lowercase, no IDs in filename)

**Asset prep checklist (do once, before coding battle):**
1. Download 10 GLBs
2. Run through `gltfpack` or `gltf-transform` for Draco compression if >1 MB
3. Verify each loads in https://gltf-viewer.donmccurdy.com/
4. Confirm models face +Z and stand on Y=0 origin

### Fallback if running short on time
If GLB sourcing eats too much time: use **PokéAPI's `official-artwork` PNGs on 3D billboards** (planes that always face camera) inside a real 3D arena. Still feels 3D because the environment + particles + camera moves are 3D.

---

## 2. Visual Design Direction

### Aesthetic: "Punk Encyclopedia × Anime Battle"
- **Background** — dark navy/black with neon grid (synthwave-ish)
- **Typography** — chunky display font (e.g. `Bungee`, `Press Start 2P` for pixel HUD, `Cabinet Grotesk` for body)
- **Colors** — Pokémon type colors as accents:
  - Fire `#F08030` · Water `#6890F0` · Grass `#78C850` · Electric `#F8D030`
  - Psychic `#F85888` · Ghost `#705898` · Dragon `#7038F8` · Normal `#A8A878`
- **Effects** —
  - Bloom postprocessing (intense on hits)
  - Chromatic aberration on crits
  - Film grain overlay (subtle)
  - CRT scanlines toggle (audience meme button)
  - Animated SVG noise/static between scene transitions

### Punk details (the bits that win the crowd)
- "ENCYCLOPÆDIA" wordmark with safety-pin underline
- Stamps: "VERIFIED BY 47 SCHOLARS", "BANNED IN 3 REGIONS", "100% REAL FACTS"
- Cut-and-paste zine ribbon banners
- Damage numbers in jagged speech-bubble shapes
- Type advantages shown as flying emoji (`🔥` flying off when fire hits grass)

---

## 3. Information Architecture

```
App
├── /                    → PokédexScreen (grid of 3D cards)
├── /vs                  → VsIntroScreen (after 2 selected)
└── /battle              → BattleArenaScreen (3D fight + commentator)
```

Routing: simple Zustand-driven scene state, no react-router needed.

```ts
type Scene = "pokedex" | "vs" | "battle" | "result";
```

### Zustand store (`useGameStore`)
```ts
{
  scene: Scene;
  roster: Pokemon[];                  // loaded once on mount
  selected: [Pokemon | null, Pokemon | null];
  battle: {
    turn: 0 | 1;
    hp: [number, number];
    log: BattleEvent[];               // for commentator
    winner: Pokemon | null;
  };
  // actions
  selectPokemon(p): void;
  startBattle(): void;
  resetSelection(): void;
}
```

---

## 4. File Structure

```
src/
├── main.tsx
├── App.tsx                          // Scene switcher (one of 4)
├── store/
│   └── useGameStore.ts              // Zustand
├── data/
│   ├── pokeapi.ts                   // fetch wrapper (cached)
│   ├── roster.ts                    // curated 10 Pokémon IDs + local model paths
│   ├── trashTalk.ts                 // pool of pre-written lines (200+)
│   └── types.ts                     // Pokemon, BattleEvent, etc.
├── lib/
│   ├── battleEngine.ts              // stat-driven turn resolver
│   ├── typeChart.ts                 // 18×18 effectiveness matrix
│   └── audio.ts                     // cry player + SFX
├── screens/
│   ├── PokedexScreen.tsx
│   ├── VsIntroScreen.tsx
│   ├── BattleArenaScreen.tsx
│   └── ResultScreen.tsx
├── components/
│   ├── PokemonCard.tsx              // 3D rotating model + stats radar
│   ├── PokemonModel.tsx             // <Suspense> + <useGLTF>
│   ├── StatsRadar.tsx               // SVG hexagon (HP/Atk/Def/SpA/SpD/Spe)
│   ├── HPBar.tsx                    // Framer-animated gradient bar
│   ├── DamageNumber.tsx             // jagged speech bubble
│   ├── BattleArena3D.tsx            // R3F <Canvas> root for battle
│   ├── BattleArenaStage.tsx         // platform + lights + bloom
│   ├── BattleParticles.tsx          // type-colored particle bursts
│   ├── Commentator.tsx              // typewriter trash talk feed
│   ├── ScanlinesOverlay.tsx
│   └── CRTFrame.tsx
└── styles/
    └── index.css                    // Tailwind + custom CSS
```

---

## 5. Component Specs

### `PokedexScreen` — entry point, must wow on first frame
**Layout:**
- Top: massive "ENCYCLOPÆDIA POKÉMONICA" wordmark, animated underline draw
- Subtext: "Pick 2. Watch them fight. Believe nothing."
- Grid: 5×2 cards, 10 Pokémon
- Bottom: sticky "READY" footer that pulses when 2 selected
- Background: animated grid floor + slow zoom

**Interaction:**
- Hover card → tilts 3D + plays cry (low volume)
- Click → glow ring + slot in footer (slot 1 or 2)
- Click again → deselect
- 2 selected → "READY" button pulses; click → VS intro

### `PokemonCard` — 3D rotating model card
**Structure:**
```
┌─────────────────────────┐
│  [Type Pill][Type Pill] │  ← e.g. Fire/Flying
│                         │
│    [3D MODEL ROTATING]  │  ← R3F mini canvas
│                         │
│  CHARIZARD              │  ← name in display font
│  #006                   │
│  ─── stat radar ───     │  ← SVG hexagon
└─────────────────────────┘
```
- Card tilts on mousemove (Framer `useTransform` from mouse pos)
- 3D model: own `<Canvas>` (cheap), single light + auto-rotate
- Selected state: border becomes glowing gradient + corner stamp "PICKED"

### `VsIntroScreen` — anime split screen (2-3s, skippable)
**Choreography (GSAP timeline):**
- t=0: black screen
- t=0.1: left half slides in with Pokémon 1 silhouette + name (red palette)
- t=0.4: right half slides in (blue palette)
- t=0.7: "VS" text crashes in center with shockwave, screen shakes
- t=1.0: chromatic aberration flash
- t=1.5: zoom into VS → cross-dissolve to arena
- Audio: dramatic sting + both cries layered

### `BattleArenaScreen` — the main event
**Layout:**
```
┌──────────────────────────────────────────┐
│ [HP Bar P1]   ROUND 1   [HP Bar P2]      │
│                                          │
│         ┌──── 3D CANVAS ────┐            │
│         │                   │            │
│         │   pokemon1   p2   │            │
│         │   ●●●         ●●● │            │
│         │   ▼  platform  ▼  │            │
│         └───────────────────┘            │
│                                          │
│ ┌─ Commentator sidebar ──────────────┐   │
│ │ > "Pikachu charges electricity!"   │   │
│ │ > "Charizard scoffs..."            │   │
│ │ > [streaming…]                     │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### `BattleArena3D` — R3F scene
**Scene graph:**
- `<Canvas shadows>` with `[camera position={[0, 4, 10]}]`
- `<color attach="background" args={["#0a0a14"]} />`
- `<fog />` for depth
- Hemispherical + directional lights with shadow maps
- Floor: `<Plane>` with subtle grid shader (the synthwave grid)
- Two glowing platforms (cylinders with emissive material), one per side
- Two Pokémon models on platforms, slight idle bob (`useFrame` sin wave)
- `<EffectComposer>` with `<Bloom>` + `<ChromaticAberration>` (intensity tied to crit state)
- `<OrbitControls>` disabled for demo, but camera does slow cinematic orbit on `useFrame`

**Attack animation choreography:**
1. Attacker bob → forward dash (0.3s GSAP tween of model position)
2. Burst particle system at defender pos (color = move type)
3. Defender model gets pushed back + tints red
4. Screen shake (CSS transform on parent div + camera shake on R3F camera)
5. Damage number floats up
6. HP bar drains with spring physics
7. Type-effective stamp slides in if super effective ("SUPER EFFECTIVE!" with screen-wide impact)

### `Commentator` — fake AI trash talk feed
**Behaviour:**
- Lines stream in with typewriter effect (one char per ~20ms)
- Pool of templates with placeholders: `"{attacker} just yawned. {defender} looks deeply embarrassed."`
- Selected by:
  - Pokémon types (taunts based on type matchup)
  - Battle state (low HP, crit, miss)
  - Random for filler turns
- Real Claude API path (stretch): same component, just swap source

---

## 6. Battle Engine (Stub, Not Real Pokémon Mechanics)

`battleEngine.ts` exports `simulateBattle(p1, p2): Turn[]`

**Damage formula (simplified):**
```
base = (attacker.attack / defender.defense) * 20
typeMultiplier = typeChart[moveType][defenderType]  // 0, 0.5, 1, 2
crit = random() < 0.1 ? 1.5 : 1
damage = round(base * typeMultiplier * crit * (0.85 + random() * 0.15))
```

**Turn order:** higher Speed goes first; ties broken randomly.

**Move pool per Pokémon:** 2 moves, one of each type the Pokémon is. We pick a flavor name from a curated list (`"Thunderbolt"`, `"Flamethrower"`, etc.) for narration.

**Output:** array of `Turn` objects the renderer chews through one-by-one with delays:
```ts
type Turn = {
  attacker: 0 | 1;
  move: string;
  damage: number;
  effectiveness: "normal" | "super" | "weak" | "immune";
  crit: boolean;
  hpAfter: [number, number];
};
```

---

## 7. PokéAPI Usage

**Endpoints we hit (once per Pokémon on app load, cached):**
- `GET pokeapi.co/api/v2/pokemon/{id}` → stats, types, cries, sprites

**Data we extract:**
```ts
{
  id, name,
  types: ["fire", "flying"],
  stats: { hp, attack, defense, specialAttack, specialDefense, speed },
  cryUrl: cries.latest,
  artworkUrl: sprites.other["official-artwork"].front_default,
  showdownUrl: sprites.other.showdown.front_default,  // animated GIF fallback
}
```

**Caching:** localStorage with key `poke:{id}:v1`, 7-day TTL. Eliminates loading flash on subsequent runs.

---

## 8. Trash Talk Pool (the fake AI)

`data/trashTalk.ts` exports 200+ lines categorized:
```ts
{
  preBattle: string[],                   // 30 lines, both names plugged in
  attack: { [type]: string[] },          // 30 per type, 18 types = ~540 but we'll start with 8
  crit: string[],
  miss: string[],
  lowHp: string[],
  victory: string[],
  taunt: { [typeAdvantage]: string[] },  // strong/weak/neutral
}
```

**Examples (mixed punk/absurd/Czech-friendly):**
- preBattle: `"{p1} enters the ring smelling vaguely of regret."`
- crit: `"OUCH. {defender}'s ancestors felt that one."`
- victory: `"{winner} did not come here to make friends."`
- type-fire-vs-grass: `"{defender} is now a side dish."`

These are read by `Commentator` and surfaced with the typewriter effect. Looks like AI; isn't.

**Real Claude API path (stretch):** keep `Commentator` agnostic — feeds from an async iterable. Plug `streamFromClaude()` later if there's time + key. Prompt:
> You are a snarky punk-rock sports commentator narrating a Pokémon battle. Generate a single short sarcastic line about: {event}. Max 80 chars. No emojis.

---

## 9. Implementation Phases (Build Order)

The order is optimised so **every phase ends with something showable** — important for vibe-coding flow.

### Phase 0 — Asset prep (manual, do FIRST, ~20 min)
- [ ] Download 10 Pokémon GLBs from Sketchfab
- [ ] Verify they load + are under 1MB each
- [ ] Save to `public/models/{name}.glb`

### Phase 1 — Foundation (~15 min)
- [ ] `npm install` Vite scaffold
- [ ] Add deps: `tailwindcss@next @tailwindcss/vite three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion gsap zustand howler clsx`
- [ ] Wire Tailwind v4 via Vite plugin
- [ ] Replace `src/App.tsx` with scene switcher
- [ ] Add custom font (Bungee + Press Start 2P from Google Fonts)
- [ ] Black bg + wordmark renders → **screenshot moment**

### Phase 2 — Pokédex screen with 3D cards (~30 min)
- [ ] `data/roster.ts` with 10 hardcoded entries
- [ ] `data/pokeapi.ts` — fetch + localStorage cache
- [ ] `components/PokemonModel.tsx` — R3F `<useGLTF>` with auto-rotate
- [ ] `components/PokemonCard.tsx` — 3D mini canvas + name + types + radar
- [ ] `screens/PokedexScreen.tsx` — grid layout, selection state
- [ ] Footer "READY" button → triggers VS scene
- [ ] **End state:** clickable grid of rotating 3D Pokémon. Looks already cool.

### Phase 3 — VS intro (~20 min)
- [ ] `screens/VsIntroScreen.tsx` with GSAP timeline
- [ ] Layered cries on intro
- [ ] Auto-advance to battle after 2.5s
- [ ] **End state:** hyped 2-second cinematic between selection and battle.

### Phase 4 — 3D Arena (~40 min)
- [ ] `BattleArena3D.tsx` — Canvas, lighting, platforms, fog
- [ ] Load both Pokémon, place on platforms
- [ ] Idle bob animation
- [ ] EffectComposer + Bloom
- [ ] Slow cinematic camera orbit
- [ ] **End state:** two Pokémon facing off in glowing arena. Already a winning frame.

### Phase 5 — Battle logic + animations (~45 min)
- [ ] `lib/battleEngine.ts` — full simulation
- [ ] `HPBar.tsx` with spring animation
- [ ] Attack animation: GSAP timeline of dash + particle burst + screen shake + damage number
- [ ] Type-effective stamp overlay
- [ ] Battle turns drive Commentator log
- [ ] **End state:** fully working battle from start to finish.

### Phase 6 — Commentator + polish (~25 min)
- [ ] `data/trashTalk.ts` filled with ~50 starter lines
- [ ] `Commentator.tsx` with typewriter streaming
- [ ] Sidebar styling: terminal-monospace, green-on-black, occasional `>` glitches
- [ ] **End state:** narrator that sounds AI-driven.

### Phase 7 — Result screen + extras (~20 min)
- [ ] `ResultScreen.tsx` — winner photo, confetti, "PLAY AGAIN"
- [ ] Loop back to Pokédex
- [ ] CRT scanlines toggle button (top-right meme button)
- [ ] Type effectiveness emoji rain on super effective
- [ ] **End state:** complete loop, demo-ready.

### Phase 8 — STRETCH (only if time)
- [ ] Real Claude API integration in Commentator
- [ ] Background chiptune
- [ ] More Pokémon in roster
- [ ] Audience-controllable button to swap Pokémon mid-fight

**Total est: ~3.5 hrs first pass, demo-ready in ~2 hrs (skip phases 7-8 if needed)**

---

## 10. "Speedrun the build" cheat sheet for next session

When implementation starts, fire these in order. No re-thinking needed.

```bash
# 1. Install everything in one shot
npm install
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing \
            framer-motion gsap zustand howler clsx
npm install -D tailwindcss @tailwindcss/vite

# 2. Drop GLBs into public/models/ (manual)

# 3. Start dev server
npm run dev
```

Then bring up this PLAN.md and execute Phase 1 → 7 in order. Each phase has a clear end-state, so we always know when to move on.

---

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| GLB models hard to source | Fallback to PokéAPI billboards (still 3D-ish) |
| 3D models slow to load | Preload all 10 on app mount with `<Suspense>` |
| Audience can't see UI from back of room | Ship a `Cmd+=` zoom hint, large fonts everywhere |
| Cries copyright | They're from PokéAPI which is public. We're fine. |
| Live demo network fail | Use localStorage cache + bundle 1 fallback Pokémon |
| Time overrun | Phase 5 onwards are independently shippable — cut earliest |

---

## 12. What "done" looks like

Audience sees:
1. (0s) Wordmark "ENCYCLOPÆDIA POKÉMONICA" with safety-pin underline
2. (3s) Grid of 10 spinning 3D Pokémon, they pick 2
3. (15s) Anime VS intro, screen shakes, cries layered
4. (17s) 3D arena, both Pokémon facing off, glowing platforms, bloom
5. (20–60s) Auto-battle plays out: dashing attacks, particle bursts, screen shake on crits, "SUPER EFFECTIVE!" stamps, sarcastic narrator typing trash talk
6. (60s) Winner screen with confetti, audience cheers, "PLAY AGAIN" loops back

**Win condition:** at least one moment where someone in the crowd says "oh damn" out loud.
