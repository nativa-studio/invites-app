// The shapes an invite can take. One list, because two screens offer the same choice: the setup
// flow, where a host picks a look before there is anything to preview, and the Layout tab, where
// they change their mind against the real thing.
export type LayoutOption = { id: string; name: string; line: string };

export const LAYOUTS: LayoutOption[] = [
  { id: "suite", name: "Stationery suite", line: "Cards in an envelope that opens" },
  { id: "lineup", name: "The lineup", line: "One page, artwork along the bottom" },
];

export const LAYOUT_IDS = LAYOUTS.map((l) => l.id);
