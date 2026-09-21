import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { EditCard, Sum } from "@/components/host/EditCard";
import { Choice, Switch } from "@/components/host/fields";
import { DeleteEvent } from "@/components/host/DeleteEvent";

// Settings: the four switches that decide what this event is, and the way to delete it.
//
// Everything here is a fact about the event rather than about one part of it, which is the test
// for whether something belongs on this screen. Switching Bring a plate on changes the invite,
// the Plan tab and what guests can do, so it does not belong on any one of them.
//
// The status is deliberately not here, although the design put it on both. It lives in the badge
// at the top of every screen, where it already is, and two controls for one setting is the exact
// shape of every expensive mistake on this project: a host changes one, checks the other, and
// finds it has not moved.
//
// The message templates are on Invite rather than here. The message carries the invite and is
// written in the same sitting as it, and it is the one thing whose result cannot be seen anywhere
// else, so it stays next to the thing it delivers.
export default async function Settings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const split = e.ask_party_mode === "split";
  const on = (v: boolean | null | undefined) => (v ? copy.host.ovOn : copy.host.ovOff);

  return (
    <>
      <EditCard
        eventId={e.id}
        title={copy.host.ovSettings}
        blurb={copy.host.setBlurb}
        fields={["plate_enabled", "group_gift_enabled", "ask_party_mode", "group_link_enabled"]}
        summary={
          <>
            <Sum label={copy.host.ovPlateChip} value={on(e.plate_enabled)} />
            <Sum label={copy.host.ovGiftChip} value={on(e.group_gift_enabled)} />
            <Sum label={copy.host.ovSplitChip} value={split ? copy.host.ovOn : copy.host.ovOff} />
            <Sum label={copy.host.setGroupLink} value={on(e.group_link_enabled !== false)} />
          </>
        }
      >
        <Switch id="plate_enabled" label={copy.host.ovPlateChip} value={e.plate_enabled} hint={copy.host.setPlateHint} />
        <Switch id="group_gift_enabled" label={copy.host.ovGiftChip} value={e.group_gift_enabled} hint={copy.host.setGiftHint} />
        <Choice
          id="ask_party_mode"
          label={copy.host.ovSplitChip}
          value={e.ask_party_mode}
          options={[["split", copy.host.setSplitOn], ["single", copy.host.setSplitOff]]}
          hint={copy.host.setSplitHint}
        />
        <Switch id="group_link_enabled" label={copy.host.setGroupLink} value={e.group_link_enabled !== false} hint={copy.host.setGroupLinkHint} />
      </EditCard>

      <DeleteEvent
        id={e.id}
        title={e.title}
        counts={{ guests: guests.length, replies: guests.filter((g) => g.status !== "pending").length }}
      />
    </>
  );
}
