import type { GuestRow } from "@/lib/db/types";
import { realAllergies } from "@/lib/allergies";

// What the people who have said yes need feeding around.
//
// This module used to carry a row of four counting tiles and a line about how many were pencilled
// in, at the top of Guests, immediately above the numbers card that says the same things with the
// working out behind it. Two answers to one question, one of them a summary of the other. The card
// stayed, since a host can open it and see where the number comes from.
//
// The one-line food summary that used to sit here went the same way when Tracking folded into
// Guests: the two cards in FoodNeeds.tsx say it properly, with the names, and both Guests and the
// Overview draw them. What is left is the counting itself, which the Plan tab still needs for the
// allergy heads-up over the potluck board.
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
