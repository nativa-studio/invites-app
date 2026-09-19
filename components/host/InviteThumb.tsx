import Image from "next/image";
import { coverFor } from "@/lib/artwork";
import { paletteFor } from "@/components/art/palette";
import type { Palette } from "@/lib/db/types";

// One invite, small: the card standing in front of its own envelope, flap open behind it.
//
// Only the first part of the invite is drawn, the card, because that is what an invite looks like
// in the hand. A whole page shrunk to tile size is a grey smudge; a card against a coloured
// envelope is recognisable at a glance, which is the entire job of a thumbnail.
//
// The envelope is drawn rather than built from boxes because a rectangle with a triangle on top
// reads as a house. What makes it an envelope is the seams up its back and an edge on the open
// flap, and those want real lines.
export function EnvelopeBack({ body, liner }: { body: string; liner: string }) {
  return (
    <svg viewBox="0 0 100 78" aria-hidden="true" preserveAspectRatio="none">
      {/* The flap, standing open, showing the inside. */}
      <path d="M2 30 L50 2 L98 30 Z" fill={liner} stroke="rgba(28,25,23,0.22)" strokeWidth="1" strokeLinejoin="round" />
      {/* The back of the envelope, with the seams where its own flaps fold in. */}
      <rect x="2" y="28" width="96" height="48" rx="2" fill={body} stroke="rgba(28,25,23,0.22)" strokeWidth="1" />
      <path d="M2 76 L50 48 L98 76" fill="none" stroke="rgba(28,25,23,0.16)" strokeWidth="1" />
    </svg>
  );
}

export function InviteThumb({
  artwork, title, palette, themeId,
}: { artwork: string | null; title: string; palette?: Palette | null; themeId?: string | null }) {
  const art = coverFor(artwork);
  const p = paletteFor(palette, themeId ?? "");
  return (
    <span className="ithumb">
      <span className="ithumb-env">
        <EnvelopeBack body={p.red} liner={p.cream} />
      </span>
      <span className="ithumb-card">
        {art
          ? <Image src={art.src} alt="" width={art.w} height={art.h} sizes="160px" />
          : <span className="ithumb-title">{title}</span>}
      </span>
    </span>
  );
}
