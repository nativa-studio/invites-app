import Image from "next/image";
import "@/app/peek.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { goodToKnow } from "@/lib/good-to-know";
import { formatInviteDate, formatTime, formatTimeRange, hostName } from "@/lib/format";
import { castFor, type PeekChar } from "@/lib/artwork";
import { mapsLink } from "./Cards";

// Colours lifted off the characters themselves, so the words and the drawings agree.
const TITLE_INK = ["#D2452F", "#2F7D96", "#3F6B57", "#B4762A"];
const DOTS = ["#E8763C", "#3F6B57", "#3B7E96", "#D06A84", "#C9942A", "#8A5A34"];


// A word at a time, so the title carries the same colours as the drawings. A number on the end
// is the age, and gets a badge rather than a colour, because it is the one word a four year old
// can already read.
function Title({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  const tail = words[words.length - 1] ?? "";
  const badge = /^\d{1,2}$/.test(tail) && words.length > 1;
  const said = badge ? words.slice(0, -1) : words;
  return (
    <h1 className="title">
      {said.map((w, i) => (
        <span key={i} style={{ color: TITLE_INK[i % TITLE_INK.length] }}>{w}{i < said.length - 1 || badge ? " " : ""}</span>
      ))}
      {badge ? <span className="age">{tail}</span> : null}
    </h1>
  );
}

function Peeker({ who, side }: { who: PeekChar | undefined; side: "left" | "right" }) {
  if (!who) return null;
  return (
    <Image className={`peeker ${side}`} src={who.src} alt={who.alt} width={who.w} height={who.h} sizes="200px" />
  );
}

// The layout itself, with the reply passed in: a personal link hands it the RSVP, the group
// link hands it the "Who's this from?" form. Same page either way.
export function PeekInvite({ event: e, greeting, reply }: { event: PublicEvent; greeting: string; reply: React.ReactNode }) {
  const host = hostName(e.host_line);
  const age = e.title.match(/turning (\d+)/i)?.[1];
  const maps = mapsLink(e);
  const notes = goodToKnow(e);
  const cast = castFor(e.invite_image_path);
  // The group link's greeting is already "You're invited", so the eyebrow would say it twice.
  const eyebrow = age ? "Trainer wanted" : "You're invited";

  return (
    <main className="peek">
      <div className="page">
        <p className="greet">{greeting}</p>

        <header className="cover" data-section="cover">
          <Peeker who={cast.topLeft} side="left" />
          <Peeker who={cast.topRight} side="right" />
          {eyebrow.toLowerCase() !== greeting.toLowerCase() && <p className="eyebrow">{eyebrow}</p>}
          <Title text={e.title} />
          {e.intro && <p className="sub">{e.intro}</p>}
          {/* The details section repeats these, so the cover only carries them when it is off. */}
          {!e.show_details && (
            <p className="when">
              <span className="day">{formatInviteDate(e.date)}</span>
              <span className="hour">{formatTimeRange(e.start_time, e.end_time, e.time_note)}</span>
            </p>
          )}
          {e.host_line && <p className="from">{e.host_line}</p>}
          {cast.hero ? (
            <div className="ground">
              <Image className="hero" src={cast.hero.src} alt={cast.hero.alt} width={cast.hero.w} height={cast.hero.h} priority sizes="300px" />
            </div>
          ) : (
            <span className="heroless" />
          )}
        </header>

        {e.show_details && (
        <section className="s sky" data-section="details">
          <Peeker who={cast.details} side="left" />
          <p className="label">{copy.sections.details}</p>
          <div className="kv">
            <div className="k">{copy.sections.when}</div>
            <div>{formatInviteDate(e.date)}, {formatTimeRange(e.start_time, e.end_time, e.time_note).toLowerCase()}</div>
            <div className="k">{copy.sections.where}</div>
            <div>{e.venue}{e.address ? <><br />{e.address}</> : null}</div>
          </div>
          {maps && <div className="mid"><a className="maps" href={maps} target="_blank" rel="noreferrer">{copy.sections.openInMaps}</a></div>}
        </section>
        )}

        <section className="s butter">
          <Peeker who={cast.reply} side="right" />
          {reply}
        </section>

        {e.show_runsheet && e.runsheet.length > 0 && (
          <section className="s sand" data-section="day">
            <Peeker who={cast.day} side="right" />
            <p className="label">{copy.sections.afternoon}</p>
            <div className="stops">
              {e.runsheet.map((s, i) => (
                <div className="stop" key={i}>
                  <span className="t">{formatTime(s.time)}</span>
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
          <section className="s blush" data-section="know">
            <Peeker who={cast.know} side="left" />
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


        {/* Peek had no updates and photos section at all, so its switch on the Layout tab did
            nothing. Every other look has one. */}
        {e.show_after && (
          <section className="s blush" data-section="after">
            <p className="label">{copy.sections.askHeading}</p>
            <div className="mid">
              {e.host_phone
                ? <a className="maps" href={`sms:${e.host_phone.replace(/[^\d+]/g, "")}`}>{copy.sections.askBody(host)}</a>
                : <p className="note-line"><span>{copy.sections.askBody(host)}</span></p>}
            </div>
          </section>
        )}


      </div>
    </main>
  );
}
