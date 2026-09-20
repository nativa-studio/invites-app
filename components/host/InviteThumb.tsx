import "@/app/invite.css";
import type { PublicEvent, Palette } from "@/lib/db/types";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { CoverCard } from "@/components/invite/Cards";
import { stockFor } from "@/lib/layouts";
import { mascotFor } from "@/lib/artwork";
import { stripSet, inkFor, paperFor } from "@/lib/strip-set";
import { Mono } from "@/components/art/mono";
import Image from "next/image";

// One invite, small: its own cover card standing in front of its own envelope, open.
//
// Both halves are the real thing, not a drawing of one. The card is the CoverCard component the
// guest page renders, and the envelope is the markup and stylesheet the opening animation uses,
// both shrunk. Three attempts at drawing a likeness of them produced three wrong pictures: an
// envelope of the wrong shape with a lining that does not exist, and a card that was a crop of
// the artwork with the title stuck underneath in the wrong order. Nothing here is a likeness, so
// nothing here can be wrong about the thing it stands for. When the invite changes, this changes.
//
// invite.css is the guest side's stylesheet and this is the one place the host app loads it. The
// two share no class names at all, checked rather than assumed, so it cannot reach anything else.

/** The scene is laid out at this size and scaled down, so the numbers below are readable. */
const W = 400;
const H = 470;

export function InviteThumb({
  artwork, title, intro, palette, themeId, layout, ink,
}: {
  artwork: string | null;
  title: string;
  intro?: string | null;
  palette?: Palette | null;
  themeId?: string | null;
  /** Which design. Only the envelope's paper depends on it; the card is the card. */
  layout?: string;
  /** The strip's one colour. The other designs take their colours from the palette. */
  ink?: string | null;
}) {
  // The strip has no envelope and no characters, so drawing it as one would be a picture of a
  // different design. Same rule as the rest of this file: show the real pieces, at the real size,
  // and there is nothing for the tile to be wrong about. Its cover is three doodles and a title,
  // so its tile is three doodles and a title.
  if (layout === "strip") {
    const set = stripSet(themeId);
    return (
      <span className="ithumb strip-thumb" style={{ background: paperFor(ink), color: inkFor(ink) }}>
        <span className="strip-thumb-in">
          <span className="trio">{set.trio.map((n, i) => <Mono key={i} name={n} size={34} />)}</span>
          <span className="t">{title}</span>
          {intro && <span className="b">{intro}</span>}
        </span>
      </span>
    );
  }

  const p = paletteFor(palette, themeId ?? "");
  const mascot = mascotFor(artwork);
  const beige = stockFor(layout) === "beige";
  // CoverCard reads a whole event row, and a thumbnail knows four things about one. The rest are
  // the values that make it draw the cover and nothing else: with the details and the sign-off
  // both on, their cards carry them, so the cover is the picture, the eyebrow, the title and the
  // line under it, which is exactly what it is on the invite.
  const e = {
    title, intro: intro ?? null, invite_image_path: artwork,
    show_details: true, show_signoff: true, host_line: null,
    date: null, start_time: null, end_time: null, time_note: null, venue: null,
  } as unknown as PublicEvent;

  return (
    <span className="ithumb" style={paletteVars(p)}>
      <span className={`ithumb-scene invite${beige ? " beige" : ""}`}>
        <span className="ithumb-envbox">
          {/* The envelope of the animation, in the state a tap leaves it: flap swung up and back
              on its hinge, its lining showing. `still` is that state without the swing. */}
          <span className={`env still${beige ? " beige" : ""}`}>
            <span className="back" />
            <span className="pocket"><span className="sides" /><span className="edge" /></span>
            <span className="flap"><span className="face front" /><span className="face backface" /><span className="rim" /></span>
            {/* The characters stand on the envelope, the same band the invite page stands there,
                and inside it in the markup as well as on the screen: every rule that sizes and
                places them is written ".env .cast". Left as a sibling of the envelope rather than
                a child, not one of those rules matched, and the band rendered at its natural size,
                which is 1173px wide. That is what put a giant Pikachu across the corner of every
                tile. */}
            {mascot && <Image className="cast" src={mascot.src} alt="" width={mascot.w} height={mascot.h} sizes="120px" />}
          </span>
        </span>
        <span className="ithumb-cardbox">
          <CoverCard e={e} />
        </span>
      </span>
    </span>
  );
}

export { W as THUMB_W, H as THUMB_H };
