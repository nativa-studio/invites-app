import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";
import { Gift as GiftIcon } from "@/components/art/icons";
import { GiftsContent, hasGifts } from "./GiftsContent";

// Gifts, as a block of its own, in the stationery suite's clothes.
//
// Everything about gifts used to be one line in the info booth. That is the right size for "gifts
// optional" and far too small for a wish list, which is a list of things and reads as one. The
// line is gone now: gifts are this block and nothing else.
//
// What it says lives in GiftsContent, because five layouts draw a gifts block and only their
// clothes differ. This file is the card: tilt, tape, label, icon.
//
// Nothing here is a button. The whole block is for reading, which is why it can sit on the invite
// before anybody has answered without asking anything of them.
export function GiftsCard({ e, off }: {
  e: PublicEvent;
  /** Only the host's editor passes this, and passing it at all means "draw even with nothing in
   *  you". A part switched off has to keep drawing there, faded, because the switch that turns it
   *  back on lives in the drawer behind this card and nothing else opens that drawer. With no
   *  note, no list and no group gift there would be nothing on the screen to tap, and the block
   *  would be a feature a host could not find. That is the fault CLAUDE.md opens with. */
  off?: boolean;
}) {
  const editing = off !== undefined;
  if (!editing && !hasGifts(e)) return null;

  return (
    <div className={`pcard cream tilt-l gifts${off ? " off" : ""}`} data-section="gifts">
      <div className="tape cross" />
      <div className="tape over sky" />
      <div className="label red">{copy.sections.gifts}</div>
      <GiftIcon size={36} />

      <GiftsContent e={e} editing={editing} />

      {/* Only in the editor, and it says which of the two states this is: off and therefore
          invisible to guests, or on and waiting for words. */}
      {editing && <div className="small">{off ? copy.host.giftsOff : copy.host.previewGifts}</div>}
    </div>
  );
}
