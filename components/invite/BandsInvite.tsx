import React from "react";
import "@/app/bands.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { orderedNotes } from "@/lib/good-to-know";
import { orderedParts, PART_NAMES, type InvitePart } from "@/lib/invite-parts";
import { formatInviteDate, formatTime, formatTimeRange } from "@/lib/format";
import { askContacts, photoLine, signoffMessage } from "@/lib/ask-line";
import { mapsLink } from "./Cards";
import { Mono, monoNote, hasMono } from "@/components/art/mono";
import { coverFor, mascotFor } from "@/lib/artwork";
import { Envelope } from "./Envelope";
import { GiftsContent, hasGifts } from "./GiftsContent";

// Fur bands: no cards, no page margins, one full-bleed colour band per part.
//
// Approved 25 September 2026 with the Monsters theme. The shape of it is that every part of the
// invite is its own strip of colour edge to edge, and each strip has a scalloped fur edge along
// its top, drawn in the band's own colour so the bands look like they overlap. The characters
// stand on the cover, and one big eye watches the reply from the seam above it.
//
// Every value here is lifted from design_handoff_monster_layouts/reference/bands-page.html and
// measured against spec/golden.json. Nothing in it is a judgement of mine, which is why there are
// numbers in the CSS with no round-number logic behind them.
//
// The order is the host's, the same `section_order` every other design reads.

export function BandsInvite({
  event: e, greeting, reply, after, plate, gifts, skipAnimation,
}: {
  event: PublicEvent;
  greeting: string;
  reply: React.ReactNode;
  /** About this app, last of everything, and null when the host has switched it off. */
  after?: React.ReactNode;
  /** Bring a plate, drawn by whoever owns the guest's answer. */
  plate?: React.ReactNode;
  /** The editor's gifts card, which draws faded when the block is off. Given, it wins. */
  gifts?: React.ReactNode;
  skipAnimation?: boolean;
}) {
  const maps = mapsLink(e);
  const notes = orderedNotes(e);
  const contacts = askContacts(e);
  const photos = photoLine(e);
  const cast = coverFor(e.invite_image_path);
  // The sticker on the envelope, handed to the stylesheet rather than drawn as an element. It is
  // the same picture as the cover, and an <img> for it inside the envelope would be a second
  // element with the same filename: anything looking for that picture on the page finds
  // whichever comes first, and once the envelope is open this one is in a hidden stage.
  const sticker = mascotFor(e.invite_image_path);
  // The date and the time on one line, the way the design draws them. The time is lower-cased
  // where it follows the date, because a host writes their note as a sentence ("From 2pm, come
  // when you can") and a capital in the middle of one reads as two sentences run together.
  const when = [formatInviteDate(e.date), lower(formatTimeRange(e.start_time, e.end_time, e.time_note))]
    .filter(Boolean).join(", ");

  const draw: Record<InvitePart, React.ReactNode> = {
    updates: e.updates.length > 0 ? (
      <section data-section="updates" className="band updates">
        <h2>{copy.sections.updates}</h2>
        <div className="lines wide">
          {e.updates.map((u, i) => (
            <div className="item" key={i}><Mono name="bubble" size={40} /><div>{u.body}</div></div>
          ))}
        </div>
      </section>
    ) : null,

    details: e.show_details ? (
      <section data-section="details" className="band details">
        <h2>{copy.sections.details}</h2>
        <div className="lines">
          {when && <div className="item"><Mono name="clock" size={40} /><div>{when}</div></div>}
          {(e.venue || e.address) && (
            <div className="item">
              <Mono name="map" size={40} />
              {/* Open in Maps reads inline after the place, not as a button under it: this design
                  has no cards to put a button on, and a pill in the middle of a colour band was
                  the loudest thing on the page. */}
              <div className="where">
                {e.venue || e.address}
                {maps && <a href={maps} target="_blank" rel="noreferrer">{copy.sections.openInMaps}</a>}
              </div>
            </div>
          )}
        </div>
      </section>
    ) : null,

    // The shared reply, in the purple band. Not rebuilt: `reply` arrives as one node holding the
    // plate announcement, the RSVP form and the calendar buttons, and every one of its classes is
    // restyled under main.bands in app/bands.css. See the handoff README, section 5a.
    reply: (
      <section data-section="reply" className="band reply">
        <Eye size={76} />
        {reply}
      </section>
    ),

    day: e.show_runsheet && e.runsheet.length > 0 ? (
      <section data-section="day" className="band day">
        {/* The long name, which is the one the design draws and the one the host sees against
            this part in their own list. copy.sections.day is the short one the suite uses on a
            card that has less room. Both are existing wording. */}
        <h2>{PART_NAMES.day}</h2>
        <div className="stops">
          {e.runsheet.map((s, i) => (
            <div className="stop" key={i}>
              <div className="t">{formatTime(s.time)}</div>
              <Mono name={hasMono(s.icon) ? s.icon! : "clock"} size={48} />
              <div>
                <div className="n">{s.title}</div>
                {s.note && <div className="b">{s.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    know: e.show_good_to_know && notes.length > 0 ? (
      <section data-section="know" className="band know">
        <h2>{copy.sections.goodToKnow}</h2>
        <div className="lines wide">
          {notes.map((l, i) => (
            <div className="item" key={i}><Mono name={monoNote(l.kind, l.text)} size={40} /><div>{l.text}</div></div>
          ))}
        </div>
      </section>
    ) : null,

    plate,

    gifts: gifts ?? (e.show_gifts && hasGifts(e) ? (
      <section data-section="gifts" className="band gifts">
        <h2>{copy.sections.gifts}</h2>
        <div className="inner"><GiftsContent e={e} /></div>
      </section>
    ) : null),

    after: e.show_after ? (
      <section data-section="after" className="band after">
        <div className="cells">
          <div className="cell">
            <Mono name="bubble" size={48} />
            <span className="n">{copy.sections.askHeading}</span>
            {contacts.map((c) => (c.sms
              ? <a className="b" key={c.key} href={c.sms}>{c.label}</a>
              : <span className="b" key={c.key}>{c.label}</span>))}
          </div>
          {photos && (
            <div className="cell">
              <Mono name="camera" size={48} />
              <span className="n">{copy.sections.photos}</span>
              <span className="b">{photos}</span>
            </div>
          )}
        </div>
      </section>
    ) : null,

    signoff: e.show_signoff !== false ? (
      <section data-section="signoff" className="band signoff">
        <Eye size={44} />
        <p className="msg">{signoffMessage(e)}</p>
        {e.host_line && <p className="from">{e.host_line}</p>}
      </section>
    ) : null,
  };

  const parts = orderedParts(e.section_order).map((p) => draw[p]).filter(Boolean);

  return (
    <main className="bands" style={sticker ? ({ "--cast": `url(${sticker.src})` } as React.CSSProperties) : undefined}>
      <p className="greet">{greeting}</p>
      <Envelope
        stock="fur"
        openLabel={copy.envelope.open}
        skipAnimation={skipAnimation}
        bodyClassName="bands-body"
        seal={<Eye size={24} bare />}
        cover={
          /* One element around the whole cover, so it is one thing to point a pencil at: the
             drawer behind it holds the title and the line under it, and marking only the title
             left the picture and the eyebrow doing nothing. */
          <div className="cover" data-section="cover">
            <p className="eyebrow">{copy.sections.scarerWanted}</p>
            <h1>{e.title}</h1>
            {e.intro && <p className="intro">{e.intro}</p>}
            {cast && (
              <div className="cast">
                {/* A plain img, not next/image: the picture is masked at both edges so it fades
                    into the page rather than ending on a line, and it is one bundled file at a
                    known size, so there is nothing for the optimiser to decide. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cast.src} alt="" width={cast.w} height={cast.h} />
              </div>
            )}
          </div>
        }
      >
        {parts.map((node, i) => <React.Fragment key={i}>{node}</React.Fragment>)}
        {after}
      </Envelope>
    </main>
  );
}

// The eye. Three rings: white, then the iris, then the pupil, and nothing about it is text.
//
// It is the one piece of furniture this design has instead of cards, and it appears three times
// at three sizes: half over the top edge of the reply band, small at the top of the sign-off, and
// on the envelope's seal. `bare` is the seal's, which sits inside a seal that already has the
// white disc and the ring.
function Eye({ size, bare }: { size: number; bare?: boolean }) {
  // Bare is the seal's: there the envelope already draws the white disc and the ink ring, so the
  // eye is the iris itself rather than an eye with a white of its own.
  const iris = bare ? size : Math.round(size * 0.5);
  const pupil = Math.round(size * (bare ? 0.46 : 0.21));
  return bare ? (
    <span className="eye bare" aria-hidden="true" style={{ width: iris, height: iris }}>
      <span className="pupil" style={{ width: pupil, height: pupil }} />
    </span>
  ) : (
    <span className="eye" aria-hidden="true" style={{ width: size, height: size }}>
      <span className="iris" style={{ width: iris, height: iris }}>
        <span className="pupil" style={{ width: pupil, height: pupil }} />
      </span>
    </span>
  );
}

/** The first letter down, and nothing else touched. "From 2pm" after a date reads as a new
 *  sentence; "from 2pm" reads as the rest of the one it is in. */
function lower(s: string): string {
  return s ? s[0].toLowerCase() + s.slice(1) : s;
}
