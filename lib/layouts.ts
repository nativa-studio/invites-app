// The shapes an invite can take. One list, because two screens offer the same choice: the setup
// flow, where a host picks a look before there is anything to preview, and the Layout tab, where
// they change their mind against the real thing.
export type LayoutOption = { id: string; name: string; line: string };

export const LAYOUTS: LayoutOption[] = [
  { id: "suite", name: "Stationery suite", line: "Cards in an envelope that opens" },
  { id: "lineup", name: "The lineup", line: "One page, artwork along the bottom" },
];

export const LAYOUT_IDS = LAYOUTS.map((l) => l.id);

// The first one is the default, and anything unrecognised lands on it.
//
// The database still defaults layout_id to 'strip', a layout that was cut. Those events render as
// the suite, which is the right thing, but the picker showed nothing chosen and the line under it
// read "Guests see strip." Reading the saved value through here means both agree.
export function asLayoutId(v: string | null | undefined): string {
  return LAYOUT_IDS.includes(v ?? "") ? (v as string) : LAYOUTS[0].id;
}
