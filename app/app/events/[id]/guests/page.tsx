import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { AddGuest } from "@/components/host/AddGuest";
import { GuestList } from "@/components/host/GuestList";
import { MessagesPanel } from "@/components/host/panels/MessagesPanel";
import { GroupsPanel } from "@/components/host/GroupsPanel";

// Guests: the list, adding to it, texting it, and the words that go out with the links.
export default async function Guests({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, list] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const site = await getSiteUrl();
  return (
    <>
      <AddGuest eventId={e.id} startOpen={list.length === 0} />
      <GroupsPanel guests={list} base={`${site}/e/${e.slug}`} />
      <GuestList eventId={e.id} guests={list} event={{ title: e.title, date: e.date, text_template: e.text_template, reminder_template: e.reminder_template }} site={site} />
      <MessagesPanel e={e} />
    </>
  );
}
