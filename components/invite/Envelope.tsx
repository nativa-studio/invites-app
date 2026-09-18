"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bolt } from "@/components/art/icons";

type Mascot = { src: string; w: number; h: number };
type Props = { addressee: string; addresseeLine?: string; cover: React.ReactNode; children: React.ReactNode; openLabel: string; skipAnimation?: boolean; mascot?: Mascot | null };

// The opening: tap (or wait), the flap lifts, the card rises, grows, and the envelope drops away.
// The cover is drawn once, never twice: the envelope holds it until the opening is over, then
// hands it to the page. Two copies at once would share one set of SVG pattern ids, and the
// halftone shading would look up the copy inside the closed envelope and find nothing to paint.
export function Envelope({ addressee, addresseeLine, cover, children, openLabel, skipAnimation, mascot }: Props) {
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
        setTimeout(() => {
          setPhase("done");
          window.scrollTo({ top: 0 });
        }, wait(800));
      }, wait(750));
    }, wait(900));
  }

  useEffect(() => {
    if (skipAnimation) return;
    timer.current = setTimeout(open, 2600);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cls = ["env-root", phase === "open" ? "open" : "", phase === "rise" ? "open rise" : "", phase === "out" ? "open rise out" : "", phase === "done" ? "done" : ""].join(" ");
  return (
    <div className={cls} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <div className="stage" aria-hidden={phase === "done"}>
        <div className="env">
          <div className="back" />
          <div className="clip"><div className="card-slot">{phase !== "done" && cover}</div></div>
          <div className="pocket">
            <div className="sides" /><div className="edge" />
            <div className="addr">{addressee}{addresseeLine && <><br /><span>{addresseeLine}</span></>}</div>
            {/* The event's own character, sitting in the corner the stamp used to crowd. */}
            {mascot && <Image className="mascot" src={mascot.src} alt="" width={mascot.w} height={mascot.h} sizes="110px" />}
          </div>
          <div className="flap"><div className="face front" /><div className="face backface" /><div className="rim" /></div>
          {/* A postmark rather than a stamp. A stamp is a white rectangle with its own hard edge,
              which fought the envelope's corner and hung off it; ink cannot. It sits outside the
              pocket because the pocket's shadow makes a stacking context of its own, so nothing
              inside it can print over the flap, which is exactly what a cancellation mark does. */}
          <svg className="mark" viewBox="0 0 150 54" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="26" cy="27" r="21" />
              <circle cx="26" cy="27" r="15" />
              {[0, 1, 2].map((i) => <path key={i} d={`M58 ${14 + i * 13} q13 -6 26 0 t26 0 t26 0`} />)}
            </g>
          </svg>
          <div className="seal"><Bolt size={30} /></div>
        </div>
        <div className="hint">{openLabel}</div>
        <button type="button" className="tap" aria-label={openLabel} onClick={open} disabled={phase !== ""} />
      </div>
      <div className="suite">
        {phase === "done" && cover}
        {children}
      </div>
    </div>
  );
}
