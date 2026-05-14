import { useEffect, useRef, useState } from "react";

type Line = { id: number; text: string; tone?: "win" | "crit" | "miss" | "neutral" };

export default function Commentator({ lines }: { lines: Line[] }) {
  const [typed, setTyped] = useState<{ id: number; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSeenId = useRef(-1);

  useEffect(() => {
    // Type new lines one at a time
    const newOnes = lines.filter((l) => l.id > lastSeenId.current);
    if (newOnes.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const line of newOnes) {
        if (cancelled) break;
        lastSeenId.current = line.id;
        setTyped((cur) => [...cur, { id: line.id, text: "" }]);
        for (let i = 1; i <= line.text.length; i++) {
          if (cancelled) break;
          await new Promise((r) => setTimeout(r, 14));
          setTyped((cur) => {
            const last = cur[cur.length - 1];
            if (!last || last.id !== line.id) return cur;
            const next = [...cur];
            next[next.length - 1] = { id: line.id, text: line.text.slice(0, i) };
            return next;
          });
        }
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }
    })();

    return () => { cancelled = true; };
  }, [lines]);

  return (
    <div className="w-full h-full bg-black/85 border-2 border-acid/60 rounded-xl overflow-hidden flex flex-col shadow-[0_0_40px_rgba(192,255,0,0.15)]">
      <div className="px-4 py-2 border-b border-acid/40 flex items-center gap-2 bg-acid/10">
        <span className="w-2.5 h-2.5 rounded-full bg-hot animate-pulse" />
        <span className="pixel text-[10px] text-acid">LIVE · COMMENTATOR-AI v2.4</span>
        <span className="pixel text-[9px] text-white/40 ml-auto">UNHINGED MODE</span>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 font-mono text-[13px] leading-relaxed overflow-y-auto text-acid">
        {typed.map((l) => (
          <div key={l.id} className="mb-1">
            <span className="text-white/40">{">"}</span>{" "}
            <span>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
