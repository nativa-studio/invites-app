import "server-only";
import { firstName } from "@/lib/format";
import { loadGift, loadGiftTally } from "@/lib/db/gift";
import { loadPlate } from "@/lib/db/plate";
import type { Gift } from "@/lib/guest/gift";
import type { Plate } from "@/lib/guest/plate";

// The plate board and the gift block, for the host's preview.
//
// A guest reads both through security definer functions that take their token. A preview has no
// guest and no token, so it cannot call any of them, and for a while that meant the two things
// guests write to were the two things a host could not see. A host who wants to know what the
// bring a plate list looks like had to ask a guest.
//
// So these are built from the host's own rows instead. Same shapes, same components, so what the
// preview draws is the guest's card rather than a second drawing of it that drifts. What it
// cannot be is interactive: there is nobody to claim a dish as. The caller renders them inert.
export async function previewPlate(
  eventId: string,
  e: { plate_enabled: boolean; plate_mode: string; plate_host_note: string | null },
  // Only the two columns the allergy count needs, so the caller can fetch two columns
  // rather than every guest row in full.
  guests: { status: string; dietary: string[] }[],
): Promise<Plate | null> {
  if (!e.plate_enabled) return null;
  const items = await loadPlate(eventId);
  const yes = guests.filter((g) => g.status === "yes");
  const tally = yes.flatMap((g) => g.dietary).reduce<Record<string, number>>((m, d) => ({ ...m, [d]: (m[d] ?? 0) + 1 }), {});
  return {
    enabled: true,
    mode: e.plate_mode,
    host_note: e.plate_host_note,
    // First names, because that is what the guests' board shows. The host's own board on the
    // Potluck tab is the one that gives whole names, since chasing the salad needs to know
    // which Sam.
    items: items.map((i) => ({
      id: i.id,
      label: i.label,
      quantity: null,
      tags: i.tags,
      bringing: i.bringing ? firstName(i.bringing) : null,
      claimed: Boolean(i.bringing),
      mine: false,
      added_by_me: false,
    })),
    allergies: Object.entries(tally).map(([chip, n]) => ({ chip, n })),
  };
}

export async function previewGift(eventId: string, e: { group_gift_enabled: boolean }): Promise<Gift | null> {
  if (!e.group_gift_enabled) return null;
  const [gift, tally] = await Promise.all([loadGift(eventId), loadGiftTally(eventId)]);
  return {
    enabled: true,
    description: gift?.description ?? null,
    organiser: gift?.organiserName ? firstName(gift.organiserName) : null,
    message: gift?.message ?? null,
    suggested_amount: gift?.suggestedAmount ?? null,
    chip_in_by: gift?.chipInBy ?? null,
    pay_details: gift?.payDetails ?? null,
    pay_reference: gift?.payReference ?? null,
    latest_update: gift?.latestUpdate ?? null,
    ready: Boolean(gift?.payDetails?.trim()),
    chipped_in: false,
    my_amount: null,
    // Withheld from a host on a surprise gift, and the block only counts rather than names, so
    // zero here reads as nobody rather than as anything hidden.
    chipped_count: tally.count ?? 0,
    is_organiser: false,
  };
}
