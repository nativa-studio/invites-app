import React from "react";
import "@/app/file.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { orderedNotes } from "@/lib/good-to-know";
import { orderedParts, PART_NAMES, type InvitePart } from "@/lib/invite-parts";
import { formatInviteDate, formatTime, formatTimeRange } from "@/lib/format";
import { askContacts, photoLine, signoffMessage } from "@/lib/ask-line";
import { mapsLink } from "./Cards";
import { Mono, monoNote, hasMono } from "@/components/art/mono";
import { portraitFor } from "@/lib/artwork";
import { Envelope } from "./Envelope";
import { GiftsContent, hasGifts } from "./GiftsContent";

// Staff file: a staff pass on a lanyard, and the rest of the invite filled in on a clipboard.
//
// Approved 25 September 2026 with the Monsters theme. The cover is a pass hanging on a V of
// lanyard straps, and everything below it is one ruled sheet held by a metal clip: numbered
// sections, the reply as tick boxes with a rubber stamp, the info booth and the sign-off as
// post-its. Nothing is a card and nothing is tilted except the things that would be.
//
// Every value is lifted from design_handoff_monster_layouts/reference/file-page.html and measured
// against spec/golden.json.
//
// The numbers are drawn, not stored: they count the parts that have one, in the order the host
// has put them in, so switching a part off closes the gap and reordering renumbers. Questions and
// the sign-off carry none, because they are not sections of the file, they are what is stapled to
// the back of it.

/** The parts that carry no number.
 *
 *  Questions and the sign-off, because they are not sections of the file: they are what is
 *  stapled to the back of it.
 *
 *  Bring a plate for a harder reason. Whether it draws is not known here: the board belongs to a
 *  guest who has said yes, and that answer lives in a client component below this one, so on the
 *  server every invite looks as though it has a plate. Counting it therefore took a number that
 *  nothing on the sheet was wearing, and every numbered part after it was pushed up one. On an
 *  invite with gifts switched on the sheet read 01, 02, 03, 05. The fixture the fidelity suite
 *  measures has gifts switched off, so the missing number fell off the end where nothing could
 *  see it. Numbering it is not the answer either: it would renumber the whole sheet the moment a
 *  guest pressed yes. */
const UNNUMBERED = new Set<InvitePart>(["plate", "after", "signoff"]);

export function FileInvite({
  event: e, greeting, reply, after, plate, gifts, skipAnimation,
}: {
  event: PublicEvent;
  greeting: string;
  reply: React.ReactNode;
  after?: React.ReactNode;
  plate?: React.ReactNode;
  gifts?: React.ReactNode;
  skipAnimation?: boolean;
}) {
  const maps = mapsLink(e);
  const notes = orderedNotes(e);
  const contacts = askContacts(e);
  const photos = photoLine(e);
  const face = portraitFor(e.invite_image_path);
  const when = [formatInviteDate(e.date), lower(formatTimeRange(e.start_time, e.end_time, e.time_note))]
    .filter(Boolean).join(", ");

  // Which parts are drawn, in the host's order, before anything is numbered: the number depends
  // on the ones before it, so it cannot be decided part by part.
  const order = orderedParts(e.section_order);
  const drawn = order.filter((p) => has(e, p, plate, gifts));
  const numberOf = new Map<InvitePart, string>();
  let n = 0;
  for (const p of drawn) if (!UNNUMBERED.has(p)) numberOf.set(p, String(++n).padStart(2, "0"));
  const head = (part: InvitePart, title: string, big?: boolean) => (
    <div className="head">
      {numberOf.has(part) && <span className="num">{numberOf.get(part)}</span>}
      <span className={big ? "h big" : "h"}>{title}</span>
    </div>
  );

  const draw: Record<InvitePart, React.ReactNode> = {
    updates: e.updates.length > 0 ? (
      <section data-section="updates" className="part">
        {head("updates", copy.sections.updates)}
        <div className="notes">
          {e.updates.map((u, i) => (
            <div className="line" key={i}><Mono name="bubble" size={30} /><div>{u.body}</div></div>
          ))}
        </div>
      </section>
    ) : null,

    details: e.show_details ? (
      <section data-section="details" className="part">
        {head("details", copy.sections.details)}
        <div className="grid">
          {when && <><Mono name="clock" size={36} /><div className="w">{when}</div></>}
          {(e.venue || e.address) && <><Mono name="map" size={36} /><div className="w">{e.venue || e.address}</div></>}
        </div>
        {/* A dashed box with an empty tick beside it: the one thing on this sheet a guest is
            meant to go and do. */}
        {maps && (
          <a className="stamp-btn" href={maps} target="_blank" rel="noreferrer">
            <span className="box" aria-hidden="true" />{copy.sections.openInMaps}
          </a>
        )}
      </section>
    ) : null,

    // The shared reply. The number and the form's own RSVP heading have to share one line, and
    // the heading belongs to the form, so the section is a grid and the form is display:contents.
    // See app/file.css.
    reply: (
      <section data-section="reply" className="part reply">
        {numberOf.has("reply") && <span className="num">{numberOf.get("reply")}</span>}
        {reply}
      </section>
    ),

    day: e.show_runsheet && e.runsheet.length > 0 ? (
      <section data-section="day" className="part">
        {head("day", PART_NAMES.day)}
        {e.runsheet.map((s, i) => (
          <div className="stop" key={i}>
            <div className="t">{formatTime(s.time)}</div>
            <Mono name={hasMono(s.icon) ? s.icon! : "clock"} size={40} />
            <div>
              <div className="n">{s.title}</div>
              {s.note && <div className="b">{s.note}</div>}
            </div>
          </div>
        ))}
      </section>
    ) : null,

    know: e.show_good_to_know && notes.length > 0 ? (
      <section data-section="know" className="part">
        {head("know", copy.sections.goodToKnow)}
        {/* Post-its, two to a row. The colour and the tilt follow the note's place in the list,
            so a fifth note starts the four again rather than running out of colours. */}
        <div className="stickies">
          {notes.map((l, i) => (
            <div className={`sticky c${i % 4}`} key={i}>
              <Mono name={monoNote(l.kind, l.text)} size={30} />
              <div className="w">{l.text}</div>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    plate,

    gifts: gifts ?? (e.show_gifts && hasGifts(e) ? (
      <section data-section="gifts" className="part">
        {head("gifts", copy.sections.gifts)}
        <GiftsContent e={e} />
      </section>
    ) : null),

    after: e.show_after ? (
      <section data-section="after" className="part after">
        <div className="cell">
          <Mono name="bubble" size={44} />
          <span className="n">{copy.sections.askHeading}</span>
          {contacts.map((c) => (c.sms
            ? <a className="b" key={c.key} href={c.sms}>{c.label}</a>
            : <span className="b" key={c.key}>{c.label}</span>))}
        </div>
        {photos && (
          <div className="cell">
            <Mono name="camera" size={44} />
            <span className="n">{copy.sections.photos}</span>
            <span className="b">{photos}</span>
          </div>
        )}
      </section>
    ) : null,

    signoff: e.show_signoff !== false ? (
      <section data-section="signoff" className="part signoff">
        <div className="sticky big">
          <p className="msg">{signoffMessage(e)}</p>
          {e.host_line && <p className="from">{e.host_line}</p>}
        </div>
      </section>
    ) : null,
  };

  return (
    <main className="file">
      {/* A white band the full width of the page, with the lanyard starting behind it. */}
      <p className="greet">{greeting}</p>
      <Envelope
        stock="manila"
        openLabel={copy.envelope.open}
        skipAnimation={skipAnimation}
        bodyClassName="file-body"
        seal={<Closure face={face?.src ?? null} />}
        cover={
          <div className="cover" data-section="cover">
            <div className="pass-group">
              <span className="lanyard" aria-hidden="true"><i className="strap l" /><i className="strap r" /></span>
              <span className="crimp" aria-hidden="true" />
              <span className="ring" aria-hidden="true" />
              <span className="tab" aria-hidden="true" />
              <div className="pass">
                <div className="top">
                  <span className="slot" aria-hidden="true" />
                  <span className="eyebrow">{copy.sections.scarerWanted}</span>
                </div>
                <div className="body">
                  {face && (
                    <div className="photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={face.src} alt="" width={face.w} height={face.h} />
                    </div>
                  )}
                  <h1>{e.title}</h1>
                  {e.intro && <p className="intro">{e.intro}</p>}
                </div>
                <span className="foot" aria-hidden="true" />
              </div>
            </div>
          </div>
        }
      >
        <div className="board">
          <span className="clip" aria-hidden="true"><i /></span>
          <div className="ruled">
            {drawn.map((p) => <div className="strip" key={p}>{draw[p]}</div>)}
          </div>
        </div>
        {after}
      </Envelope>
    </main>
  );
}

// The envelope's closure, which is a string-and-button tie rather than a wax seal, with the
// polaroid of the character clipped beside it. Both hang off this one node because the envelope
// gives a seal a place and a mascot a place, and the polaroid needs the seal's.
function Closure({ face }: { face: string | null }) {
  return (
    <span className="tie" aria-hidden="true">
      {/* The string, wound in a figure of eight between the two buttons. One path, drawn rather
          than described, because two curves crossing is not a thing CSS has. */}
      <svg className="string" viewBox="0 0 60 120" width="60" height="120">
        <path d="M30 22 C 6 42, 54 62, 30 94 M30 22 C 54 42, 6 62, 30 94" fill="none" stroke="#8A6A30" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="button top"><span className="pupilled"><i /></span></span>
      <span className="button bottom" />
      {face && (
        <span className="polaroid">
          {/* A background rather than an img on purpose. The same picture is the photograph on
              the pass, and while the envelope is shut the pass is in the card slot and this is
              on the seal: two elements with one filename. Anything looking for that picture on
              the page finds whichever comes first in the document, and once the envelope is open
              this one is inside a hidden stage and measures nothing at all. */}
          <span className="pic" style={{ backgroundImage: `url(${face})` }} />
          <i className="paperclip a" />
          <i className="paperclip b" />
        </span>
      )}
    </span>
  );
}

/** Whether a part draws anything, so the numbering counts what is on the sheet. */
function has(e: PublicEvent, p: InvitePart, plate: React.ReactNode, gifts: React.ReactNode): boolean {
  switch (p) {
    case "updates": return e.updates.length > 0;
    case "details": return Boolean(e.show_details);
    case "reply": return true;
    case "day": return Boolean(e.show_runsheet) && e.runsheet.length > 0;
    case "know": return Boolean(e.show_good_to_know) && orderedNotes(e).length > 0;
    case "plate": return Boolean(plate);
    case "gifts": return Boolean(gifts) || (Boolean(e.show_gifts) && hasGifts(e));
    case "after": return Boolean(e.show_after);
    case "signoff": return e.show_signoff !== false;
  }
}

/** The first letter down, and nothing else touched: "From 2pm" after a date reads as a new
 *  sentence, "from 2pm" reads as the rest of the one it is in. */
function lower(s: string): string {
  return s ? s[0].toLowerCase() + s.slice(1) : s;
}
