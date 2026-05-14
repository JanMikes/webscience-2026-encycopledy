import { create } from "zustand";
import type { BattleEvent, Pokemon, Scene } from "../data/types";
import { simulateBattle } from "../lib/battleEngine";

type Selected = [Pokemon | null, Pokemon | null];

type State = {
  scene: Scene;
  roster: Pokemon[];
  loading: boolean;
  selected: Selected;
  battleLog: BattleEvent[];
  winner: Pokemon | null;
  muted: boolean;
  scanlines: boolean;
  shake: boolean;
};

type Actions = {
  setRoster: (r: Pokemon[]) => void;
  toggleSelect: (p: Pokemon) => void;
  resetSelection: () => void;
  goVs: () => void;
  goBattle: () => void;
  setWinner: (p: Pokemon | null) => void;
  goResult: () => void;
  goPokedex: () => void;
  setMuted: (m: boolean) => void;
  toggleScanlines: () => void;
  pulseShake: () => void;
};

export const useGameStore = create<State & Actions>((set, get) => ({
  scene: "pokedex",
  roster: [],
  loading: true,
  selected: [null, null],
  battleLog: [],
  winner: null,
  muted: true,
  scanlines: true,
  shake: false,

  setRoster: (r) => set({ roster: r, loading: false }),

  toggleSelect: (p) => {
    const [a, b] = get().selected;
    if (a?.id === p.id) return set({ selected: [b, null] });
    if (b?.id === p.id) return set({ selected: [a, null] });
    if (!a) return set({ selected: [p, b] });
    if (!b) return set({ selected: [a, p] });
    // both filled — replace slot 1
    return set({ selected: [p, b] });
  },

  resetSelection: () => set({ selected: [null, null] }),

  goVs: () => {
    const [a, b] = get().selected;
    if (!a || !b) return;
    set({ scene: "vs" });
  },

  goBattle: () => {
    const [a, b] = get().selected;
    if (!a || !b) return;
    const log = simulateBattle(a, b);
    set({ battleLog: log, scene: "battle", winner: null });
  },

  setWinner: (p) => set({ winner: p }),

  goResult: () => set({ scene: "result" }),

  goPokedex: () =>
    set({ scene: "pokedex", selected: [null, null], battleLog: [], winner: null }),

  setMuted: (m) => set({ muted: m }),
  toggleScanlines: () => set({ scanlines: !get().scanlines }),
  pulseShake: () => {
    set({ shake: true });
    setTimeout(() => set({ shake: false }), 380);
  },
}));
