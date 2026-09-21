import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { loadPlate } from "@/lib/db/plate";
import { loadShopping } from "@/lib/db/shopping";
import { loadGift, loadGiftTally, loadGiftWho } from "@/lib/db/gift";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { PlateBoard } from "@/components/host/PlateBoard";
import { ShoppingList } from "@/components/host/ShoppingList";
import { GiftPanel } from "@/components/host/GiftPanel";
import { EditCard, Sum } from "@/components/host/EditCard";
import { Choice, Field, Switch } from "@/components/host/fields";
import { foodSummary } from "@/components/host/replies";
import { PLATE_MODES } from "@/lib/good-to-know";

// Plan: everything that has to be got, made or organised before the day.
//
// Three tabs until now, and a host kept all three open at once. Shopping is the food you buy,
// Potluck is the food guests carry, and the gift is the thing everyone is going in on: one
// question, which is what still has to happen, asked in three rooms.
//
// Shopping first, because it is the only one of the three that is nobody else's. The two lists
// of food sit next to each other on purpose, since the one mistake worth designing against is a
// host buying something a guest is already bringing, and that mistake is only visible when the
// two lists are on one screen. The label on each says who can see it.
export default async function Plan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests, site] = await Promise.all([loadEvent(id), loadGuests(id), getSiteUrl()]);
  const on = e.group_gift_enabled;
  const [items, shopping, gift, tally] = await Promise.all([
    e.plate_enabled ? loadPlate(id) : Promise.resolve([]),
    loadShopping(id),
    on ? loadGift(id) : null,
    on ? loadGiftTally(id) : Promise.resolve({ count: 0, total: 0, hidden: false }),
  ]);
  const who = on && gift?.organiserProfileId ? await loadGiftWho(id) : null;
  const mode = PLATE_MODES.find(([v]) => v === e.plate_mode)?.[1] ?? e.plate_mode;

  return (
    <>
      <ShoppingList eventId={e.id} items={shopping} />

      {/* The two food lists are next to each other now rather than a tab apart, which is what
          this line was always for: it says which of them guests can see. */}
      <p className="hint">{copy.host.shopNotPotluck}</p>

      <EditCard
        eventId={e.id}
        title={copy.host.potluckHeading}
        blurb={copy.host.potluckBlurb}
        fields={["plate_enabled", "plate_mode", "plate_host_note"]}
        summary={
          <>
            <Sum label="Right now" value={e.plate_enabled ? copy.host.potluckOn : copy.host.potluckOff} />
            {e.plate_enabled && <Sum label={copy.host.potluckHowMuch} value={mode} />}
          </>
        }
      >
        <Switch id="plate_enabled" label={copy.host.potluckSwitch} value={e.plate_enabled} />
        <Choice id="plate_mode" label={copy.host.potluckMode} value={e.plate_mode} options={PLATE_MODES} hint={copy.host.potluckModeHint} />
        <Field id="plate_host_note" label={copy.host.potluckNote} value={e.plate_host_note} rows={2} hint={copy.host.potluckNoteHint} />
      </EditCard>

      <PlateBoard
        eventId={e.id}
        items={items}
        enabled={e.plate_enabled}
        mode={e.plate_mode}
        hostNote={e.plate_host_note}
        allergies={foodSummary(guests).counts}
        guests={guests.filter((g) => g.status === "yes").map((g) => ({ id: g.id, name: g.name }))}
      />

      <GiftPanel
        eventId={e.id}
        eventTitle={e.title}
        enabled={on}
        gift={gift}
        tally={tally}
        who={who}
        candidates={guests.filter((g) => g.status === "yes").map((g) => ({ id: g.id, name: g.name }))}
        organiserLink={gift?.organiserToken ? `${inviteLink(site, gift.organiserToken)}/organiser` : null}
        organiserPhone={gift?.organiserPhone ?? null}
        inviteLinks={Object.fromEntries(guests.map((g) => [g.id, inviteLink(site, g.token)]))}
        heading={copy.host.giftHeading}
      />
    </>
  );
}
