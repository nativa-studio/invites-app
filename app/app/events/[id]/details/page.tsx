import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { DetailsPanel } from "@/components/host/panels/DetailsPanel";
import { DeleteEvent } from "@/components/host/DeleteEvent";
import { MessagesPanel } from "@/components/host/panels/MessagesPanel";

// Details: everything the invite says in words, what the reply asks, and the words that go out
// with the links. Deleting the event sits at the very bottom, after everything a host actually
// came here to do.
export default async function Details({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests, site] = await Promise.all([loadEvent(id), loadGuests(id), getSiteUrl()]);
  // A real token, so the preview shows a link that works rather than a placeholder. Falls back to
  // the slug's own group link on an event with nobody on it yet.
  const sample = guests[0]?.token ?? "";
  return (
    <>
      <DetailsPanel e={e} />
      <MessagesPanel e={e} site={site} sample={sample} />
      <DeleteEvent
        id={e.id}
        title={e.title}
        counts={{ guests: guests.length, replies: guests.filter((g) => g.status !== "pending").length }}
      />
    </>
  );
}
