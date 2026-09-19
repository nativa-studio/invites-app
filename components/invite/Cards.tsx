import Image from "next/image";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { coverFor } from "@/lib/artwork";
import { formatInviteDate, formatTimeRange, formatTime } from "@/lib/format";
import { askLine, signoffMessage } from "@/lib/ask-line";
import { ICONS, Bolt, Bubble, Camera, Clock, Gift, Kids, Pin, Plate, Cap, Cake, Shower, Sun, Towel } from "@/components/art/icons";
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
      {e.host_line && <div className="small">{e.host_line}</div>}
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
  if (kind === "bring") return /sun|hat|sunscreen|burn|shade/i.test(text) ? <Sun /> : <Towel />;
  if (kind === "serve") return /cake/i.test(text) ? <Cake /> : <Plate />;
  if (kind === "plate") return <Plate />;
  if (kind === "parents") return <Kids />;
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

// The last block: who to ask. A guest who has read to the end has a question, not a wish to be
// told that photos will arrive one day.
export function AskCard({ e }: { e: PublicEvent }) {
  const sms = e.host_phone ? `sms:${e.host_phone.replace(/[^\d+]/g, "")}` : null;
  const line = askLine(e);
  return (
    <div className="pcard cream tilt-l" data-section="after">
      <div className="tape" />
      {/* The symbol is the heading. A speech bubble says "ask us" without a word, and the word was
          only saying the same thing twice: it sat in the red heading and then again in the line
          below it. */}
      <div className="ask-mark" aria-hidden="true"><Bubble size={44} /></div>
      <p className="ask">
        <span className="k">{copy.sections.askLabel}</span>{" "}
        {sms ? <a href={sms}>{line}</a> : <span>{line}</span>}
      </p>
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
