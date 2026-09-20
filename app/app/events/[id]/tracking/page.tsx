import { loadEvent, loadGuests } from "@/lib/db/host";
import { loadActivity } from "@/lib/db/activity";
import { counts } from "@/lib/heads";
import { ActivityDrawer } from "@/components/host/ActivityDrawer";
import { copy } from "@/lib/copy";
import { groupsOf } from "@/lib/group-colours";

// Tracking: where the event is up to, in four answers.
//
// The numbers first, because that is the question a host opens this screen with. Then the two
// things somebody has to read before they cook, which are not the same thing and are kept apart
// for the same reason the reply asks them separately: an allergy is a safety fact and a dietary
// need is what the kitchen works around. Then everything that has happened, behind a button.
//
// Nothing here can be edited. Every number is worked out from the guest list, and the way to
// change one is to change the guest it came from, on Guests, where a host knows whose it is.
export default async function Tracking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const feed = await loadActivity(id, guests);

  const splitParty = e.ask_party_mode === "split";
  const c = counts(guests, splitParty);
  // The same gate the event list uses. An event that asks for one number has people, not kids and
  // adults, so it must not grow a split out of stray columns.
  const breakdown = splitParty ? copy.host.split(c.replied.kids, c.replied.adults) : "";
  const coming = guests.filter((g) => g.status === "yes");
  const sent = guests.filter((g) => g.sent_at).length;
  const opened = guests.filter((g) => g.opened_at).length;

  // Only from the people who are coming. A pending guest has no answers to these, and somebody
  // who has said no is not being catered for.
  const allergies = coming.filter((g) => g.allergies?.trim());
  const chips = coming
    .flatMap((g) => g.dietary)
    .reduce<Record<string, number>>((m, d) => ({ ...m, [d]: (m[d] ?? 0) + 1 }), {});
  const chipList = Object.entries(chips).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const notes = coming.filter((g) => g.dietary_note?.trim());

  return (
    <>
      <section className="card">
        <h2 className="h2">{copy.host.trackHeading}</h2>
        {/* Heads, not households. "Coming" on a party screen means how many people walk in, and
            a count of replies answers a question nobody asked. */}
        <dl className="sum">
          <dt>{copy.host.trackComing}</dt>
          {/* The total, then the split it is made of. Only when the event asked for a split and
              somebody answered it: an event that asks for one number has people, not kids. */}
          <dd>
            {c.replied.total}
            {breakdown && <span className="muted"> ({breakdown})</span>}
          </dd>
          <dt>{copy.host.trackWaiting}</dt>
          <dd>{c.waiting}</dd>
          <dt>{copy.host.trackNo}</dt>
          <dd>{guests.filter((g) => g.status === "no").length}</dd>
          <dt>{copy.host.trackAsked}</dt>
          <dd>{guests.length}</dd>
          <dt>{copy.host.trackSent}</dt>
          <dd>{sent}</dd>
          <dt>{copy.host.trackOpened}</dt>
          <dd>{opened}</dd>
        </dl>
        {c.replied.from === 0 && <p className="hint">{copy.host.trackNobody}</p>}
      </section>

      {/* Allergies on their own, above food needs and never folded into it. It is the one thing
          on this screen somebody has to act on rather than read past, so it is named, in their
          words, and not summed into a count. */}
      <section className="card">
        <h2 className="h2">{copy.host.trackAllergies}</h2>
        <p className="hint">{copy.host.trackAllergiesBlurb}</p>
        {allergies.length === 0
          ? <p className="muted">{copy.host.trackNoAllergies}</p>
          : (
            <ul className="plain">
              {allergies.map((g) => (
                <li key={g.id}><b>{g.name}</b>: {g.allergies}</li>
              ))}
            </ul>
          )}
      </section>

      <section className="card">
        <h2 className="h2">{copy.host.trackDietary}</h2>
        <p className="hint">{copy.host.trackDietaryBlurb}</p>
        {chipList.length === 0 && notes.length === 0
          ? <p className="muted">{copy.host.trackNoDietary}</p>
          : (
            <>
              {chipList.length > 0 && (
                <p className="muted">{chipList.map(([chip, n]) => `${n} ${chip.toLowerCase()}`).join(", ")}</p>
              )}
              {/* The notes stay attached to whoever wrote them. "2 dairy free" is a shopping
                  list; "no pork please" is a sentence somebody meant for a person. */}
              {notes.length > 0 && (
                <ul className="plain">
                  {notes.map((g) => (
                    <li key={g.id}><b>{g.name}</b>: {g.dietary_note}</li>
                  ))}
                </ul>
              )}
            </>
          )}
      </section>

      <ActivityDrawer feed={feed} groups={groupsOf(guests)} />
    </>
  );
}
