import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { loadGift, loadGiftTally, loadGiftWho } from "@/lib/db/gift";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { GiftPanel } from "@/components/host/GiftPanel";

// Gift: whether there is a group present, what it is, and who is running it.
//
// It is a tab rather than a row in Details because it has a life after being switched on. A host
// sets it up once and then keeps coming back to the same question, which is how it is going, and
// that question has nowhere else to live. The gift stance (no gifts, optional, books only) stays
// in the invite where the wording is, because that is wording. This is a job.
//
// Who runs it decides how much of this screen there is. Hand it to a guest and the host owns
// three things (what it is, what it might come to, who has it) and their last job is the text
// that sends that person their page. Keep it and the organiser's whole side opens up here.
export default async function GiftTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests, site] = await Promise.all([loadEvent(id), loadGuests(id), getSiteUrl()]);
  const on = e.group_gift_enabled;
  const [gift, tally] = await Promise.all([
    on ? loadGift(id) : null,
    on ? loadGiftTally(id) : Promise.resolve({ count: 0, total: 0, hidden: false }),
  ]);
  // Only fetched when the host is the one running it, since it is the chase list and nobody else
  // has anybody to chase.
  const who = on && gift?.organiserProfileId ? await loadGiftWho(id) : null;

  return (
    <GiftPanel
      eventId={e.id}
      eventTitle={e.title}
      enabled={on}
      gift={gift}
      tally={tally}
      who={who}
      // Only guests who have said yes can be handed the job, because the organiser page opens off
      // their own reply and a guest who has not answered has nothing to open it from.
      candidates={guests.filter((g) => g.status === "yes").map((g) => ({ id: g.id, name: g.name }))}
      organiserLink={gift?.organiserToken ? `${inviteLink(site, gift.organiserToken)}/organiser` : null}
      organiserPhone={gift?.organiserPhone ?? null}
      // Every guest's own link, so a chase text points at their invite rather than at a page
      // they have no token for.
      inviteLinks={Object.fromEntries(guests.map((g) => [g.id, inviteLink(site, g.token)]))}
      heading={copy.host.giftHeading}
    />
  );
}
