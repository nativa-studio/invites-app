// The shapes an invite can take. One list, because two screens offer the same choice: the setup
// flow, where a host picks a look before there is anything to preview, and the Layout tab, where
// they change their mind against the real thing.
/** `line` is what the tile says under the name. Optional: a design whose name already says what
 *  it is does not need a sentence repeating it. */
export type LayoutOption = {
  id: string;
  name: string;
  line?: string;
  suits: string[];
  /** Not offered any more, but still known. A design is retired by hiding it, never by deleting
   *  the row: asLayoutId reads this list to decide whether a saved value is a real design, and a
   *  deleted row would make every event already on it read as unset. The Design tab would then
   *  post the default back over their choice the next time it saved. */
  hidden?: boolean;
};

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
    name: "Pokémon",
    suits: ["kids_party", "birthday", "gathering", "baby_shower"],
  },
  // Retired at Marcia's word. Still drawn for any event already saved on it, and still reachable
  // by ?layout=lineup, but no longer offered: it is the one remaining design that does not honour
  // the order a host puts their sections in, so leaving it in the gallery meant reordering worked
  // on two designs out of three and silently did nothing on the third.
  {
    id: "lineup",
    name: "The lineup",
    line: "One page, artwork along the bottom",
    suits: ["kids_party", "birthday", "gathering", "baby_shower", "memorial"],
    hidden: true,
  },
  // The one design in the range with no photograph and no characters in it. Everything else here
  // is somebody's artwork, which is lovely for a fourth birthday and leaves a housewarming or a
  // memorial with an empty frame. This one draws its own cover from the event's theme, so it
  // suits every type and is the only one that suits an event nobody has made pictures for.
  // The two Monsters designs, approved 25 September 2026. Two shapes of the same theme: bands is
  // full-bleed colour with the characters standing on it, file is a staff pass and a clipboard.
  {
    id: "bands",
    name: "Fur bands",
    line: "Colour bands, the characters on top",
    suits: ["kids_party", "birthday"],
  },
  {
    id: "file",
    name: "Staff file",
    line: "A staff pass and a clipboard",
    suits: ["kids_party", "birthday"],
  },
  {
    id: "strip",
    name: "Illustrated strip",
    line: "One ink on paper, drawn by hand",
    suits: ["kids_party", "birthday", "gathering", "baby_shower", "memorial"],
  },
];

// The paper each design's envelope is cut from. It is a property of the design rather than of the
// event's palette, because it is the stationery: the suite is a red envelope on white, the lineup
// is a cream page and takes a warmer, deeper shade of the same paper.
//
// `ink` is the odd one and the reason this is not just two names. The illustrated strip has no
// fixed paper at all: it is one ink on a tint of that ink, chosen per event, so its envelope is
// mixed from the same two colours rather than picked from a list. Everything that draws an
// envelope therefore has to handle a stock whose colours it will not know until it has the event.
export type Stock = "red" | "beige" | "ink" | "fur" | "manila";

const STOCK: Record<string, Stock> = { suite: "red", lineup: "beige", strip: "ink", bands: "fur", file: "manila" };

export function stockFor(layout: string | null | undefined): Stock {
  return STOCK[layout ?? ""] ?? "red";
}

/** The designs that suit a kind of party, and the ones that do not, kept apart rather than lost. */
export function designsFor(type: string | null | undefined): { fits: LayoutOption[]; rest: LayoutOption[] } {
  const offered = LAYOUTS.filter((l) => !l.hidden);
  if (!type) return { fits: offered, rest: [] };
  return {
    fits: offered.filter((l) => l.suits.includes(type)),
    rest: offered.filter((l) => !l.suits.includes(type)),
  };
}

export const LAYOUT_IDS = LAYOUTS.map((l) => l.id);

// The first one is the default, and anything unrecognised lands on it.
//
// The database used to default layout_id to 'strip' when the strip was a layout that had been
// cut, so events landed on a design that did not exist: the picker showed nothing chosen and the
// line under it read "Guests see strip." Reading the saved value through here means both agree.
// The strip is a real design again, and migration 0034 moves that default to the suite, so
// nothing lands on a look nobody picked.
export function asLayoutId(v: string | null | undefined): string {
  return LAYOUT_IDS.includes(v ?? "") ? (v as string) : LAYOUTS[0].id;
}
