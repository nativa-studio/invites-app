// A group's name, in a link and back again.
//
// A host hands out one link per group, so the link has to carry the group somewhere a person can
// read: /e/gabriel-4/neighbourhood rather than a query string nobody trusts. The name goes down to
// lower case and back up to capitals, which is exact for the one and two word names hosts
// actually use (Family, School, Neighbourhood, Book club).
export function groupSlug(label: string): string {
  return label.trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function groupLabel(slug: string): string {
  const words = slug.split("-").filter(Boolean);
  return words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(" ");
}

export function isGroupSlug(v: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/.test(v);
}

/** The people a host has not labelled yet, who are the ones worth being able to find. A group
 *  genuinely called this would collide, which is a trade against putting a control character in
 *  the address bar: a null byte in a url is refused by some proxies and unreadable in all of them. */
export const UNGROUPED = "__ungrouped";

// Everyone in the chosen group. The empty string is everybody, and the sentinel above is the
// people with no group at all.
//
// It lives here rather than beside the chips because the page filters with it on the server while
// the chips need a browser to keep the chosen one in view. Exporting it from the component made
// it a client function, and the page calling it took the whole screen down with a 500. Typecheck
// and lint both passed; only loading the page said so.
export function inGroup<T extends { groups?: string[] | null }>(guests: T[], chosen: string): T[] {
  if (!chosen) return guests;
  if (chosen === UNGROUPED) return guests.filter((x) => !x.groups?.length);
  return guests.filter((x) => x.groups?.includes(chosen));
}
