"use client";
import { useEffect, useRef } from "react";
import { copy } from "@/lib/copy";
import { Bolt } from "@/components/art/icons";
import { Celebrate } from "./Celebrate";

// What a guest sees once they have replied, wherever they replied from. The personal link and
// the group link land on the same card, because by then the two are the same person.
//
// `landed` means this card has just replaced a form, rather than being what the page opened on.
// A guest fills in the questions, presses send, and the card that replaces them is shorter than
// the form was, so the page is left scrolled past the answer and they land on whatever follows
// it. They see the bottom of the invite instead of the words See you there. So when it lands, it
// brings itself into view. A guest coming back to an invite they have already answered is not
// landing on anything, and is left at the top where they opened it.
export function ThanksCard({
  yes, count, host, dated, googleLink, icsLink, onChange, landed,
}: {
  yes: boolean;
  count: number;
  host: string;
  dated: boolean;
  googleLink: string | null;
  icsLink: string | null;
  onChange: () => void;
  landed?: boolean;
}) {
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!landed || !card.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.current.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
  }, [landed]);

  return (
    <div className={`pcard tilt-l${yes && landed ? " cheering" : ""}`} aria-live="polite" ref={card}>
      {/* Only on a yes, and only when the answer has just landed. Coming back to an invite you
          answered last week is not a moment. */}
      {yes && landed && <Celebrate />}
      <div className="rsvp-h"><Bolt size={24} /> {yes ? copy.thanks.yesTitle : copy.thanks.noTitle} <Bolt size={24} /></div>
      <div className="para">{yes ? copy.thanks.yesBody(count, host) : copy.thanks.noBody(host)}</div>
      {yes && dated && (
        <div className="cal">
          <div className="label sky">{copy.thanks.addToCalendar}</div>
          {googleLink && <a className="pbtn small" href={googleLink} target="_blank" rel="noreferrer">{copy.thanks.google}</a>}
          {icsLink && <a className="pbtn small" href={icsLink}>{copy.thanks.apple}</a>}
        </div>
      )}
      {/* The way back, not a third thing to do. See .pbtn.quiet. */}
      <button type="button" className="pbtn small quiet" onClick={onChange}>{copy.rsvp.change}</button>
    </div>
  );
}
