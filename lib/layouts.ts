// The shapes an invite can take. One list, because two screens offer the same choice: the setup
// flow, where a host picks a look before there is anything to preview, and the Layout tab, where
// they change their mind against the real thing.
export type LayoutOption = { id: string; name: string; line: string; suits: string[] };

// `suits` is which kinds of party a design is right for, and it is a judgement rather than a
// rule: the suite is tape, tilted cards and characters standing in the corner, which is lovely
// for a fourth birthday and wrong for a memorial. The lineup is one quiet page and reads well
// for anything, a memorial included.
//
// A host is never stopped from having the one they want. The type only decides what is offered
// first, and the Design tab says how many were left out and offers to show them.
export const LAYOUTS: LayoutOption[] = [
  {
    id: "suite",
    name: "Stationery suite",
    line: "Cards in an envelope that opens",
    suits: ["kids_party", "birthday", "gathering", "baby_shower"],
  },
  {
    id: "lineup",
    name: "The lineup",
    line: "One page, artwork along the bottom",
    suits: ["kids_party", "birthday", "gathering", "baby_shower", "memorial"],
  },
];

// The paper each design's envelope is cut from. It is a property of the design rather than of the
// event's palette, because it is the stationery: the suite is a red envelope on white, the lineup
// is a cream page and takes a warmer, deeper shade of the same paper.
const STOCK: Record<string, "red" | "beige"> = { suite: "red", lineup: "beige" };

export function stockFor(layout: string | null | undefined): "red" | "beige" {
  return STOCK[layout ?? ""] ?? "red";
}

/** The designs that suit a kind of party, and the ones that do not, kept apart rather than lost. */
export function designsFor(type: string | null | undefined): { fits: LayoutOption[]; rest: LayoutOption[] } {
  if (!type) return { fits: LAYOUTS, rest: [] };
  return {
    fits: LAYOUTS.filter((l) => l.suits.includes(type)),
    rest: LAYOUTS.filter((l) => !l.suits.includes(type)),
  };
}

export const LAYOUT_IDS = LAYOUTS.map((l) => l.id);

// The first one is the default, and anything unrecognised lands on it.
//
// The database still defaults layout_id to 'strip', a layout that was cut. Those events render as
// the suite, which is the right thing, but the picker showed nothing chosen and the line under it
// read "Guests see strip." Reading the saved value through here means both agree.
export function asLayoutId(v: string | null | undefined): string {
  return LAYOUT_IDS.includes(v ?? "") ? (v as string) : LAYOUTS[0].id;
}
