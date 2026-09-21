import { loadEvent, loadGuests } from "@/lib/db/host";
import { loadActivity } from "@/lib/db/activity";
import { Overview } from "@/components/host/Overview";

// The screen an event opens on.
//
// It used to be the invite editor. That answers "what does this look like", which is the right
// question in the week an invite is made and the wrong one in every week after it goes out, when
// the question is how many are coming and who has not answered. The editor is one tap away under
// Invite, and this holds the answers a host opens the app for.
export default async function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const feed = await loadActivity(id, guests);
  return <Overview e={e} guests={guests} feed={feed} />;
}
