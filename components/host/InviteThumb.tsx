import Image from "next/image";
import { bandFor, coverFor } from "@/lib/artwork";
import { paletteFor } from "@/components/art/palette";
import { stockFor } from "@/lib/layouts";
import type { Palette } from "@/lib/db/types";

// One invite, small: the card standing in front of its own envelope, flap open behind it.
//
// This is the picture a stationery shop puts on a product page, and for the same reason. You do
// not recognise an invite by its name. You recognise it by the card, and the envelope behind it
// is what says this is an invitation rather than a poster.
//
// So both halves are the real thing rather than a diagram of it: the envelope is the one the
// guest taps open, in the paper that design is cut from, and the card is the actual cover with
// the actual artwork on it. The drawing it replaced was a stack of grey boxes, which told you
// nothing except that something rectangular was involved.
//
// The envelope is drawn rather than built from boxes because a rectangle with a triangle on top
// reads as a house. What makes it an envelope is the open flap showing its lining, the seams
// where its own flaps fold in behind the card, and a shadow under the card sitting in front.

type Stock = { body: string; flapBack: string; rim: string; liner: string; linerInk: string };

function stock(p: Palette, layout: string | undefined): Stock {
  // The same two papers the share card and the page are cut from, in miniature. The flap is seen
  // from behind here, since it is standing open towards you, so it carries the lining rather than
  // the outside colour.
  return stockFor(layout) === "beige"
    ? { body: "#E9DCC1", flapBack: "#F4EAD6", rim: "#CDBB98", liner: "#FFFDF6", linerInk: "#CDBB98" }
    : { body: shade(p.red, -0.14), flapBack: shade(p.red, 0.04), rim: shade(p.red, -0.3), liner: "#FFFFFF", linerInk: p.sky };
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount))),
  );
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// The envelope, open, seen from behind: the flap standing up and towards you, its lining showing,
// the body in front of it, and the two seams where the side flaps fold in.
//
// The id on the lining pattern has to be unique per envelope drawn. Two of these sit side by side
// on the Design tab, and an SVG pattern id is global to the document: the second copy would look
// up the first one's pattern, which is the same bug the cover art hit inside the closed envelope.
function EnvelopeOpen({ s, uid }: { s: Stock; uid: string }) {
  const liner = `liner-${uid}`;
  const inside = `inside-${uid}`;
  return (
    <svg viewBox="0 0 100 122" aria-hidden="true">
      <defs>
        {/* The lining, printed rather than plain. A real one is patterned paper, and it is the
            thing that makes an envelope look like stationery instead of packaging. */}
        <pattern id={liner} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill={s.liner} />
          <circle cx="3" cy="3" r="1.5" fill={s.linerInk} opacity="0.55" />
          <circle cx="8" cy="8" r="1.5" fill={s.linerInk} opacity="0.55" />
          <path d="M0 6h3M7 1h3" stroke={s.linerInk} strokeWidth="1" opacity="0.35" />
        </pattern>
        <linearGradient id={inside} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* The flap, folded back and standing above the envelope's own top edge. */}
      <path d="M2 24 L50 2 L98 24 Z" fill={s.flapBack} stroke={s.rim} strokeWidth="1.4" strokeLinejoin="round" />
      {/* The body. */}
      <rect x="2" y="22" width="96" height="98" rx="4" fill={s.body} stroke={s.rim} strokeWidth="1.4" />
      {/* The mouth, open: the lining seen down inside it, and the shadow the flap casts across it. */}
      <path d="M7 27 L93 27 L50 82 Z" fill={`url(#${liner})`} stroke={s.rim} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7 27 L93 27 L50 82 Z" fill={`url(#${inside})`} />
      {/* The seams where its own side flaps fold in behind the card. */}
      <path d="M2 118 L50 76 L98 118" fill="none" stroke={s.rim} strokeWidth="1" opacity="0.55" />
    </svg>
  );
}

export function InviteThumb({
  artwork, title, palette, themeId, layout,
}: {
  artwork: string | null;
  title: string;
  palette?: Palette | null;
  themeId?: string | null;
  /** Which design, so the envelope is the right paper and the card is cropped the right way. */
  layout?: string;
}) {
  const p = paletteFor(palette, themeId ?? "");
  const s = stock(p, layout);
  // The lineup's cover stands its artwork along the bottom and its words above; the suite's is a
  // picture with the title under it. Cropping each from the piece that layout actually leads with
  // is what makes the two squares look like two different invites rather than one invite twice.
  const lineup = layout === "lineup";
  const art = lineup ? bandFor(artwork) : coverFor(artwork);
  const uid = `${layout ?? "suite"}-${(artwork ?? "none").replace(/[^a-z0-9]/gi, "")}`;

  return (
    <span className="ithumb">
      <span className="ithumb-env">
        <EnvelopeOpen s={s} uid={uid} />
      </span>
      {/* The card is the invite's own face, not a crop of its picture: the artwork and the title
          under it, which is what a guest is holding and what a host recognises from across the
          list. A photograph with no words on it could be any event. */}
      <span className={`ithumb-card${lineup ? " lineup" : ""}`}>
        {art ? (
          <span className="ithumb-art">
            <Image src={art.src} alt="" width={art.w} height={art.h} sizes="160px" />
          </span>
        ) : null}
        <span className="ithumb-title">{title}</span>
      </span>
    </span>
  );
}
