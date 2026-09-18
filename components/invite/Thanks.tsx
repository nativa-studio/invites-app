"use client";
import { copy } from "@/lib/copy";
import { Bolt } from "@/components/art/icons";

// What a guest sees once they have replied, wherever they replied from. The personal link and
// the group link land on the same card, because by then the two are the same person.
export function ThanksCard({
  yes, count, host, dated, googleLink, icsLink, onChange,
}: {
  yes: boolean;
  count: number;
  host: string;
  dated: boolean;
  googleLink: string | null;
  icsLink: string;
  onChange: () => void;
}) {
  return (
    <div className="pcard tilt-l" aria-live="polite">
      <div className="rsvp-h"><Bolt /> {yes ? copy.thanks.yesTitle : copy.thanks.noTitle} <Bolt /></div>
      <div className="para">{yes ? copy.thanks.yesBody(count, host) : copy.thanks.noBody(host)}</div>
      {yes && dated && (
        <div className="cal">
          <div className="label sky">{copy.thanks.addToCalendar}</div>
          {googleLink && <a className="pbtn small" href={googleLink} target="_blank" rel="noreferrer">{copy.thanks.google}</a>}
          <a className="pbtn small" href={icsLink}>{copy.thanks.apple}</a>
        </div>
      )}
      <button type="button" className="pbtn small" onClick={onChange}>{copy.rsvp.change}</button>
    </div>
  );
}
