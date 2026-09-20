"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bolt } from "@/components/art/icons";
import type { Stock } from "@/lib/layouts";

type Mascot = { src: string; w: number; h: number };
type Props = {
  cover: React.ReactNode;
  children: React.ReactNode;
  openLabel: string;
  skipAnimation?: boolean;
  mascot?: Mascot | null;
  bodyClassName?: string;
  stock?: Stock;
  /** What is pressed into the wax. The poster designs use the bolt off their own icon set; a
   *  design drawn in one ink passes its own mark, because a filled yellow seal is four colours
   *  on a page that has two. */
  seal?: React.ReactNode;
};

// The opening: tap (or wait), the flap lifts, the card rises, grows, and the envelope drops away.
// The cover is drawn once, never twice: the envelope holds it until the opening is over, then
// hands it to the page. Two copies at once would share one set of SVG pattern ids, and the
// halftone shading would look up the copy inside the closed envelope and find nothing to paint.
//
// Nothing is written on it. This is the back of the envelope, the face with the flap and the seal
// on it, and a name belongs on the front. The guest has been greeted by name directly above this,
// and the picture that brought them here carries their name on its front, so writing it a third
// time on the thing they are about to open added nothing.
export function Envelope({ cover, children, openLabel, skipAnimation, mascot, bodyClassName = "suite", stock, seal }: Props) {
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
          // 900 rather than 800: the slide itself takes 850ms, so the stage used to be pulled
          // out from under a card that was still moving.
        }, wait(900));
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
        <div className={stock && stock !== "red" ? `env ${stock}` : "env"}>
          <div className="back" />
          <div className="clip"><div className="card-slot">{phase !== "done" && cover}</div></div>
          <div className="pocket">
            <div className="sides" /><div className="edge" />
          </div>
          <div className="flap"><div className="face front" /><div className="face backface" /><div className="rim" /></div>
          {/* The event's characters, standing along the envelope rather than printed on it. They sit
              outside the pocket on purpose: inside it they would be clipped by the paper's edge,
              which is what made the last one look badly cut. */}
          {mascot && <Image className="cast" src={mascot.src} alt="" width={mascot.w} height={mascot.h} sizes="240px" priority />}
          <div className="seal">{seal ?? <Bolt size={30} />}</div>
        </div>
        <div className="hint">{openLabel}</div>
        <button type="button" className="tap" aria-label={openLabel} onClick={open} disabled={phase !== ""} />
      </div>
      <div className={bodyClassName}>
        {phase === "done" && cover}
        {children}
      </div>
    </div>
  );
}
