import { paletteFor } from "@/components/art/palette";
import type { Palette } from "@/lib/db/types";
import { EnvelopeBack } from "./InviteThumb";
import { LayoutThumb } from "./LayoutThumb";

// One design, small: its own shape standing in front of its envelope.
//
// The event list's thumbnail puts the event's real artwork on the card, which is right there,
// where every tile is a different event. Here every square is the same event, so the artwork
// would be identical on all of them and the squares would differ in nothing but their captions.
// What has to differ is the shape, so the shape is what stands in the envelope: the suite's
// stack of cards, the lineup's one long page.
export function DesignThumb({ id, palette, themeId }: {
  id: string;
  palette?: Palette | null;
  themeId?: string | null;
}) {
  const p = paletteFor(palette, themeId ?? "");
  return (
    <span className="ithumb">
      <span className="ithumb-env">
        <EnvelopeBack body={p.red} liner={p.cream} />
      </span>
      <span className="ithumb-card plain">
        <LayoutThumb id={id} />
      </span>
    </span>
  );
}
