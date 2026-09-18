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
