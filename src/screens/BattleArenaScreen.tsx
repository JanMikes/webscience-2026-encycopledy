import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import BattleArena3D from "../components/BattleArena3D";
import HPBar from "../components/HPBar";
import DamageNumber from "../components/DamageNumber";
import EffectStamp from "../components/EffectStamp";
import ParticleBurst from "../components/ParticleBurst";
import Commentator from "../components/Commentator";
import { maxHpOf } from "../lib/battleEngine";
import {
  ATTACK_IMMUNE, ATTACK_NEUTRAL, ATTACK_SUPER, ATTACK_WEAK,
  CRIT, FILLER, LOW_HP, MISS, PRE_BATTLE, VICTORY, fill, pick,
} from "../data/trashTalk";
import type { BattleEvent, Pokemon, TypeName } from "../data/types";
import { playCry } from "../lib/audio";
import { sfxCrit, sfxHit, sfxKO, sfxMiss, sfxSuper, sfxSwoosh, startBGM, stopBGM } from "../lib/sfx";

type CommentLine = { id: number; text: string };
type Burst = { id: number; side: "left" | "right"; type: TypeName };
type DmgPop = { id: number; value: number; crit: boolean; side: "left" | "right" };

export default function BattleArenaScreen() {
  const [p1, p2] = useGameStore((s) => s.selected) as [Pokemon, Pokemon];
  const log = useGameStore((s) => s.battleLog);
  const setWinner = useGameStore((s) => s.setWinner);
  const goResult = useGameStore((s) => s.goResult);
  const goPokedex = useGameStore((s) => s.goPokedex);

  const [hp, setHp] = useState<[number, number]>([maxHpOf(p1), maxHpOf(p2)]);
  const [round, setRound] = useState(1);
  const [stamp, setStamp] = useState<{ text: string; tone: "super" | "weak" | "immune" | "miss" | "crit"; id: number } | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [pops, setPops] = useState<DmgPop[]>([]);
  const [comments, setComments] = useState<CommentLine[]>([]);
  const [attackerOffset, setAttackerOffset] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [defenderHit, setDefenderHit] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [defenderShake, setDefenderShake] = useState<{ p1: boolean; p2: boolean }>({ p1: false, p2: false });
  const [arenaShake, setArenaShake] = useState(false);
  const [critPulse, setCritPulse] = useState(0);
  const [loserSide, setLoserSide] = useState<"left" | "right" | null>(null);
  const [whiteFlash, setWhiteFlash] = useState(false);
  const [koStamp, setKoStamp] = useState(false);
  const [slowMo, setSlowMo] = useState(false);

  const idCounter = useRef(0);
  const nextId = () => ++idCounter.current;

  const pushComment = (text: string) => {
    setComments((cs) => [...cs, { id: nextId(), text }]);
  };
  const pushBurst = (side: "left" | "right", type: TypeName) => {
    const id = nextId();
    setBursts((b) => [...b, { id, side, type }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 700);
  };
  const pushPop = (side: "left" | "right", value: number, crit: boolean) => {
    const id = nextId();
    setPops((p) => [...p, { id, value, crit, side }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1000);
  };

  // BGM
  useEffect(() => {
    startBGM();
    return () => stopBGM();
  }, []);

  // Drive the battle playback timeline
  useEffect(() => {
    if (!log.length) return;

    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      // pre-battle hype
      pushComment(fill(pick(PRE_BATTLE), { a: p1.name, d: p2.name }));
      playCry(p1.cryUrl, 0.45);
      await sleep(700);
      playCry(p2.cryUrl, 0.45);
      await sleep(700);
      pushComment(fill(pick(FILLER), { a: p1.name, d: p2.name }));
      await sleep(600);

      let turnCount = 0;
      for (const event of log) {
        if (cancelled) return;
        await runEvent(event, () => turnCount++, () => turnCount);
        await sleep(900);
      }

      // result transition
      await sleep(800);
      const finalEvent = [...log].reverse().find((e) => e.kind === "ko") as Extract<BattleEvent, { kind: "ko" }> | undefined;
      const winnerIdx = finalEvent?.winner ?? (hp[0] > hp[1] ? 0 : 1);
      const winnerP = winnerIdx === 0 ? p1 : p2;
      setWinner(winnerP);
      goResult();
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);

  async function runEvent(
    e: BattleEvent,
    bumpTurn: () => void,
    _getTurn: () => number,
  ) {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    if (e.kind === "start") return;

    if (e.kind === "miss") {
      const A = e.attacker === 0 ? p1 : p2;
      const D = e.attacker === 0 ? p2 : p1;
      const sideA = e.attacker === 0 ? "left" : "right";
      sfxSwoosh();
      // tiny lunge
      setAttackerOffset((o) => ({ ...o, [`p${e.attacker + 1}`]: sideA === "left" ? 30 : -30 }));
      await sleep(140);
      sfxMiss();
      setAttackerOffset((o) => ({ ...o, [`p${e.attacker + 1}`]: 0 }));
      const stampId = nextId();
      setStamp({ text: "MISS!", tone: "miss", id: stampId });
      setTimeout(() => setStamp((s) => (s?.id === stampId ? null : s)), 700);
      pushComment(fill(pick(MISS), { a: A.name, d: D.name, move: e.move }));
      return;
    }

    if (e.kind === "ko") {
      bumpTurn();
      const W = e.winner === 0 ? p1 : p2;
      const L = e.winner === 0 ? p2 : p1;
      pushComment(fill(pick(VICTORY), { w: W.name, d: L.name, a: W.name }));
      return;
    }

    // turn
    bumpTurn();
    const A = e.attacker === 0 ? p1 : p2;
    const D = e.attacker === 0 ? p2 : p1;
    const sideA: "left" | "right" = e.attacker === 0 ? "left" : "right";
    const sideD: "left" | "right" = e.defender === 0 ? "left" : "right";

    // dash forward
    sfxSwoosh();
    const dashAmount = sideA === "left" ? 130 : -130;
    setAttackerOffset((o) => ({ ...o, [`p${e.attacker + 1}`]: dashAmount }));
    await sleep(220);

    // impact
    sfxHit();
    if (e.crit) sfxCrit();
    if (e.effectiveness === "super") sfxSuper();
    pushBurst(sideD, e.moveType);
    pushPop(sideD, e.damage, e.crit);
    setDefenderHit((o) => ({ ...o, [`p${e.defender + 1}`]: 1 }));
    setDefenderShake((o) => ({ ...o, [`p${e.defender + 1}`]: true }));
    setArenaShake(true);
    if (e.crit || e.effectiveness === "super") {
      setCritPulse(1);
      setTimeout(() => setCritPulse(0), 280);
    }

    // commentator
    let line = "";
    const vars = { a: A.name, d: D.name, move: e.move };
    if (e.crit) line = fill(pick(CRIT), vars);
    else if (e.effectiveness === "super") line = fill(pick(ATTACK_SUPER), vars);
    else if (e.effectiveness === "weak") line = fill(pick(ATTACK_WEAK), vars);
    else if (e.effectiveness === "immune") line = fill(pick(ATTACK_IMMUNE), vars);
    else line = fill(pick(ATTACK_NEUTRAL), vars);
    pushComment(line);

    // stamp
    if (e.effectiveness === "super") {
      const id = nextId();
      setStamp({ text: "SUPER EFFECTIVE!", tone: "super", id });
      setTimeout(() => setStamp((s) => (s?.id === id ? null : s)), 1100);
    } else if (e.effectiveness === "weak") {
      const id = nextId();
      setStamp({ text: "MEH...", tone: "weak", id });
      setTimeout(() => setStamp((s) => (s?.id === id ? null : s)), 800);
    } else if (e.effectiveness === "immune") {
      const id = nextId();
      setStamp({ text: "NO EFFECT", tone: "immune", id });
      setTimeout(() => setStamp((s) => (s?.id === id ? null : s)), 900);
    } else if (e.crit) {
      const id = nextId();
      setStamp({ text: "CRITICAL!", tone: "crit", id });
      setTimeout(() => setStamp((s) => (s?.id === id ? null : s)), 900);
    }

    // pulse defender cry occasionally
    if (e.crit || e.effectiveness === "super") playCry(D.cryUrl, 0.35);

    // HP update with spring-driven bar
    setHp(e.hpAfter);

    await sleep(180);
    setArenaShake(false);
    setDefenderShake((o) => ({ ...o, [`p${e.defender + 1}`]: false }));

    // KILLING BLOW — slow-mo ragdoll sequence
    if (e.hpAfter[e.defender] === 0) {
      stopBGM();
      setSlowMo(true);
      await sleep(220);
      // white flash
      setWhiteFlash(true);
      setTimeout(() => setWhiteFlash(false), 240);
      await sleep(70);
      // loser launches
      setLoserSide(sideD);
      setAttackerOffset((o) => ({ ...o, [`p${e.attacker + 1}`]: 0 }));
      await sleep(460);
      // KO stamp slams in
      sfxKO();
      setKoStamp(true);
      await sleep(950);
      return;
    }

    // attacker recoil back
    await sleep(80);
    setAttackerOffset((o) => ({ ...o, [`p${e.attacker + 1}`]: 0 }));

    await sleep(140);
    setDefenderHit((o) => ({ ...o, [`p${e.defender + 1}`]: 0 }));

    // round counter every 2 turns
    if ((idCounter.current & 7) === 0) setRound((r) => r + 1);

    // low HP taunt
    if (e.hpAfter[e.defender] / maxHpOf(D) < 0.25) {
      pushComment(fill(pick(LOW_HP), { d: D.name, a: A.name }));
    }
  }

  const stampKey = useMemo(() => stamp?.id ?? 0, [stamp]);

  return (
    <div className="absolute inset-0 grid grid-cols-[1fr_360px] grid-rows-[auto_1fr] gap-3 p-4 bg-ink overflow-hidden">
      {/* HP bar row */}
      <div className="col-span-2 flex items-center justify-between gap-6 px-4 pt-2">
        <HPBar pokemon={p1} hp={hp[0]} side="left" accent="hot" />
        <div className="display text-3xl text-white/60 flex flex-col items-center">
          <span className="pixel text-[11px] text-acid">ROUND</span>
          <span className="text-acid drop-shadow-[0_0_18px_rgba(192,255,0,0.7)]">{String(round).padStart(2, "0")}</span>
        </div>
        <HPBar pokemon={p2} hp={hp[1]} side="right" accent="neon" />
      </div>

      {/* Arena */}
      <div className={`relative rounded-xl overflow-hidden border border-white/10 ${arenaShake ? "shake" : ""}`}>
        <div className="absolute inset-0">
          <BattleArena3D critPulse={critPulse} />
        </div>

        {/* Sprite overlay layer (HD-2D trick) */}
        <SpriteLayer
          pokemon={p1}
          side="left"
          offsetX={attackerOffset.p1}
          hitFlash={defenderHit.p1}
          shake={defenderShake.p1}
          isLoser={loserSide === "left"}
        />
        <SpriteLayer
          pokemon={p2}
          side="right"
          offsetX={attackerOffset.p2}
          hitFlash={defenderHit.p2}
          shake={defenderShake.p2}
          isLoser={loserSide === "right"}
        />

        {/* Slow-mo vignette over arena */}
        <AnimatePresence>
          {slowMo && !koStamp && (
            <motion.div
              key="slow-mo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 pointer-events-none z-25"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* White flash */}
        <AnimatePresence>
          {whiteFlash && (
            <motion.div
              key="white-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="absolute inset-0 bg-white pointer-events-none z-40"
            />
          )}
        </AnimatePresence>

        {/* Giant K.O.! stamp */}
        <AnimatePresence>
          {koStamp && (
            <motion.div
              key="ko-stamp"
              initial={{ scale: 8, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 14 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div
                className="display text-[260px] leading-none text-white"
                style={{
                  WebkitTextStroke: "10px #ff1f7a",
                  textShadow:
                    "0 0 80px #c0ff00, 0 0 160px #ff1f7a, 8px 14px 0 #000",
                }}
              >
                K.O.!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ParticleBurst bursts={bursts} />

        <AnimatePresence>
          {pops.map((p) => (
            <DamageNumber key={p.id} value={p.value} crit={p.crit} side={p.side} keySeed={p.id} />
          ))}
        </AnimatePresence>

        <EffectStamp text={stamp?.text ?? null} tone={stamp?.tone} keySeed={stampKey} />

        {/* corner stamps */}
        <div className="absolute top-3 left-4 stamp text-acid text-[10px]">FIGHT! · 100% REAL</div>
        <div className="absolute bottom-3 right-4 stamp text-hot text-[10px]" style={{ transform: "rotate(4deg)" }}>
          SCHOLARS DISAGREE
        </div>

        {/* Bail-out button, always available */}
        <button
          onClick={goPokedex}
          className="absolute top-3 right-4 pixel text-[10px] text-white/60 hover:text-white bg-black/60 border border-white/20 px-3 py-2 rounded"
        >
          ⏏ RESTART
        </button>
      </div>

      {/* Commentator */}
      <div className="row-span-1 min-h-0">
        <Commentator lines={comments} />
      </div>
    </div>
  );
}

function SpriteLayer({
  pokemon,
  side,
  offsetX,
  hitFlash,
  shake,
  isLoser,
}: {
  pokemon: Pokemon;
  side: "left" | "right";
  offsetX: number;
  hitFlash: number;
  shake: boolean;
  isLoser: boolean;
}) {
  const baseLeft = side === "left" ? "22%" : "78%";
  const launchX = side === "left" ? -800 : 800;
  const launchRot = side === "left" ? -720 : 720;
  return (
    <motion.div
      animate={
        isLoser
          ? { x: launchX, y: -700, rotate: launchRot, opacity: 0 }
          : { x: offsetX, y: shake ? [0, -4, 6, -3, 0] : 0, rotate: 0, opacity: 1 }
      }
      transition={
        isLoser
          ? { duration: 1.3, ease: [0.18, 0.0, 0.55, 1.0] }
          : { type: "spring", stiffness: 380, damping: 22 }
      }
      className="absolute"
      style={{
        left: baseLeft,
        bottom: "16%",
        transform: "translateX(-50%)",
        zIndex: 15,
      }}
    >
      <div
        className="relative"
        style={{
          animation: shake || isLoser ? undefined : "bob 2.4s ease-in-out infinite",
          filter: hitFlash || isLoser
            ? "brightness(2.5) contrast(1.2) drop-shadow(0 0 24px #ff1f7a)"
            : `drop-shadow(0 12px 16px rgba(0,0,0,0.7)) drop-shadow(0 0 24px ${side === "left" ? "rgba(255,31,122,0.55)" : "rgba(0,229,255,0.55)"})`,
          transition: "filter 0.08s",
        }}
      >
        <img
          src={pokemon.showdownUrl}
          alt={pokemon.name}
          style={{
            height: 220,
            imageRendering: "pixelated",
            transform: side === "right" ? "scaleX(-1)" : undefined,
          }}
          onError={(e) => {
            // fallback to official artwork if showdown sprite 404s
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = "1";
              img.src = pokemon.artworkUrl;
              img.style.height = "260px";
              img.style.imageRendering = "auto";
            }
          }}
        />
        {/* ground shadow */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 160,
            height: 28,
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, transparent 70%)",
          }}
        />
      </div>
    </motion.div>
  );
}
