// What a shopping item is, and the sum over a list of them.
//
// Neither the server's nor the client's, which is the whole reason it is here. The list screen is
// a client component because it ticks things off, and the page that loads the list is a server
// one, and both need this. Putting it in lib/db/shopping.ts, where it started, dragged
// lib/supabase/server.ts and next/headers into the browser bundle and the build stopped.
//
// Same rule as lib/heads.ts, and the same fault it was written for, in the other direction. See
// CLAUDE.md: anything both a server screen and a client one needs lives in a module neither of
// them owns.
export type ShoppingItem = {
  id: string;
  label: string;
  /** Free text: "2 kg", "a dozen", "enough for 30". */
  quantity: string | null;
  note: string | null;
  got: boolean;
  /** Who ticked it off, first name only. Null when nobody has, or when they have since left. */
  gotBy: string | null;
  sort: number;
};

/** How far through the list we are. Two numbers, because "6 of 14" is the whole answer. */
export function shoppingCount(items: readonly ShoppingItem[]): { got: number; total: number } {
  return { got: items.filter((i) => i.got).length, total: items.length };
}
