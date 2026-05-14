import { useGameStore } from "../store/useGameStore";

const cache = new Map<string, HTMLAudioElement>();

function get(url: string): HTMLAudioElement | null {
  if (!url) return null;
  let a = cache.get(url);
  if (!a) {
    a = new Audio(url);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    cache.set(url, a);
  }
  return a;
}

export function playCry(url: string, volume = 0.4) {
  if (useGameStore.getState().muted) return;
  const a = get(url);
  if (!a) return;
  try {
    a.currentTime = 0;
    a.volume = volume;
    void a.play();
  } catch {
    // autoplay blocked - silently ignore
  }
}
