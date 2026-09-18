import Image from "next/image";
import "@/app/lineup.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { goodToKnow } from "@/lib/good-to-know";
import { formatInviteDate, formatTime, formatTimeRange, hostName } from "@/lib/format";
import { mapsLink, WhenWhere } from "./Cards";
import { ScrollCue } from "./ScrollCue";
import { bandFor } from "@/lib/artwork";

// Colours lifted from the artwork, used for the dots beside each good-to-know line.
const DOTS = ["#EFB93C", "#7FAF95", "#93C7D6", "#E8763C", "#E0553F", "#3F6B57"];


// The layout itself, with the reply passed in: a personal link hands it the RSVP, the group
// link hands it the "Who's this from?" form. Same page either way.
export function LineupInvite({ event: e, greeting, reply }: { event: PublicEvent; greeting: string; reply: React.ReactNode }) {
  const host = hostName(e.host_line);
  const age = e.title.match(/turning (\d+)/i)?.[1];
  const maps = mapsLink(e);
  const notes = goodToKnow(e);
  const artwork = bandFor(e.invite_image_path);

  return (
    <main className="lineup">
      <div className="page">
        <p className="greet">{greeting}</p>

        <header data-section="cover">
          <p className="eyebrow">{age ? "Trainer wanted" : "You're invited"}</p>
          <h1 className="title">{e.title}</h1>
          {e.intro && <p className="sub pad">{e.intro}</p>}
          {/* The details section repeats these, so the cover only carries them when it is off. */}
          {!e.show_details && (
            <p className="when">
              {formatInviteDate(e.date)}
              <br />
              {formatTimeRange(e.start_time, e.end_time, e.time_note)}
            </p>
          )}
          {e.host_line && <p className="from">{e.host_line}</p>}
          {artwork
            ? <div className="art"><Image src={artwork.src} alt="" width={artwork.w} height={artwork.h} priority sizes="(max-width: 430px) 100vw, 430px" /></div>
            : <div className="artless" />}
        </header>

        <div className="pad">
          {e.show_details && (
          <section data-section="details">
            <p className="label">{copy.sections.details}</p>
            <WhenWhere e={e} />
            {maps && <div style={{ textAlign: "center" }}><a className="maps" href={maps} target="_blank" rel="noreferrer">{copy.sections.openInMaps}</a></div>}
          </section>
          )}

          <section>{reply}</section>

          {e.show_runsheet && e.runsheet.length > 0 && (
            <section data-section="day">
              <p className="label">{copy.sections.afternoon}</p>
              <div className="stops">
                {e.runsheet.map((s, i) => (
                  <div className="stop" key={i}>
                    <div className="t">{formatTime(s.time)}</div>
                    <div className="body">
                      <div className="n">{s.title}</div>
                      {s.note && <div className="b">{s.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {e.show_good_to_know && notes.length > 0 && (
            <section data-section="know">
              <p className="label">{copy.sections.goodToKnow}</p>
              <div className="notes">
                {notes.map(({ text }, i) => (
                  <p className="note-line" key={i}>
                    <span className="dot" style={{ background: DOTS[i % DOTS.length] }} />
                    <span>{text}</span>
                  </p>
                ))}
              </div>
            </section>
          )}

          {e.show_after && (
          <section data-section="after">
            <p className="label">{copy.sections.askHeading}</p>
            <div style={{ textAlign: "center" }}>
              {e.host_phone
                ? <a className="maps" href={`sms:${e.host_phone.replace(/[^\d+]/g, "")}`}>{copy.sections.askBody(host)}</a>
                : <p className="note-line"><span>{copy.sections.askBody(host)}</span></p>}
            </div>
          </section>
          )}


        </div>
      </div>
      <ScrollCue anchor="header" />
    </main>
  );
}
