import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { InviteEditor } from "@/components/host/InviteEditor";
import { LookPanel } from "@/components/host/panels/LookPanel";
import { MessagesPanel } from "@/components/host/panels/MessagesPanel";

// The invite: what it looks like, what it says, and the words that carry it.
//
// Three tabs until now, and they were three answers to one question. Look picked the template,
// the editor changed the words on it, and Message wrote the text that delivers it. A host doing
// any one of those is doing the invite, and the old split meant choosing a colour and seeing
// what it did to the cover were two taps and a screen apart.
//
// In this order because it is the order the decisions depend on each other: the template decides
// what parts exist, the parts hold the words, and the message is the last thing, written once
// there is something to send. Message stays last and stays whole rather than folding into Guests:
// it is the one part of the product whose result a host cannot see anywhere else, since the card
// a chat app draws is built from the event and does not exist until a message has been sent.
export default async function InviteTab({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const [e, guests, site] = await Promise.all([loadEvent(id), loadGuests(id), getSiteUrl()]);
  // The preview borrows a real guest's token, so the link in it works and the name is a name on
  // the list. A host with nobody on the list yet sees the group link instead.
  const sample = guests.find((g) => g.token)?.token ?? "";

  return (
    <>
      {isNew === "1" && <p className="notice">{copy.host.newEventNext}</p>}
      <LookPanel e={e} />
      <InviteEditor e={e} />
      <MessagesPanel e={e} site={site} sample={sample} />
    </>
  );
}
