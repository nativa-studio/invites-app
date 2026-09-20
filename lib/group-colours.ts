// A colour per group, worked out rather than stored.
//
// Nothing in the database says what colour Friends is, and nothing should: a host renames a group
// and the colour follows the name, with no column to migrate and nothing to keep in step.
//
// By position in the event's own sorted list of groups, not by hashing the name. A hash gives two
// of five groups the same colour often enough to matter, and two groups the same colour is worse
// than no colour at all, because it looks like a statement that they are related.
//
// Eight is plenty. A host with nine groups gets the ninth sharing with the first, which is the
// honest failure: the list is sorted, so the pair are far apart on the page.
export const GROUP_COLOURS = 8;

export function groupColour(name: string | null, known: readonly string[]): number | null {
  if (!name) return null;
  const at = known.indexOf(name);
  // A group that is not in the list at all, which is a guest carrying a label nobody else has.
  // It still gets a colour rather than none, so the tag does not look broken.
  const i = at >= 0 ? at : known.length;
  return i % GROUP_COLOURS;
}

/** Every group on this list of guests, sorted, which is what the colours are indexed by. */
export function groupsOf(guests: readonly { groups: string[] | null }[]): string[] {
  return [...new Set(guests.flatMap((g) => g.groups ?? []))].sort((a, b) => a.localeCompare(b));
}
