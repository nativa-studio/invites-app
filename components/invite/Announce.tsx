import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";
import { Gift as GiftIcon, Plate as PlateIcon } from "@/components/art/icons";

// A card in the invite saying a potluck or a group gift is happening.
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

// The group gift, announced on its own card before the reply.
//
// Nothing when gifts have a block of their own. The block says the same thing, in the host's own
// words where they have written any, at the moment a guest is reading about gifts. Two cards a
// screen apart, both headed for the same present, is the invite talking to itself, and it is the
// same fault the info booth's gifts line had. The block wins because it is the fuller of the two
// and because turning it on is a host saying gifts need more than a mention.
//
// So gift_block, the switch behind this card, only decides anything while the block is off. Its
// hint in the drawer says so.
export function AnnounceGift({ e, answered }: { e: PublicEvent; answered?: boolean }) {
  if (e.show_gifts) return null;
  if (!e.group_gift_enabled || e.gift_block !== true || answered) return null;
  return (
    <div className="pcard cream gift announce tilt-l" data-section="gifts">
      <div className="tape cross" />
      <div className="tape over sky" />
      <div className="label red">{copy.gift.heading}</div>
      <GiftIcon size={36} />
      {/* No description here. What the present is lives on the group_gift row, which the guest
          payload does not carry, and it is on the card after the reply where a guest can act on
          it. This one only says that there is one. */}
      <p className="para">{copy.gift.noOrganiserNoWhat}</p>
      <p className="small">{copy.gift.afterYes}</p>
    </div>
  );
}
