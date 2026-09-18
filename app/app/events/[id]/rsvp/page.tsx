import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { ReplyCounts, ReplyNotes, tally } from "@/components/host/ReplyCounts";
import { RsvpPanel } from "@/components/host/panels/RsvpPanel";

// RSVP: what people have said, then what they are asked.
//
// The numbers come first because they are what a host opens this for. The settings sit under
// them, in the order they matter: when replies close, what the questions are, what the buttons
// say.
export default async function Rsvp({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, list] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const r = tally(list, e.ask_party_mode === "split");
  const replied = r.yes.length + r.no.length;

  return (
    <>
      <ReplyCounts r={r} />
      <ReplyNotes r={r} />
      {/* Changing the questions after somebody has answered them is the one thing here that
          cannot be undone for that guest, so it is said once, at the top, before the cards. */}
      {list.length > 0 && replied === 0 && <p className="notice">{copy.host.rsvpNobodyYet}</p>}
      <RsvpPanel e={e} />
    </>
  );
}
