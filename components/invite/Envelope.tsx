"use client";
import { useEffect, useRef, useState } from "react";
import { Bolt } from "@/components/art/icons";

type Props = {
  /** Which stationery: the suite's tall card, or the post's landscape one. */
  variant: "suite" | "post";
  addressee: string;
  /** The age, stamped into the wax. Empty for an event that has none. */
  stamp: string;
  card: React.ReactNode;
  openLabel: string;
  skipAnimation?: boolean;
  /** The suite keeps its page inside the envelope until the opening is over. The post layout
   *  has its page below the envelope from the start, so it passes none. */
  children?: React.ReactNode;
};

// The envelope as it actually reaches you: the back, with the flap folded down and sealed, and
// the name written under the seal. That is where a seal and a name go. A stamp belongs on the
// front, which is not the side you are holding, so there is no stamp here any more: the age is
// pressed into the wax instead.
//
// Tap, or wait, and the flap lifts away and the envelope leaves, in whichever direction its
// layout calls for. The card is drawn once, never twice: two copies at once would share one set
// of SVG pattern ids, and a cover's halftone shading would look up the copy inside the closed
// envelope and find nothing to paint. So the suite, which hands the card on to the page below,
// stops drawing it here the moment it does; the post layout, which keeps it where it lies,
// never stops.
export function Envelope({ variant, addressee, stamp, card, openLabel, skipAnimation, children }: Props) {
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
          if (children) window.scrollTo({ top: 0 });
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

  // `env-suite` / `env-post`, not the bare word: "post" is the page's own class and the two
  // would collide.
  const cls = ["env-root", `env-${variant}`, phase === "open" ? "open" : "", phase === "rise" ? "open rise" : "", phase === "out" ? "open rise out" : "", phase === "done" ? "done" : ""].join(" ");
  return (
    <div className={cls}>
      <div className="stage" aria-hidden={phase === "done"}>
        <div className="benv">
          <div className="body"><span className="seams" /></div>
          <div className="clip"><div className="card-slot">{(children ? phase !== "done" : true) && card}</div></div>
          <div className="addr">{addressee}</div>
          <div className="flap">
            <div className="face front"><span className="note">{openLabel}</span></div>
            <div className="face backface" />
            <div className="rim" />
          </div>
          <div className="seal">{stamp ? <span className="age">{stamp}</span> : <Bolt size={28} />}</div>
        </div>
        {phase !== "done" && <button type="button" className="tap" aria-label={openLabel} onClick={open} disabled={phase !== ""} />}
      </div>
      {children && <div className="suite">{phase === "done" && card}{children}</div>}
    </div>
  );
}
