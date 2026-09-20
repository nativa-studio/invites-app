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
      const kids = g.children ?? 0;
      const adults = g.adults ?? 0;
      const total = splitParty && kids + adults > 0 ? kids + adults : (g.party_size ?? 1);
      return { kids: a.kids + kids, adults: a.adults + adults, total: a.total + total, from: a.from + 1 };
    },
    { kids: 0, adults: 0, total: 0, from: 0 },
  );

  return { expected, replied, waiting: guests.filter((g) => g.status === "pending").length, splitParty };
}
