import { copy } from "@/lib/copy";
import { partTitle } from "@/lib/invite-parts";
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
// It draws in the plate's own slot, wherever the host has ordered that, and not above the reply.
//
// It used to be hardcoded immediately before the RSVP, so switching it on moved Bring a plate
// from the place the host had put it to a place they had not chosen, and the only way to find
// that out was to switch it on. Marcia: "I do want it to display, I have turned it on but I have
// to keep turning it off because it's showing in the wrong place, and I only see it's in the
// wrong place after I turn it on", with a screenshot of the switched-off card sitting exactly
// where she wanted it.
//
// So the switch decides whether the plate says anything before somebody replies, and nothing
// else. Where it says it belongs to the section order, the same as every other part.
export function AnnouncePlate({ e }: { e: PublicEvent }) {
  // Whether they have answered is not asked here any more. PlateSlot draws the board once
  // somebody has said yes and this before they have, so the two can never both be on the page
  // and neither has to know about the other.
  if (!e.plate_enabled || e.plate_block !== true) return null;
  return (
    <div className="pcard tilt-r plate announce" data-section="plate">
      <div className="tape tl" />
      <div className="tape tr" />
      <div className="label red">{partTitle(e, "plate", copy.plate.heading)}</div>
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
