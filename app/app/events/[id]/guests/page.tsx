import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { CopyButton } from "@/components/host/CopyButton";
import { groupInviteText } from "@/lib/messages";
import { AddGuest } from "@/components/host/AddGuest";
import { GuestList } from "@/components/host/GuestList";
import { GroupsPanel } from "@/components/host/GroupsPanel";
import { HeadCount } from "@/components/host/HeadCount";
import { FoodNote, foodSummary } from "@/components/host/replies";
import { PlateBoard } from "@/components/host/PlateBoard";
import { loadPlate } from "@/lib/db/plate";
import { EditCard, Sum } from "@/components/host/EditCard";
import { Switch } from "@/components/host/fields";

// Guests: everyone you are asking, how they are replying, and the links that reach them.
//
// This used to be three tabs. Tracking held the counts and the group link, RSVP held the counts
// again and the questions behind them, and Guests held the list. They are one job: who is asked,
// what they said, and how to reach the ones who have not. The questions themselves moved to the
// invite, where a guest meets them, and everything else is here, in the order it is wanted:
// how many, how they are going, how to reach them, then the list itself.
//
// The counting tiles that used to open this screen are gone. They sat directly above the numbers
// card, which answers the same question and shows its working, so the screen opened by saying the
// same thing twice before it said anything else.
export default async function Guests({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, list] = await Promise.all([loadEvent(id), loadGuests(id)]);
  // Only fetched when the host has switched it on, so an event without a plate does no work for it.
  const plate = e.plate_enabled ? await loadPlate(id) : [];
  const site = await getSiteUrl();
  const groupLink = `${site}/e/${e.slug}`;
  const open = e.group_link_enabled !== false;

  return (
    <>
      {list.length === 0 && <p className="notice">No guests yet. Add them below, and every one gets their own link straight away.</p>}
      <HeadCount guests={list} splitParty={e.ask_party_mode === "split"} />
      {/* After the numbers, because it is what you do with them rather than what they are. */}
      <FoodNote guests={list} />
      <PlateBoard
        eventId={e.id}
        items={plate}
        enabled={e.plate_enabled}
        mode={e.plate_mode}
        hostNote={e.plate_host_note}
        allergies={foodSummary(list).counts}
      />
      <AddGuest eventId={e.id} none={list.length === 0} />
      {/* The switch that closes this link belongs next to the link, not on another screen. */}
      <EditCard
        eventId={e.id}
        title={copy.host.groupLink}
        blurb={copy.host.groupLinkBlurb}
        fields={["group_link_enabled"]}
        summary={<Sum label="Right now" value={open ? copy.host.groupLinkOpen : copy.host.groupLinkClosed} />}
        extra={
          <>
            <p className="hint">{copy.host.groupLinkHint}</p>
            <code>{groupLink}</code>
            <div className="actions">
              <CopyButton text={groupInviteText(e, groupLink)} label={copy.host.copyMessage} what="message" />
              <CopyButton text={groupLink} label={copy.host.copy} />
            </div>
          </>
        }
      >
        <Switch id="group_link_enabled" label="Group link open (for chats)" value={open} />
      </EditCard>
      <GroupsPanel guests={list} base={groupLink} event={e} />
      <GuestList eventId={e.id} guests={list} event={{ title: e.title, date: e.date, text_template: e.text_template, reminder_template: e.reminder_template }} site={site} />
    </>
  );
}
