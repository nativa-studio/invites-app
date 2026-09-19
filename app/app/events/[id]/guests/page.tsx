import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { CopyButton } from "@/components/host/CopyButton";
import { groupInviteText } from "@/lib/messages";
import { AddGuest } from "@/components/host/AddGuest";
import { GuestList } from "@/components/host/GuestList";
import { GroupsPanel } from "@/components/host/GroupsPanel";
import { GroupLinks } from "@/components/host/GroupLinks";
import { HeadCount } from "@/components/host/HeadCount";
import { FoodNote } from "@/components/host/replies";
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
  const site = await getSiteUrl();
  const groupLink = `${site}/e/${e.slug}`;
  const open = e.group_link_enabled !== false;
  // The groups the guest list already carries, shown under the one being named so a host can find
  // a link they handed out last week without retyping it.
  const groupsInUse = [...new Set(list.flatMap((g) => g.groups ?? []))].sort((a, b) => a.localeCompare(b));

  return (
    <>
      {list.length === 0 && <p className="notice">No guests yet. Add them below, and every one gets their own link straight away.</p>}
      <HeadCount guests={list} splitParty={e.ask_party_mode === "split"} />
      {/* After the numbers, because it is what you do with them rather than what they are. */}
      <FoodNote guests={list} />
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
      <GroupLinks base={groupLink} inUse={groupsInUse} event={e} />
      <GroupsPanel guests={list} base={groupLink} />
      <GuestList eventId={e.id} guests={list} event={{ title: e.title, date: e.date, text_template: e.text_template, reminder_template: e.reminder_template }} site={site} />
    </>
  );
}
