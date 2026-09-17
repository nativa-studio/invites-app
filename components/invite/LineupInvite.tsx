import Image from "next/image";
import "@/app/lineup.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { formatInviteDate, formatTime, formatTimeRange, hostName } from "@/lib/format";
import { mapsLink } from "./Cards";

// Colours lifted from the artwork, used for the dots beside each good-to-know line.
const DOTS = ["#EFB93C", "#7FAF95", "#93C7D6", "#E8763C", "#E0553F", "#3F6B57"];

function goodToKnow(e: PublicEvent): string[] {
  const lines: string[] = [];
  if (e.serve_text) lines.push(e.serve_text);
  if (e.plate_enabled && e.plate_host_note) lines.push(e.plate_host_note);
  if (e.type === "kids_party" && e.parents_mode === "stay") {
    lines.push(e.siblings_welcome ? `${copy.lines.parentsStay} ${copy.lines.siblingsWelcome}` : copy.lines.parentsStay);
  }
  if (e.type === "kids_party" && e.parents_mode === "drop_off") lines.push(copy.lines.dropOff);
  if (e.gift_stance === "none") lines.push(copy.lines.giftsNone);
  if (e.gift_stance === "optional") lines.push(e.gift_note ? `${copy.lines.giftsOptional} ${e.gift_note}` : copy.lines.giftsOptional);
  if (e.photo_sharing === "kids_off_social") lines.push(copy.lines.photosKidsOff);
  if (e.photo_sharing === "ask") lines.push(copy.lines.photosAsk);
  if (e.photo_sharing === "share") lines.push(copy.lines.photosShare);
  if (e.good_to_know) lines.push(e.good_to_know);
  return lines;
}

// The layout itself, with the reply passed in: a personal link hands it the RSVP, the group
// link hands it the "Who's this from?" form. Same page either way.
export function LineupInvite({ event: e, greeting, reply }: { event: PublicEvent; greeting: string; reply: React.ReactNode }) {
  const host = hostName(e.host_line);
  const age = e.title.match(/turning (\d+)/i)?.[1];
  const maps = mapsLink(e);
  const notes = goodToKnow(e);
  const artwork = e.invite_image_path;

  return (
    <main className="lineup">
      <div className="page">
        <p className="greet">{greeting}</p>

        <header>
          <p className="eyebrow">{age ? "Trainer wanted" : "You're invited"}</p>
          <h1 className="title">{e.title}</h1>
          {e.intro && <p className="sub pad">{e.intro}</p>}
          <p className="when">
            {formatInviteDate(e.date)}
            <br />
            {formatTimeRange(e.start_time, e.end_time, e.time_note)}
          </p>
          {e.host_line && <p className="from">{e.host_line}</p>}
          {artwork
            ? <div className="art"><Image src={artwork} alt="" width={1173} height={420} priority sizes="(max-width: 430px) 100vw, 430px" /></div>
            : <div className="artless" />}
        </header>

        <div className="pad">
          {e.show_details && (
          <section>
            <p className="label">{copy.sections.details}</p>
            <div className="kv">
              <div className="k">{copy.sections.when}</div>
              <div>{formatInviteDate(e.date)}, {formatTimeRange(e.start_time, e.end_time, e.time_note).toLowerCase()}</div>
              <div className="k">{copy.sections.where}</div>
              <div>{e.venue}{e.address ? <><br />{e.address}</> : null}</div>
              {e.what_to_bring && <><div className="k">{copy.sections.wear}</div><div>{e.what_to_bring}</div></>}
            </div>
            {maps && <div style={{ textAlign: "center" }}><a className="maps" href={maps} target="_blank" rel="noreferrer">{copy.sections.openInMaps}</a></div>}
          </section>
          )}

          {e.show_runsheet && e.runsheet.length > 0 && (
            <section>
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
            <section>
              <p className="label">{copy.sections.goodToKnow}</p>
              <div className="notes">
                {notes.map((line, i) => (
                  <p className="note-line" key={i}>
                    <span className="dot" style={{ background: DOTS[i % DOTS.length] }} />
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            </section>
          )}

          <section>{reply}</section>

          {e.show_after && (
          <section>
            <div className="after">
              <div><div className="n">{copy.sections.updates}</div><div className="b">{copy.sections.updatesBody}</div></div>
              <div><div className="n">{copy.sections.photos}</div><div className="b">{copy.sections.photosBody}</div></div>
            </div>
          </section>
          )}

          <p className="foot">
            {e.host_phone ? <a href={`sms:${e.host_phone.replace(/[^\d+]/g, "")}`}>{copy.sections.questions(host)}</a> : copy.sections.questions(host)}
          </p>
        </div>
      </div>
    </main>
  );
}
