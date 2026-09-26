import "@/app/bands.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { coverFor } from "@/lib/artwork";

// The Fur bands cover, in a file of its own.
//
// Two screens draw it: a guest's invite, through BandsInvite, and the tile in the host's Design
// gallery, through InviteThumb. Its own file rather than an export of BandsInvite, so the host
// app can have the cover without the whole layout, its envelope and its gifts block coming along
// behind it.
//
// The gallery used to draw every design with the suite's photo card, so Photo cards, Fur bands
// and Staff file were one picture three times and a host could not see what they were choosing.
// InviteThumb's own rule says every piece in a tile is the real one, so there is nothing for the
// tile to be wrong about. This is that rule applied to the part that had quietly stopped
// following it.

/** One element around the whole cover, so it is one thing to point a pencil at: the drawer behind
 *  it holds the title and the line under it, and marking only the title left the picture and the
 *  eyebrow doing nothing. */
export function BandsCover({ event: e }: { event: PublicEvent }) {
  const cast = coverFor(e.invite_image_path);
  return (
    <div className="cover" data-section="cover">
      <p className="eyebrow">{copy.sections.scarerWanted}</p>
      <h1>{e.title}</h1>
      {e.intro && <p className="intro">{e.intro}</p>}
      {cast && (
        <div className="cast">
          {/* A plain img, not next/image: the picture is masked at both edges so it fades into
              the page rather than ending on a line, and it is one bundled file at a known size,
              so there is nothing for the optimiser to decide. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cast.src} alt="" width={cast.w} height={cast.h} />
        </div>
      )}
    </div>
  );
}
