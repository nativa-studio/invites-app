import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { MessagesPanel } from "@/components/host/panels/MessagesPanel";

// The words that go out, rather than the words on the invite.
//
// A tab of its own because it is a different job from either of the others: the invite is what a
// guest reads once they have opened it, and this is the thing that gets them to open it. It is
// also the only part of the product a host cannot see the result of anywhere else, since the card
// a chat app draws is built from the event and does not appear until the message has been sent.
//
// The preview borrows a real guest's token, so the link in it is a link that works and the name
// is a name on the list. A host with nobody on the list yet sees the group link instead.
export default async function MessageTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests, site] = await Promise.all([loadEvent(id), loadGuests(id), getSiteUrl()]);
  const sample = guests.find((g) => g.token)?.token ?? "";
  return <MessagesPanel e={e} site={site} sample={sample} />;
}
