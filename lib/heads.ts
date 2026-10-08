import type { GuestRow } from "@/lib/db/types";

// How many people, counted twice on purpose. Plain module, not a component.
//
// It lived in HeadCount.tsx, which is a client component, and every export of a "use client"
// module is a client reference on the server. So the Tracking page, which is a server component,
// could import counts() and could not call it: "Attempted to call counts() from the server but
// counts is on the client". The page 500ed and neither typecheck nor lint could see it, because
// nothing about the types is wrong.
//
// Anything both a server screen and a client one needs has to live somewhere neither of them
// owns. That is here.
export type Heads = { kids: number; adults: number; total: number; from: number };

/** How many people one guest brings, and how that splits, for everything that counts heads.
 *
 *  One function because there were two sums. This one, and the Overview's own "on the list"
 *  reducer, which asked almost the same question with almost the same code. They disagreed the
 *  moment anything unusual turned up, which is what happened: see the fallback below.
 *
 *  `no` brings nobody. `pending` brings what the host pencilled in, because that is the only
 *  number there is. `yes` is the one with a ladder:
 *
 *  1. What they answered. Their own numbers beat anybody's guess.
 *  2. What the host pencilled in, when they answered nothing. This step was missing, and it is
 *     the whole bug. A host who marks somebody coming is never asked for kids and adults, so
 *     those stay empty and the count fell straight to step 3: one person, in the total and in
 *     neither half. So the host's own estimate of two adults was thrown away and replaced by one,
 *     the split stopped adding up to the headline, and the catering number came out short.
 *  3. Their party size, or one. A guest who replied before this event asked for a split has a
 *     size and no breakdown, so their people belong in the total and in neither half. That is the
 *     one case where kids plus adults is honestly less than the total, and the screen says so
 *     rather than leaving a host checking the arithmetic.
 */
export function headsFor(g: GuestRow, splitParty: boolean): { kids: number; adults: number; total: number } {
  if (g.status === "no") return { kids: 0, adults: 0, total: 0 };
  const pencilled = { kids: g.expected_children ?? 0, adults: g.expected_adults ?? 0 };
  if (g.status !== "yes") return { ...pencilled, total: pencilled.kids + pencilled.adults };

  const answered = { kids: g.children ?? 0, adults: g.adults ?? 0 };
  if (splitParty && answered.kids + answered.adults > 0) {
    return { ...answered, total: answered.kids + answered.adults };
  }
  if (pencilled.kids + pencilled.adults > 0) {
    return { ...pencilled, total: pencilled.kids + pencilled.adults };
  }
  return { kids: 0, adults: 0, total: g.party_size ?? 1 };
}

export function counts(guests: GuestRow[], splitParty: boolean) {
  // The plan: what the host expects, across every guest, replied or not. A guest with nothing
  // pencilled in counts as nobody rather than as one, because a guess is not a number.
  const expected = guests.reduce<Heads>(
    (a, g) => {
      const kids = g.expected_children ?? 0;
      const adults = g.expected_adults ?? 0;
      return { kids: a.kids + kids, adults: a.adults + adults, total: a.total + kids + adults, from: a.from + (kids + adults > 0 ? 1 : 0) };
    },
    { kids: 0, adults: 0, total: 0, from: 0 },
  );

  // The fact: what the people who said yes actually answered. In single-party mode nobody was
  // asked to split their party into kids and adults, so party_size is all there is, and the
  // split is reported as not asked rather than as zero of each.
  const replied = guests.filter((g) => g.status === "yes").reduce<Heads>(
    (a, g) => {
      const h = headsFor(g, splitParty);
      return { kids: a.kids + h.kids, adults: a.adults + h.adults, total: a.total + h.total, from: a.from + 1 };
    },
    { kids: 0, adults: 0, total: 0, from: 0 },
  );

  return { expected, replied, waiting: guests.filter((g) => g.status === "pending").length, splitParty };
}
