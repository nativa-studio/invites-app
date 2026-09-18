import { loadEvent, loadGuests } from "@/lib/db/host";
import { DetailsPanel } from "@/components/host/panels/DetailsPanel";
import { DeleteEvent } from "@/components/host/DeleteEvent";

// Details: everything the invite says in words, and what the reply asks. Deleting the event sits
// at the very bottom, after everything a host actually came here to do.
export default async function Details({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests] = await Promise.all([loadEvent(id), loadGuests(id)]);
  return (
    <>
      <DetailsPanel e={e} />
      <DeleteEvent
        id={e.id}
        title={e.title}
        counts={{ guests: guests.length, replies: guests.filter((g) => g.status !== "pending").length }}
      />
    </>
  );
}
