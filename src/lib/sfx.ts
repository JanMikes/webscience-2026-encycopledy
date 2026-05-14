import { useGameStore } from "../store/useGameStore";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bgmBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let bgmHandle: number | null = null;
let bgmRunning = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  ctx = new C();
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 1.0;
  sfxBus.connect(master);
  bgmBus = ctx.createGain();
  bgmBus.gain.value = 0.32;
  bgmBus.connect(master);
  return ctx;
}

function muted() {
  return useGameStore.getState().muted;
}

export async function resumeAudio() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    try { await c.resume(); } catch { /* ignore */ }
  }
}

// ---------- SFX ----------

export function sfxHit() {
  const c = getCtx(); if (!c || muted()) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = "square";
  f.type = "lowpass";
  f.frequency.value = 900;
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.16);
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(f); f.connect(g); g.connect(sfxBus!);
  o.start(t); o.stop(t + 0.24);
  // tiny noise smack on top
  noiseBurst(0.08, 0.3, 2500, 600, sfxBus!);
}

export function sfxCrit() {
  const c = getCtx(); if (!c || muted()) return;
  const t = c.currentTime;
  for (let i = 0; i < 2; i++) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(820 + i * 9, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.32);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
    o.connect(g); g.connect(sfxBus!);
    o.start(t); o.stop(t + 0.4);
  }
  blip(2400, 0.06, 0.18, 0.04);
  setTimeout(() => blip(3200, 0.06, 0.18, 0.04), 60);
}

export function sfxSuper() {
  const c = getCtx(); if (!c || muted()) return;
  const t = c.currentTime;
  // sub boom
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(32, t + 0.45);
  g.gain.setValueAtTime(0.7, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  o.connect(g); g.connect(sfxBus!);
  o.start(t); o.stop(t + 0.6);
  // explosion noise
  noiseBurst(0.28, 0.45, 1800, 200, sfxBus!);
  // sparkle
  [1800, 2200, 2800].forEach((f, i) => setTimeout(() => blip(f, 0.05, 0.12, 0.05), 60 + i * 30));
}

export function sfxMiss() {
  const c = getCtx(); if (!c || muted()) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(950, t);
  o.frequency.exponentialRampToValueAtTime(210, t + 0.3);
  g.gain.setValueAtTime(0.16, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
  o.connect(g); g.connect(sfxBus!);
  o.start(t); o.stop(t + 0.34);
}

export function sfxSwoosh() {
  noiseBurst(0.18, 0.16, 2200, 400, sfxBus!);
}

export function sfxKO() {
  const c = getCtx(); if (!c || muted()) return;
  // descending power chord
  [440, 330, 220, 110].forEach((f, i) => {
    setTimeout(() => {
      if (!c || muted()) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "square";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.28, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o.connect(g); g.connect(sfxBus!);
      o.start(t); o.stop(t + 0.6);
    }, i * 90);
  });
  // big boom under it
  setTimeout(() => sfxSuper(), 80);
}

function blip(freq: number, dur: number, vol = 0.15, decay = 0.04) {
  const c = getCtx(); if (!c || muted()) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "square";
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur + decay);
  o.connect(g); g.connect(sfxBus!);
  o.start(t); o.stop(t + dur + decay + 0.01);
}

function noiseBurst(dur: number, vol: number, fStart: number, fEnd: number, bus: GainNode) {
  const c = getCtx(); if (!c) return;
  const t = c.currentTime;
  const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.value = vol;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(fStart, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(80, fEnd), t + dur);
  src.connect(f); f.connect(g); g.connect(bus);
  src.start(t);
  src.stop(t + dur + 0.02);
}

// ---------- BGM (punk chiptune loop) ----------

export function startBGM() {
  const c = getCtx(); if (!c) return;
  if (bgmRunning) return;
  bgmRunning = true;

  const bpm = 142;
  const stepDur = (60 / bpm) / 4; // 16th note in seconds
  let step = 0;

  // Bass riff over 16 steps (A minor punk-ish)
  const bass = [
    55,    0,   55,   0,    82.4, 0,   55,   0,
    49,    0,   49,   0,    73.4, 0,   49,   0,
  ];
  // Lead arp on offbeats
  const lead = [
    0,     0,   0,    220,  0,    0,   261.6,0,
    0,     0,   0,    196,  0,    0,   246.9,0,
  ];

  const tick = () => {
    if (!bgmRunning) return;
    if (!muted()) {
      const i = step % 16;
      if (bass[i] > 0) bassNote(bass[i]);
      if (lead[i] > 0) leadNote(lead[i]);
      if (i % 4 === 0) kick();
      if (i === 4 || i === 12) snare();
      if (i % 2 === 0) hat();
    }
    step++;
    bgmHandle = window.setTimeout(tick, stepDur * 1000);
  };
  tick();
}

export function stopBGM() {
  bgmRunning = false;
  if (bgmHandle !== null) {
    clearTimeout(bgmHandle);
    bgmHandle = null;
  }
}

function bassNote(freq: number) {
  const c = getCtx(); if (!c || !bgmBus) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = "sawtooth";
  o.frequency.value = freq;
  f.type = "lowpass";
  f.frequency.value = 900;
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(f); f.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + 0.22);
}

function leadNote(freq: number) {
  const c = getCtx(); if (!c || !bgmBus) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "square";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.07, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + 0.14);
}

function kick() {
  const c = getCtx(); if (!c || !bgmBus) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(32, t + 0.12);
  g.gain.setValueAtTime(0.55, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + 0.16);
}

function snare() {
  if (!bgmBus) return;
  noiseBurst(0.12, 0.28, 2400, 1200, bgmBus);
}

function hat() {
  if (!bgmBus) return;
  noiseBurst(0.04, 0.05, 9000, 6000, bgmBus);
}
