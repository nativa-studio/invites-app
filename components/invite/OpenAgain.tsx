"use client";
import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";

// Open it again, under the greeting.
//
// It was only drawn for a guest who had already replied, on the reasoning that they were the
// ones who had missed the envelope. Then the children started asking, and they have not missed
// anything: they have just watched it and want it again, which is the whole point of it. So it
// is there for everybody.
//
// It appears once the envelope has finished, never before. A line offering to open an envelope
// again, sitting above one that is still opening, is nonsense, and a child would tap it halfway
// through and start it over. It waits for the envelope's own signal rather than counting the
// milliseconds of the animation, which would be a second copy of a number that lives elsewhere.
//
// The link is to the page it is already on, with ?envelope=1, which forces the animation on for
// a guest who would otherwise land on the invite open.
export function OpenAgain() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const seen = () => setOpen(true);
    window.addEventListener("invite:open", seen);
    return () => window.removeEventListener("invite:open", seen);
  }, []);
  if (!open) return null;
  return <a className="replay" href="?envelope=1">{copy.envelope.again}</a>;
}
