import Image from "next/image";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { coverFor } from "@/lib/artwork";
import { formatInviteDate, formatTimeRange, formatTime } from "@/lib/format";
import { askLine, askPhoneSuffix, askSms, photoLine, signoffMessage } from "@/lib/ask-line";
import { ICONS, Bolt, Bubble, Camera, Clock, Gift, Pin, Bbq, Cap, Cake, Kids, Shower, Sun, Towel } from "@/components/art/icons";
import { orderedNotes, type NoteKind } from "@/lib/good-to-know";

export function mapsLink(e: PublicEvent): string | null {
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

// data-section on each card is the handle the host's preview edits by: tap a card there and the
// drawer knows which part of the invite you meant. The names are the contract, so they match the
// sections a host is offered. A guest page carries the attribute and nothing reads it.
//
// The cover: the host's own picture at the top, then everything a guest needs to decide whether
// to come. The picture is theirs. Nothing here is drawn for them.
export function CoverCard({ e }: { e: PublicEvent }) {
  const age = e.title.match(/turning (\d+)/i)?.[1];
  const art = coverFor(e.invite_image_path);
  return (
    <div className="pcard tilt-l" data-section="cover">
      {art && (
        <div className="art">
          <Image src={art.src} alt="" width={art.w} height={art.h} priority sizes="(max-width: 430px) 100vw, 340px" />
        </div>
      )}
      <div className="eyebrow">{age ? copy.envelope.eyebrowBirthday : copy.greetingGroup}</div>
      <div className="title">{e.title}</div>
      {e.intro && <div className="intro">{e.intro}</div>}
      {/* When and where belong to the details card, which follows immediately. Printing them on
          the cover as well just makes a guest read the same two lines twice. If the host has
          turned the details off, the cover carries them, because nowhere else would. */}
      {!e.show_details && (
        <>
          <div className="rule" />
          <div className="para">{formatInviteDate(e.date)}<br />{formatTimeRange(e.start_time, e.end_time, e.time_note)}</div>
          {e.venue && <div className="where">{e.venue}</div>}
        </>
      )}
      {/* Who it is from is signed at the end now, the way a card is. It was on the cover as well,
          which said it twice. It comes back here only when the sign-off is switched off, because
          then nowhere else would carry it. Same rule as the date and place above. */}
      {e.show_signoff === false && e.host_line && <div className="small">{e.host_line}</div>}
    </div>
  );
}

// When and where, as a clock and a pin. The words "When" and "Where" spent a column telling a
// reader what they could already see: a date is a date, an address is an address. A symbol says
// it in the width of an icon and in any language, and the words stay behind it for anyone
// listening to the page rather than looking at it.
//
// Three layouts printed these two rows from their own copies. They share this one now, so a
// change lands everywhere at once.
export function WhenWhere({ e }: { e: PublicEvent }) {
  return (
    <div className="kv icons">
      <div className="k"><Clock size={30} /><span className="sr">{copy.sections.when}</span></div>
      <div>{formatInviteDate(e.date)}, {formatTimeRange(e.start_time, e.end_time, e.time_note).toLowerCase()}</div>
      <div className="k"><Pin size={30} /><span className="sr">{copy.sections.where}</span></div>
      <div>{e.venue}{e.address ? <><br />{e.address}</> : null}</div>
    </div>
  );
}

export function DetailsCard({ e }: { e: PublicEvent }) {
  const maps = mapsLink(e);
  return (
    <div className="pcard white tilt-r" data-section="details">
      <div className="tape" />
      <div className="label red">{copy.sections.details}</div>
      <WhenWhere e={e} />
      {maps && <a className="pill-link" href={maps} target="_blank" rel="noreferrer">{copy.sections.openInMaps}</a>}
    </div>
  );
}

export function DayCard({ e }: { e: PublicEvent }) {
  if (!e.runsheet.length) return null;
  return (
    <div className="pcard cream tilt-l" data-section="day">
      <div className="label sky">{copy.sections.afternoon}</div>
      <div className="stops">
        {e.runsheet.map((s, i) => {
          const Icon = ICONS[s.icon ?? ""] ?? Cap;
          return (
            <div className="stop" key={i}>
              <div className="t">{formatTime(s.time)}</div>
              <div><Icon size={52} /></div>
              <div><div className="n">{s.title}</div>{s.note && <div className="b">{s.note}</div>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// One picture per kind of line, and for three of them the wording decides which one.
//
// A line that says "come pool ready and sun smart" is about the sun, not about a towel, and the
// host has already told us so in their own words. Same reasoning as the cake, which was here
// first: read what they wrote rather than make them pick from a list of pictures.
function noteIcon(kind: NoteKind, text: string): React.ReactNode {
  if (kind === "siblings") return <Kids />;
  if (kind === "bring") return /sun|hat|sunscreen|burn|shade/i.test(text) ? <Sun /> : <Towel />;
  // A barbecue beats a cake when the line says both, because "sausages on the barbecue, and cake
  // at 4ish" is a line about the barbecue with the cake as an aside. Cake on its own still gets
  // the cake, which is how this rule started.
  if (kind === "serve") return /bbq|barbecue|barbeque|sausage|grill|spit/i.test(text) ? <Bbq /> : /cake/i.test(text) ? <Cake /> : <Bbq />;
  if (kind === "plate") return <Bbq />;
  if (kind === "gifts") return <Gift />;
  if (kind === "photos") return <Camera />;
  // Anything else the host has written. The speech bubble is the fallback, but a note about
  // showers gets a shower: it is the commonest thing to end up in this box after a pool party,
  // and a speech bubble on it says nothing at all.
  if (/shower/i.test(text)) return <Shower />;
  return <Bubble />;
}

export function KnowCard({ e }: { e: PublicEvent }) {
  const lines = orderedNotes(e);
  if (!lines.length) return null;
  return (
    <div className="pcard white tilt-r" data-section="know">
      <div className="tape sky" />
      <div className="label red">{copy.sections.goodToKnow}</div>
      <div className="lines">
        {lines.map((l, i) => <div className="line" key={i}>{noteIcon(l.kind, l.text)}<div>{l.text}</div></div>)}
      </div>
    </div>
  );
}

// The last block: who to ask, and the one thing to remember on the way out.
//
// Two cells side by side, a symbol over a name over a line, which is the shape this block had
// when it promised updates and photos. The shape was right and the content was not: a guest who
// has read to the end has a question now, not a wish to be told that photos will arrive one day.
// So the left cell is the question, with the host's number under it, spaced and tappable.
//
// The right cell is the photo request, in four words. Its full wording lives in Good to know,
// where a guest reads it while deciding what the day will be like. This is the parting reminder,
// for the guest already holding a camera, and four words is all a reminder is.
export function AskCard({ e }: { e: PublicEvent }) {
  const sms = askSms(e);
  const phone = askPhoneSuffix(e);
  const photos = photoLine(e);
  return (
    <div className="pcard cream tilt-l" data-section="after">
      <div className="tape" />
      <div className={photos ? "two" : "two one"}>
        <div>
          <Bubble size={44} />
          <span className="n">{copy.sections.askHeading}</span>
          {sms
            ? <a className="b" href={sms}>{askLine(e)}{phone ? ` ${phone}` : ""}</a>
            : <span className="b">{askLine(e)}</span>}
        </div>
        {photos && (
          <div>
            <Camera size={44} />
            <span className="n">{copy.sections.photos}</span>
            <span className="b">{photos}</span>
          </div>
        )}
      </div>
    </div>
  );
}


// The sign-off, and the end of the invite.
//
// No label and no picture: a label would make it another section of a document, and this is the
// bit that stops being a document. The message is in the hand, because this is the one block that
// is the host talking rather than the event describing itself.
//
// The seal at the bottom is the one that was on the envelope, the thing the guest tapped to open
// all this. Pressed into the paper at the end the way wax closes a letter, it says the note is
// finished, and it hands the last thing a guest sees back to the first thing they touched.
export function SignoffCard({ e }: { e: PublicEvent }) {
  return (
    <div className="pcard signoff tilt-r" data-section="signoff">
      <div className="msg">{signoffMessage(e)}</div>
      {e.host_line && <div className="sig">{e.host_line}</div>}
      <div className="stamp" aria-hidden="true"><Bolt size={26} /></div>
    </div>
  );
}

export function UpdatesCard({ e }: { e: PublicEvent }) {
  if (!e.updates.length) return null;
  return (
    <div className="pcard white" data-section="updates">
      <div className="label sky">{copy.sections.updates}</div>
      <div className="lines">{e.updates.map((u, i) => <div className="line" key={i}><Bubble size={36} /><div>{u.body}</div></div>)}</div>
    </div>
  );
}
