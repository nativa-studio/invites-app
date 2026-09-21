import { copy } from "@/lib/copy";
import type { GuestRow } from "@/lib/db/types";
import { realAllergies } from "@/lib/allergies";

// What has to be cooked around, in two cards that are never one card.
//
// An allergy is a safety fact and a dietary need is what the kitchen works around, and they are
// kept apart here for the same reason the reply asks them as two separate questions. Folding
// them together produces a line like "3 dietary requirements", which is true, contains an
// epipen, and reads like a preference.
//
// Lifted out of the Tracking page when Tracking folded into Guests, so the Overview can show the
// same two answers without a second implementation of them. Not a client component: both screens
// that draw it are server screens, and it has nothing to press.
export function FoodNeeds({ guests }: { guests: GuestRow[] }) {
  // Only from the people who are coming. A pending guest has no answers to these, and somebody
  // who has said no is not being catered for.
  const coming = guests.filter((g) => g.status === "yes");
  const allergies = realAllergies(coming);
  const chips = coming
    .flatMap((g) => g.dietary)
    .reduce<Record<string, number>>((m, d) => ({ ...m, [d]: (m[d] ?? 0) + 1 }), {});
  const chipList = Object.entries(chips).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const notes = coming.filter((g) => g.dietary_note?.trim());

  return (
    <>
      {/* Allergies on their own, above food needs and never folded into it. It is the one thing
          here somebody has to act on rather than read past, so it is named, in their words, and
          not summed into a count. */}
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
    </>
  );
}
