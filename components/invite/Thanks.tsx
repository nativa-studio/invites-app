"use client";
import { useEffect, useRef } from "react";
import { copy } from "@/lib/copy";
import { Bolt } from "@/components/art/icons";
import { Celebrate } from "./Celebrate";
import { CalendarButtons } from "./CalendarButtons";

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
  yes, host, dated, googleLink, icsLink, onChange, landed,
}: {
  yes: boolean;
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
    <>
      {/* Only on a yes, and only when the answer has just landed. Coming back to an invite you
          answered last week is not a moment. Outside the card, because the card is tilted and a
          transformed element is a containing block for anything fixed inside it, which would pin
          the flags to the card instead of letting them fall down the screen. */}
      {yes && landed && <Celebrate />}
    {/* The same dashed green edge the reply card has. They are two halves of one exchange, the
        question and the answer to it, and until now the answer arrived in the solid navy border
        every card on the invite wears, so it read as another thing to look at rather than as the
        reply closing. */}
    {/* data-section, so that on the host's own screen this card keeps the reply's pencil. It is
        the reply card once it has been answered, and without the mark a host who pressed yes on
        their own invite watched the way into the questions disappear. Guests have no pencils, so
        it is a mark on nothing for them. */}
    <div className={`pcard tilt-l reply${yes && landed ? " cheering" : ""}`} data-section="reply" aria-live="polite" ref={card}>
      <div className="rsvp-h"><Bolt size={24} /> {yes ? copy.thanks.yesTitle : copy.thanks.noTitle} <Bolt size={24} /></div>
      <div className="para">{yes ? copy.thanks.yesBody() : copy.thanks.noBody(host)}</div>
      {yes && dated && <CalendarButtons google={googleLink} ics={icsLink} label={copy.thanks.addToCalendar} />}
      {/* The way back, not a third thing to do. See .pbtn.quiet. The line above it is what makes
          it theirs: on its own, Change my answer reads as an undo for a slip, and a guest who
          meant every word of their yes has no reason to look at it. Naming the moment they would
          actually come back, a plan falling over in three weeks, is the whole point of saying it
          here rather than trusting them to guess. Tied to the button and not up in the body,
          because it is only true while there is a button to tap. */}
      <p className="small change-why">{copy.thanks.changeHint}</p>
      <button type="button" className="pbtn small quiet" onClick={onChange}>{copy.rsvp.change}</button>
    </div>
    </>
  );
}
