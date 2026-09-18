"use client";
import { useEffect, useRef, useState } from "react";
import { Bolt } from "@/components/art/icons";

type Props = { addressee: string; card: React.ReactNode; openLabel: string; skipAnimation?: boolean };

// The envelope for the post layout. A C6 envelope with an A6 card inside, drawn at the size a
// card is when it fits: the card never grows, it only comes out. Tap (or wait), the flap
// lifts, the card rises clear, and the envelope drops away from under it, so the card settles
// exactly where it lay inside. The page below never moves. The invitation to tap is written on
// the flap itself, and the seal breathes, so nothing needs to sit under the envelope.
export function PostEnvelope({ addressee, card, openLabel, skipAnimation }: Props) {
  const [phase, setPhase] = useState<"" | "open" | "rise" | "out" | "done">(skipAnimation ? "done" : "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  function open() {
    if (started.current) return;
    started.current = true;
    if (timer.current) clearTimeout(timer.current);
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = (ms: number) => (reduce ? 0 : ms);
    setPhase("open");
    setTimeout(() => {
      setPhase("rise");
      setTimeout(() => {
        setPhase("out");
        setTimeout(() => setPhase("done"), wait(800));
      }, wait(750));
    }, wait(900));
  }

  useEffect(() => {
    if (skipAnimation) return;
    timer.current = setTimeout(open, 2600);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cls = ["post-stage", phase === "open" ? "open" : "", phase === "rise" ? "open rise" : "", phase === "out" ? "open rise out" : "", phase === "done" ? "done" : ""].join(" ");
  return (
    <div className={cls}>
      <div className="penv">
        <div className="back" />
        <div className="clip"><div className="card-slot">{card}</div></div>
        <div className="pocket">
          <div className="sides" /><div className="edge" />
          <div className="addr">{addressee}</div>
        </div>
        <div className="flap"><div className="face front"><span className="note">{openLabel}</span></div><div className="face backface" /><div className="rim" /></div>
        {/* The same postmark the other envelope wears, printed over the flap. */}
        <svg className="mark" viewBox="0 0 150 54" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="26" cy="27" r="21" />
            <circle cx="26" cy="27" r="15" />
            {[0, 1, 2].map((i) => <path key={i} d={`M58 ${14 + i * 13} q13 -6 26 0 t26 0 t26 0`} />)}
          </g>
        </svg>
        <div className="seal"><Bolt size={30} /></div>
      </div>
      {phase !== "done" && <button type="button" className="tap" aria-label={openLabel} onClick={open} disabled={phase !== ""} />}
    </div>
  );
}
