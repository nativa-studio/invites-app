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
// The invite first, because that is what a host has come to see. It used to open on the design
// gallery, on the reasoning that the template decides what parts exist and so comes first. That
// stopped being true when the design moved into the setup flow: a host arriving here from New
// event has already chosen their look two screens ago, and what they want now is the invite they
// just made, with a pencil on every part of it. The gallery sits under it, for changing your
// mind.
//
// The message stays last and stays whole rather than folding into Guests:
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
      <InviteEditor e={e} />
      <LookPanel e={e} />
      <MessagesPanel e={e} site={site} sample={sample} />
    </>
  );
}
