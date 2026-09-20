import React from "react";
import "@/app/strip.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { orderedNotes } from "@/lib/good-to-know";
import { orderedParts, type InvitePart } from "@/lib/invite-parts";
import { formatInviteDate, formatTime, formatTimeRange } from "@/lib/format";
import { askContacts, photoLine, signoffMessage } from "@/lib/ask-line";
import { mapsLink } from "./Cards";
import { Mono, monoNote, hasMono } from "@/components/art/mono";
import { stripSet, inkFor, paperFor } from "@/lib/strip-set";
import { Envelope } from "./Envelope";

// The illustrated strip: one ink on paper, straight down the page, no envelope and no cards.
//
// It is the one design in the range that carries no photograph and no character, which is the
// whole point of it: every other look in the app is somebody's artwork, and a host running a
// memorial or a housewarming has nothing to put there. The pictures here are drawn from the
// event's own theme, so an invite made in thirty seconds still has a cover.
//
// The order is the host's, the same `section_order` the suite reads, rather than the fixed one
// on the round one board. The board predates hosts being able to arrange their own invite, and
// two orders for the same invite is the fault that CLAUDE.md is mostly about.

function Rule() {
  return <div className="rule" />;
}

export function StripInvite({
  event: e, greeting, reply, after, plate, skipAnimation,
}: {
  event: PublicEvent;
  greeting: string;
  reply: React.ReactNode;
  /** About this app, last of everything. */
  after?: React.ReactNode;
  /** Bring a plate, drawn by whoever owns the guest's answer. */
  plate?: React.ReactNode;
  skipAnimation?: boolean;
}) {
  const set = stripSet(e.strip_set, e.theme_id);
  const ink = inkFor(e.ink);
  const paper = paperFor(e.ink);
  const maps = mapsLink(e);
  const notes = orderedNotes(e);
  const contacts = askContacts(e);
  const photos = photoLine(e);

  const draw: Record<InvitePart, React.ReactNode> = {
    updates: e.updates.length > 0 ? (
      <section data-section="updates">
        <p className="label">{copy.sections.updates}</p>
        <div className="lines">
          {e.updates.map((u, i) => (
            <div className="line" key={i}><Mono name="bubble" size={40} /><div>{u.body}</div></div>
          ))}
        </div>
      </section>
    ) : null,

    details: e.show_details ? (
      <section data-section="details">
        <p className="label">{copy.sections.details}</p>
        <p className="para">
          {formatInviteDate(e.date)}<br />
          {formatTimeRange(e.start_time, e.end_time, e.time_note)}
          {e.venue ? <><br />{e.venue}</> : null}
          {e.address ? <><br />{e.address}</> : null}
        </p>
        {maps && <a className="maps" href={maps} target="_blank" rel="noreferrer"><Mono name="map" size={22} />{copy.sections.openInMaps}</a>}
      </section>
    ) : null,

    reply: <section>{reply}</section>,

    day: e.show_runsheet && e.runsheet.length > 0 ? (
      <section data-section="day">
        <p className="label">{copy.sections.day}</p>
        <div className="stops">
          {e.runsheet.map((s, i) => (
            <div className="stop" key={i}>
              <div className="t">{formatTime(s.time)}</div>
              {/* A stop whose picture is not in this set draws the clock rather than the wrong
                  thing: the runsheet stores a name from the poster set, and the two sets do not
                  hold all the same subjects. */}
              <div className="pic"><Mono name={hasMono(s.icon) ? s.icon! : "clock"} size={44} /></div>
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
      <section data-section="know">
        <p className="label">{copy.sections.goodToKnow}</p>
        <div className="lines">
          {notes.map((l, i) => (
            <div className="line" key={i}><Mono name={monoNote(l.kind, l.text)} size={40} /><div>{l.text}</div></div>
          ))}
        </div>
      </section>
    ) : null,

    plate: plate ?? null,

    after: e.show_after ? (
      <section data-section="after">
        <div className={photos ? "after" : "after one"}>
          <div>
            <Mono name="bubble" size={48} />
            <div className="n">{copy.sections.askHeading}</div>
            {contacts.map((c) => (
              c.sms
                ? <a className="b" key={c.key} href={c.sms}>{c.label}</a>
                : <span className="b" key={c.key}>{c.label}</span>
            ))}
          </div>
          {photos && (
            <div>
              <Mono name="camera" size={48} />
              <div className="n">{copy.sections.photos}</div>
              <span className="b">{photos}</span>
            </div>
          )}
        </div>
      </section>
    ) : null,

    // Absent means on, the same rule every other layout follows.
    signoff: e.show_signoff !== false ? (
      <section data-section="signoff" className="signoff">
        <p className="msg">{signoffMessage(e)}</p>
        {e.host_line && <p className="from">{e.host_line}</p>}
      </section>
    ) : null,
  };

  const parts = orderedParts(e.section_order).map((p) => draw[p]).filter(Boolean);

  return (
    <main className="strip" style={{ "--ink": ink, "--paper": paper } as React.CSSProperties}>
      <div className="page">
        <p className="greet">{greeting}</p>
        {/* The same envelope every other design uses, cut from this one's two colours. It was
            built without one, and the opening is the part of this product that does not survive
            being described: the children ask to watch it again. So the strip gets it too, and
            gets it from the same component, because an animation written twice is an animation
            that drifts.
            The wax carries the middle doodle of the event's own set, so a Diwali invite is sealed
            with a diya and a birthday with a cake. */}
        <Envelope
          stock="ink"
          openLabel={copy.envelope.open}
          skipAnimation={skipAnimation}
          bodyClassName="strip-body"
          seal={<Mono name={set.trio[1]} size={26} />}
          cover={
            /* Three doodles and the title, and no photograph: when uploads land, an uploaded
               invite replaces these two and everything below stays exactly as it is.
               One element around all three, because data-section is the handle the host's editor
               edits by and the drawer behind it holds the title and the line under it. Marked on
               the doodles alone, tapping the title did nothing, which is the one place on the
               cover a host is most likely to tap. */
            <div className="cover" data-section="cover">
              <div className="trio">
                {set.trio.map((n, i) => <Mono key={i} name={n} size={56} />)}
              </div>
              <h1>{e.title}</h1>
              {e.intro && <p className="para">{e.intro}</p>}
            </div>
          }
        >
          {parts.map((node, i) => (
            <React.Fragment key={i}>
              <Rule />
              {node}
            </React.Fragment>
          ))}
          {after}
        </Envelope>
      </div>
    </main>
  );
}
