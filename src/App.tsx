import { useEffect } from "react";
import { useGameStore } from "./store/useGameStore";
import { loadRoster } from "./data/pokeapi";
import PokedexScreen from "./screens/PokedexScreen";
import VsIntroScreen from "./screens/VsIntroScreen";
import BattleArenaScreen from "./screens/BattleArenaScreen";
import ResultScreen from "./screens/ResultScreen";
import ScanlinesOverlay from "./components/ScanlinesOverlay";
import { resumeAudio } from "./lib/sfx";

export default function App() {
  const scene = useGameStore((s) => s.scene);
  const setRoster = useGameStore((s) => s.setRoster);
  const loading = useGameStore((s) => s.loading);
  const muted = useGameStore((s) => s.muted);
  const setMuted = useGameStore((s) => s.setMuted);
  const scanlines = useGameStore((s) => s.scanlines);
  const toggleScan = useGameStore((s) => s.toggleScanlines);

  useEffect(() => {
    loadRoster().then(setRoster).catch((e) => {
      console.error("roster load failed", e);
      setRoster([]);
    });
  }, [setRoster]);

  return (
    <div className="relative w-screen h-screen bg-ink overflow-hidden">
      {loading && <BootSplash />}
      {!loading && scene === "pokedex" && <PokedexScreen />}
      {!loading && scene === "vs" && <VsIntroScreen />}
      {!loading && scene === "battle" && <BattleArenaScreen />}
      {!loading && scene === "result" && <ResultScreen />}

      {scanlines && <ScanlinesOverlay />}
      <div className="bg-noise" />

      <div className="fixed top-4 right-4 z-[60] flex gap-2 pixel text-[10px]">
        <button
          onClick={() => { resumeAudio(); setMuted(!muted); }}
          className="px-3 py-2 bg-black/60 border border-acid/60 text-acid hover:bg-acid hover:text-ink transition"
        >
          {muted ? "MUTED" : "SOUND ON"}
        </button>
        <button
          onClick={toggleScan}
          className="px-3 py-2 bg-black/60 border border-neon/60 text-neon hover:bg-neon hover:text-ink transition"
        >
          {scanlines ? "CRT ON" : "CRT OFF"}
        </button>
      </div>
    </div>
  );
}

function BootSplash() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-grid">
      <div className="text-center">
        <h1 className="wordmark text-7xl">ENCYCLOPÆDIA</h1>
        <h2 className="wordmark text-5xl mt-2">POKÉMONICA</h2>
        <p className="pixel text-acid text-xs mt-8 animate-pulse">LOADING THE FORBIDDEN FACTS…</p>
      </div>
    </div>
  );
}
