import { copy } from "@/lib/copy";
import { Gift as GiftIcon, Plate as PlateIcon } from "@/components/art/icons";

// The plate board and the gift block, as the host's preview draws them while editing.
//
// The guest's versions of these are live: they claim dishes and tick that they have paid, and
// both need a token the host does not have. So these are drawn rather than wired, the same trick
// the reply card uses: show the thing, do not describe it. Pressing them for real is what the
// guest view is for.
//
// data-section is the whole point of them. Without a card on the editing side there was nothing
// to tap, so the one way to change what these say was to remember which tab they lived on. The
// names match the entries in sections.tsx, the same as every other card.
export function PreviewPlate({ note, mode }: { note: string | null; mode: string }) {
  return (
    <div className="pcard white plate" data-section="plate">
      <div className="tape sky" />
      <PlateIcon size={36} />
      <div className="label sky">{copy.plate.heading}</div>
      <PlateIcon size={36} />
      <p className="para">{note || (mode === "everyone" ? copy.plate.everyone : copy.plate.free)}</p>
      <div className="small">{copy.host.previewPlate}</div>
    </div>
  );
}

export function PreviewGift({ description, organiser }: { description: string | null; organiser: string | null }) {
  return (
    <div className="pcard cream gift" data-section="gift">
      <div className="tape yel cross" />
      <div className="tape sky over" />
      <div className="label red">{copy.gift.heading}</div>
      <GiftIcon size={36} />
      <GiftIcon size={36} />
      <p className="para">
        {organiser
          ? description ? copy.gift.running(organiser, description) : copy.gift.runningNoWhat(organiser)
          : description ? copy.gift.noOrganiser(description) : copy.gift.noOrganiserNoWhat}
      </p>
      <div className="small">{copy.host.previewGift}</div>
    </div>
  );
}
