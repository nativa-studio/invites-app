import Image from "next/image";
import "@/app/globals.css";
import type { PublicEvent } from "@/lib/db/types";
import { formatInviteDate, formatTimeRange } from "@/lib/format";
import { bandFor } from "@/lib/artwork";

// The lineup's cover, in a file of its own. Same reason as BandsCover.
//
// This design is retired from the gallery and still drawn for every event already saved on it,
// which is exactly why its tile has to be right: those events show a tile on the host's own
// list, and it was drawing the suite's photo card, a design this one is not.

export function LineupCover({ event: e }: { event: PublicEvent }) {
  const age = e.title.match(/turning (\d+)/i)?.[1];
  const artwork = bandFor(e.invite_image_path);
  return (
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
      {/* Signed at the end now, the way a card is. Back on the cover only when the sign-off is
          switched off, because then nowhere else would carry it. */}
      {e.show_signoff === false && e.host_line && <p className="from">{e.host_line}</p>}
      {artwork
        ? <div className="art"><Image src={artwork.src} alt="" width={artwork.w} height={artwork.h} priority sizes="(max-width: 430px) 100vw, 430px" /></div>
        : <div className="artless" />}
    </header>
  );
}
