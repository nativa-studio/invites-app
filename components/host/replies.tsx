import { copy } from "@/lib/copy";
import type { GuestRow } from "@/lib/db/types";
import { realAllergies } from "@/lib/allergies";

// What the people who have said yes need feeding around.
//
// This module used to carry a row of four counting tiles and a line about how many were pencilled
// in, at the top of Guests, immediately above the numbers card that says the same things with the
// working out behind it. Two answers to one question, one of them a summary of the other. The card
// stayed, since a host can open it and see where the number comes from.
//
// The food line is not a count of replies, it is a shopping list, and nothing else on the screen
// carries it. So it is what is left here.
export function foodSummary(guests: GuestRow[]) {
  const yes = guests.filter((g) => g.status === "yes");
  const tally = yes.flatMap((g) => g.dietary).reduce<Record<string, number>>((m, d) => ({ ...m, [d]: (m[d] ?? 0) + 1 }), {});
  // Allergies are counted apart and named apart. A count of chips is a shopping list; an allergy
  // is a sentence somebody has to read before they cook, and it must not be summed into "3 nut
  // free" and lost.
  // Same rule as the Tracking card: a polite "No" is not an allergy, and this line exists to be
  // read in a hurry.
  const allergies = realAllergies(yes);
  return { counts: Object.entries(tally), notes: yes.some((g) => g.dietary_note), allergies };
}

export function FoodNote({ guests }: { guests: GuestRow[] }) {
  const { counts, notes, allergies } = foodSummary(guests);
  if (!counts.length && !allergies.length) return null;
  return (
    <>
      {/* First, and on its own line, because it is the one that is not about preference. */}
      {allergies.length > 0 && (
        <p className="notice warn">
          {copy.host.allergies}{" "}
          {allergies.map((g) => `${g.name}: ${g.allergies!.trim()}`).join(" · ")}
        </p>
      )}
      {counts.length > 0 && (
        <p className="notice">
          {copy.host.food(counts.map(([kind, n]) => `${n} ${kind.toLowerCase()}`).join(", "))}
          {notes ? ` ${copy.host.foodNotes}` : ""}
        </p>
      )}
    </>
  );
}
