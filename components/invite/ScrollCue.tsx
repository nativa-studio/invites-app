"use client";
import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { Chev } from "@/components/art/icons";

// The card fills the phone, and everything that answers a guest's next question is under it. A
// person who has just watched an envelope open is looking at a picture, not at a page, and if the
// card runs off the bottom edge there is nothing to say the page continues. So say it, and take
// it back the moment they scroll: the cue is only ever news once.
//
// `anchor` is the first block of the layout, the one the envelope hands over to. If that block
// ends on screen, the reader can see white space and the top of whatever follows, and saying
// "there's more below" would only cover it up. The cue is for the other case, where the first
// block is cut off by the bottom edge and the page looks like it might be all there is.
//
// `ready` is the layout telling us the opening is over. The cards below are in the document the
// whole time the envelope animates, so page height alone would show this far too early.
function firstBlockIsCutOff(anchor: string): boolean {
  if (document.documentElement.scrollHeight - window.innerHeight < 120) return false;
  const el = document.querySelector(anchor);
  if (!el) return false;
  return el.getBoundingClientRect().bottom > window.innerHeight - 24;
}

export function ScrollCue({ ready = true, anchor = ".suite > *" }: { ready?: boolean; anchor?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setShow(window.scrollY < 40 && firstBlockIsCutOff(anchor)), 900);
    const onScroll = () => { if (window.scrollY > 40) setShow(false); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, [ready, anchor]);

  if (!show) return null;
  return (
    <button
      type="button"
      className="more"
      onClick={() => {
        setShow(false);
        window.scrollBy({ top: Math.round(window.innerHeight * 0.72), behavior: "smooth" });
      }}
    >
      <span>{copy.more.label}</span>
      <Chev size={26} />
    </button>
  );
}
