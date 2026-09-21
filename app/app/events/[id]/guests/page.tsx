import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { AddGuest } from "@/components/host/AddGuest";
import { GuestList } from "@/components/host/GuestList";
import { GroupsPanel } from "@/components/host/GroupsPanel";
import { HeadCount } from "@/components/host/HeadCount";
import { FoodNeeds } from "@/components/host/FoodNeeds";
import { ActivityDrawer } from "@/components/host/ActivityDrawer";
import { GroupFilter } from "@/components/host/GroupFilter";
import { loadActivity } from "@/lib/db/activity";
import { groupsOf } from "@/lib/group-colours";
import { inGroup, UNGROUPED } from "@/lib/groups";

// Guests: everyone you are asking, how they are replying, and the links that reach them.
//
// This used to be four tabs. Tracking held the counts and the group link, RSVP held the counts
// again and the questions behind them, Guests held the list, and Tracking came back later to
// hold what has to be cooked around and what has happened. They are one job: who is asked, what
// they said, and how to reach the ones who have not. The questions themselves moved to the
// invite, where a guest meets them, and everything else is here, in the order it is wanted:
// how many, what they need, how to reach them, the list itself, then the trail.
//
// The counting tiles that used to open this screen are gone. They sat directly above the numbers
// card, which answers the same question and shows its working, so the screen opened by saying the
// same thing twice before it said anything else.
//
// The group filter is above all of it, and everything that counts people answers for the group
// that is picked: the numbers, the food line and the list. The Groups card does not, because it
// is about the groups rather than about the people in one of them.
//
// The group link had a card of its own here, saying the same link the Groups card already
// carries. Its one unique part was the switch that closes it, which is a fact about the event
// rather than about the guest list, so it went behind the badge in the header with the rest.
export default async function Guests({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ group?: string; filter?: string }> }) {
  const { id } = await params;
  const { group, filter } = await searchParams;
  const [e, all] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const [site, feed] = await Promise.all([getSiteUrl(), loadActivity(id, all)]);
  const groupLink = `${site}/e/${e.slug}`;
  const chosen = group ?? "";
  const list = inGroup(all, chosen);
  const here = `/app/events/${id}/guests`;
  const groupNames = [...new Set(all.flatMap((g) => g.groups ?? []))].sort((a, b) => a.localeCompare(b));

  return (
    <>
      {all.length === 0 && <p className="notice">No guests yet. Add them below, and every one gets their own link straight away.</p>}
      <GroupFilter guests={all} chosen={chosen} base={here} />
      <HeadCount guests={list} splitParty={e.ask_party_mode === "split"} />
      {/* After the numbers, because it is what you do with them rather than what they are.
          These two cards came off the Tracking tab when it folded into this one: the one-line
          summary that used to sit here said the same thing with less of it, and a host who has
          to cook needs the names. */}
      <FoodNeeds guests={list} />
      <AddGuest eventId={e.id} none={all.length === 0} groups={groupNames} preset={chosen === UNGROUPED ? "" : chosen} />
      <GroupsPanel guests={all} base={groupLink} event={e} />
      <GuestList eventId={e.id} guests={list} everyone={all} base={here} event={{ title: e.title, date: e.date, text_template: e.text_template, reminder_template: e.reminder_template }} site={site} initialFilter={filter} />

      {/* Last, and behind a button. It is the only thing on this screen that is a history rather
          than a state, and a host opens it to answer "what has happened since I last looked"
          after they have already read who is coming. Never filtered by group: it is a record of
          the event, and a record with rows missing is worse than no record. */}
      <ActivityDrawer feed={feed} groups={groupsOf(all)} />
    </>
  );
}
