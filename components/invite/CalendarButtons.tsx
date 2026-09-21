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

// The same two buttons, under the reply, for a guest who has not answered yet.
//
// Quieter than the reply on purpose, and worded so it cannot be mistaken for it. The first
// version of this sat on the details card, above the RSVP, and two large buttons between the
// date and Yes or No read as the thing to press: a guest taps Google Calendar, gets an entry in
// their diary, and leaves believing they have replied. The host then chases somebody who thinks
// they are coming, which is worse than never having offered it.
//
// So it is below the decision, it is quiet type rather than a card, and the line under the links
// says in Marcia's own words that it is not an answer. That line is doing the work the heading
// used to: the heading names the action, the note says what the action is not.
export function HoldTheDate({ calendar }: { calendar?: { google: string | null; ics: string | null } | null }) {
  if (!calendar || (!calendar.google && !calendar.ics)) return null;
  return (
    <div className="hold">
      <p className="q">{copy.sections.holdTheDate}</p>
      <div className="row">
        {calendar.google && <a className="pbtn small quiet" href={calendar.google} target="_blank" rel="noreferrer">{copy.thanks.google}</a>}
        {calendar.ics && <a className="pbtn small quiet" href={calendar.ics}>{copy.thanks.apple}</a>}
      </div>
      <p className="note">{copy.sections.holdTheDateNote}</p>
    </div>
  );
}
