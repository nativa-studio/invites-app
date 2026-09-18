// The shapes an invite can take. One list, because two screens offer the same choice: the setup
// flow, where a host picks a look before there is anything to preview, and the Layout tab, where
// they change their mind against the real thing.
export type LayoutOption = { id: string; name: string; line: string };

export const LAYOUTS: LayoutOption[] = [
  { id: "suite", name: "Stationery suite", line: "Cards in an envelope that opens" },
  { id: "lineup", name: "The lineup", line: "One page, artwork along the bottom" },
  { id: "peek", name: "Peek", line: "Characters leaning in from the edges" },
  { id: "post", name: "In the post", line: "An envelope opens, and the characters lean in" },
  { id: "strip", name: "Illustrated strip", line: "The same cards, no envelope, straight down" },
];

export const LAYOUT_IDS = LAYOUTS.map((l) => l.id);
