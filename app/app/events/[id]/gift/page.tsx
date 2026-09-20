import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { loadGift, loadGiftTally } from "@/lib/db/gift";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { GiftPanel } from "@/components/host/GiftPanel";

// Gift: whether there is a group present, what it is, and who is running it.
//
// It is a tab rather than a row in Details because it has a life after being switched on. A host
// sets it up once and then keeps coming back to the same question, which is how it is going, and
// that question has nowhere else to live. The gift stance (no gifts, optional, books only) stays
// in the invite where the wording is, because that is wording. This is a job.
//
// What a host can change here is deliberately only three things: what the gift is, what it might
// come to, and who is organising it. Where the money goes and what contributors are told belong
// to the organiser, on their own page, because the organiser is usually not the host and a host
// typing somebody else's bank details is how that goes wrong.
export default async function GiftTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests, site] = await Promise.all([loadEvent(id), loadGuests(id), getSiteUrl()]);
  const [gift, tally] = await Promise.all([
    e.group_gift_enabled ? loadGift(id) : null,
    e.group_gift_enabled ? loadGiftTally(id) : { count: null, total: null },
  ]);

  return (
    <GiftPanel
      eventId={e.id}
      eventTitle={e.title}
      enabled={e.group_gift_enabled}
      gift={gift}
      tally={tally}
      // Only guests who have said yes can be handed the job, because the organiser page opens off
      // their own reply and a guest who has not answered has nothing to open it from.
      candidates={guests.filter((g) => g.status === "yes").map((g) => ({ id: g.id, name: g.name }))}
      organiserLink={gift?.organiserToken ? `${inviteLink(site, gift.organiserToken)}/organiser` : null}
      organiserPhone={gift?.organiserPhone ?? null}
      heading={copy.host.giftHeading}
    />
  );
}
