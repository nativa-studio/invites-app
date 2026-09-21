import { copy } from "@/lib/copy";

// Add to calendar, in one place, because it is offered at two moments.
//
// It was only ever on the thank-you card, so a guest could put the party in their diary only
// after saying yes. That is backwards for the commonest case there is: somebody reads the date,
// does not know yet whether they can come, and wants it in their calendar so they do not book
// over it while they find out. Making them answer first turns "let me check" into "I will come
// back later", and later is the reply that never arrives.
//
// So it sits with the date, on the details card, where a guest is already reading when. And it
// stays on the thank-you card, where it is a different thing: not "hold this date" but "that's
// settled, here it is".
//
// One component for both, so the two can never end up offering different calendars.
export function CalendarButtons({ google, ics, label }: {
  google: string | null;
  ics: string | null;
  /** The words above the buttons. The date card asks a question of somebody still deciding; the
   *  thank-you card is telling somebody who has decided. */
  label: string;
}) {
  if (!google && !ics) return null;
  return (
    <div className="cal">
      <div className="label sky">{label}</div>
      {google && <a className="pbtn small" href={google} target="_blank" rel="noreferrer">{copy.thanks.google}</a>}
      {ics && <a className="pbtn small" href={ics}>{copy.thanks.apple}</a>}
    </div>
  );
}
