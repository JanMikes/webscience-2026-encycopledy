import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGameStore } from "../store/useGameStore";
import { playCry } from "../lib/audio";

export default function VsIntroScreen() {
  const [p1, p2] = useGameStore((s) => s.selected);
  const goBattle = useGameStore((s) => s.goBattle);

  const root = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const vsRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!p1 || !p2) return;

    const tl = gsap.timeline({
      onComplete: () => goBattle(),
    });

    gsap.set(leftRef.current, { xPercent: -110, skewX: -12 });
    gsap.set(rightRef.current, { xPercent: 110, skewX: -12 });
    gsap.set(vsRef.current, { scale: 6, opacity: 0, rotate: -20 });
    gsap.set(flashRef.current, { opacity: 0 });

    tl.to(leftRef.current, { xPercent: 0, duration: 0.35, ease: "power4.out" }, 0)
      .to(rightRef.current, { xPercent: 0, duration: 0.35, ease: "power4.out" }, 0.15)
      .to(vsRef.current, { scale: 1, opacity: 1, rotate: 0, duration: 0.32, ease: "back.out(2.2)" }, 0.55)
      .to(flashRef.current, { opacity: 1, duration: 0.05 }, 0.85)
      .to(flashRef.current, { opacity: 0, duration: 0.25 }, 0.9)
      .to(root.current, {
        keyframes: { x: [0, -12, 14, -8, 6, 0] },
        duration: 0.5,
        ease: "power2.out",
      }, 0.85)
      .to({}, { duration: 0.8 }); // hold

    // Layered cries
    playCry(p1.cryUrl, 0.45);
    setTimeout(() => playCry(p2.cryUrl, 0.45), 220);

    return () => { tl.kill(); };
  }, [p1, p2, goBattle]);

  if (!p1 || !p2) return null;

  return (
    <div ref={root} className="absolute inset-0 bg-black overflow-hidden">
      {/* Speed lines bg */}
      <div className="absolute inset-0 opacity-50"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 22px, rgba(255,255,255,0.04) 23px, rgba(255,255,255,0.04) 24px)",
        }}
      />

      {/* LEFT half */}
      <div
        ref={leftRef}
        className="absolute top-0 left-0 w-1/2 h-full overflow-hidden bg-gradient-to-br from-hot/40 via-black to-black"
        style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
      >
        <div className="absolute inset-0 bg-grid opacity-25" />

        <img
          src={p1.artworkUrl}
          alt={p1.name}
          className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 h-[68vh] max-w-[88%] object-contain"
          style={{ filter: "drop-shadow(0 0 80px rgba(255,31,122,0.85))" }}
        />

        <div className="absolute inset-x-0 bottom-0 pt-32 pb-10 px-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-left">
          <div className="pixel text-[14px] text-hot mb-2">PLAYER ONE</div>
          <h2 className="display text-[76px] leading-[0.9] text-white drop-shadow-[0_8px_30px_rgba(255,31,122,0.7)] break-words">
            {p1.name.toUpperCase()}
          </h2>
          <div className="display text-xl text-hot mt-2 uppercase tracking-wider">
            {p1.types.join(" · ")}
          </div>
        </div>
      </div>

      {/* RIGHT half */}
      <div
        ref={rightRef}
        className="absolute top-0 right-0 w-1/2 h-full overflow-hidden bg-gradient-to-bl from-neon/40 via-black to-black"
        style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        <div className="absolute inset-0 bg-grid opacity-25" />

        <img
          src={p2.artworkUrl}
          alt={p2.name}
          className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 h-[68vh] max-w-[88%] object-contain"
          style={{
            transform: "translate(-50%, -50%) scaleX(-1)",
            filter: "drop-shadow(0 0 80px rgba(0,229,255,0.85))",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 pt-32 pb-10 px-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-right">
          <div className="pixel text-[14px] text-neon mb-2">PLAYER TWO</div>
          <h2 className="display text-[76px] leading-[0.9] text-white drop-shadow-[0_8px_30px_rgba(0,229,255,0.7)] break-words">
            {p2.name.toUpperCase()}
          </h2>
          <div className="display text-xl text-neon mt-2 uppercase tracking-wider">
            {p2.types.join(" · ")}
          </div>
        </div>
      </div>

      {/* VS */}
      <div
        ref={vsRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="display text-[280px] leading-none text-white"
          style={{
            WebkitTextStroke: "8px #c0ff00",
            textShadow: "0 0 60px rgba(192,255,0,0.9), 0 0 120px rgba(255,31,122,0.6)",
          }}
        >
          VS
        </div>
      </div>

      <div ref={flashRef} className="absolute inset-0 bg-white pointer-events-none" />
    </div>
  );
}
