import "@/app/lineup.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { orderedNotes } from "@/lib/good-to-know";
import { GiftsContent, hasGifts } from "./GiftsContent";
import { formatTime } from "@/lib/format";
import { askLine, askPhoneSuffix, askSms, photoLine, signoffMessage } from "@/lib/ask-line";
import { mapsLink, WhenWhere } from "./Cards";
import { mascotFor } from "@/lib/artwork";
import { Envelope } from "./Envelope";
import { LineupCover } from "./LineupCover";
import { Bolt, Bubble, Camera } from "@/components/art/icons";

// Colours lifted from the artwork, used for the dots beside each good-to-know line.
const DOTS = ["#EFB93C", "#7FAF95", "#93C7D6", "#E8763C", "#E0553F", "#3F6B57"];


// The layout itself, with the reply passed in: a personal link hands it the RSVP, the group link
// hands it the reply form. Same page either way.
//
// The cover arrives in an envelope, the same one the suite uses. The lineup has no card of its
// own, so its header is the card: the eyebrow, the title, the line under it and the artwork band,
// on a panel rather than bare on the page, so there is something for the envelope to hand over.
// Everything below follows once it has opened.
export function LineupInvite({
  event: e, greeting, reply, after, plate, gifts, skipAnimation,
}: {
  event: PublicEvent;
  greeting: string;
  reply: React.ReactNode;
  /** The very last thing inside the envelope, after the sign-off. The suite puts About this app
   *  here; this layout had nowhere to put it, so it had none at all. */
  after?: React.ReactNode;
  /** Bring a plate, which this layout puts after the info booth like the suite does. */
  plate?: React.ReactNode;
  /** The editor's own gifts block, which draws faded when it is off. */
  gifts?: React.ReactNode;
  skipAnimation?: boolean;
}) {
  const maps = mapsLink(e);
  const notes = orderedNotes(e);

  return (
    <main className="lineup">
      <div className="page">
        <p className="greet">{greeting}</p>

        <Envelope
          stock="beige"
          openLabel={copy.envelope.open}
          skipAnimation={skipAnimation}
          mascot={mascotFor(e.invite_image_path)}
          bodyClassName="suite lineup-body"
          cover={<LineupCover event={e} />}
        >
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

          {plate}

          {/* Gifts, after the plate, the order the suite uses: both are things a guest carries,
              so they read as a pair. Added when the info booth stopped carrying a gifts line,
              which would otherwise have taken gifts off this layout altogether. */}
          {gifts ?? (e.show_gifts && hasGifts(e) ? (
            <section data-section="gifts" className="gifts">
              <p className="label">{copy.sections.gifts}</p>
              <GiftsContent e={e} />
            </section>
          ) : null)}

          {/* Who to ask, and the one thing to remember on the way out. Two cells, a symbol over a
              name over a line, the same pair the suite ends on, so the two layouts ask the same
              way and read the same way. */}
          {e.show_after && (
          <section data-section="after" className="ask-block">
            <div className={photoLine(e) ? "after" : "after one"}>
              <div>
                <Bubble size={44} />
                <div className="n">{copy.sections.askHeading}</div>
                {askSms(e)
                  ? <a className="b" href={askSms(e)!}>{askLine(e)}{askPhoneSuffix(e) ? ` ${askPhoneSuffix(e)}` : ""}</a>
                  : <div className="b">{askLine(e)}</div>}
              </div>
              {photoLine(e) && (
                <div>
                  <Camera size={44} />
                  <div className="n">{copy.sections.photos}</div>
                  <div className="b">{photoLine(e)}</div>
                </div>
              )}
            </div>
          </section>
          )}

          {/* Absent means on: a database without migration 0008 does not send the column, and the
              sign-off is a part every event gets rather than one to opt into. */}
          {e.show_signoff !== false && (
          <section data-section="signoff" className="signoff">
            <p className="msg">{signoffMessage(e)}</p>
            {e.host_line && <p className="from">{e.host_line}</p>}
            {/* The seal off the envelope, pressed in at the end the way wax closes a letter. Same
                move as the suite's, so the two layouts end the same way. */}
            <div className="stamp" aria-hidden="true"><Bolt size={26} /></div>
          </section>
          )}

          {after}
        </div>
        </Envelope>
      </div>
    </main>
  );
}
