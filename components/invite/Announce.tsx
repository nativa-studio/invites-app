import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";
import { Plate as PlateIcon } from "@/components/art/icons";

// A card in the invite saying a potluck is happening.
//
// This is the thing the "Give it a block on the invite" switch turns on, and it is only ever
// news: no dishes, no buttons, nothing to claim. A guest reading it has not decided whether they
// are coming, and asking them to pick a salad in the middle of that is the wrong question at the
// wrong moment. The card they act on comes after their reply and is never optional, because
// without it the feature does not exist.
//
// Off by default. The info booth already carries a line about both, so a card of its own is a
// host choosing to make a point of it rather than something every invite needs.
export function AnnouncePlate({ e, answered }: { e: PublicEvent; answered?: boolean }) {
  // Gone once they have answered. Its whole job is telling somebody who is still deciding what
  // the day involves, and its last line promises the list opens up when they reply, which is a
  // strange thing to read next to the list.
  if (!e.plate_enabled || e.plate_block !== true || answered) return null;
  return (
    <div className="pcard tilt-r plate announce" data-section="plate">
      <div className="tape tl" />
      <div className="tape tr" />
      <div className="label red">{copy.plate.heading}</div>
      <PlateIcon size={36} />
      <p className="para">{e.plate_host_note || (e.plate_mode === "everyone" ? copy.plate.everyone : copy.plate.free)}</p>
      <p className="small">{copy.plate.afterYes}</p>
    </div>
  );
}

// AnnounceGift lived here: a card before the reply saying a group gift was happening, switched
// by gift_block. It is gone. The gifts block announces the group gift, names the present and
// says how to chip in comes with the reply, so this card was the same news a screen earlier and
// a host looking for the block kept finding it instead. Marcia, twice: "there are two gift
// sections", "I still see two gift blocks".
//
// What a guest gets after saying yes is untouched: GiftCard, with the pay details, on the
// answered page. That is a different moment and a different job.
