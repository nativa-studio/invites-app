import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { AddGuest } from "@/components/host/AddGuest";
import { GuestList } from "@/components/host/GuestList";
import { GroupsPanel } from "@/components/host/GroupsPanel";

// Guests: the list, adding to it, and texting it. The words that go out are a setting, so they
// live on Details rather than under the list.
export default async function Guests({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, list] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const site = await getSiteUrl();
  return (
    <>
      <AddGuest eventId={e.id} startOpen={list.length === 0} />
      <GroupsPanel guests={list} base={`${site}/e/${e.slug}`} />
      <GuestList eventId={e.id} guests={list} event={{ title: e.title, date: e.date, text_template: e.text_template, reminder_template: e.reminder_template }} site={site} />
    </>
  );
}
