"use client";
import { useEffect, useRef, useState } from "react";
import { Bolt } from "@/components/art/icons";

type Props = { addressee: string; addresseeLine?: string; stamp: string; cover: React.ReactNode; children: React.ReactNode; openLabel: string; skipAnimation?: boolean };

// The opening: tap (or wait), the flap lifts, the card rises, grows, and the envelope drops away.
export function Envelope({ addressee, addresseeLine, stamp, cover, children, openLabel, skipAnimation }: Props) {
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
          <div className="clip"><div className="card-slot">{cover}</div></div>
          <div className="pocket">
            <div className="sides" /><div className="edge" />
            <div className="addr">{addressee}{addresseeLine && <><br /><span>{addresseeLine}</span></>}</div>
            <div className="stamp"><div><Bolt size={26} /><div>{stamp}</div></div></div>
          </div>
          <div className="flap"><div className="face front" /><div className="face backface" /><div className="rim" /></div>
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
