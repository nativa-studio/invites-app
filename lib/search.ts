// Finding one person in a long list, by typing part of their name.

// A host types "gael" and means Gaël, types "GABE" and means Gabe, and types with a trailing
// space more often than not, because a phone keyboard adds one after every word. None of that
// should be the difference between finding somebody and deciding the app has lost them.
//
// Accents come off with NFD, which splits a letter into the letter plus its mark, and then the
// marks are dropped. It is the one line that makes é, è and ê all match a typed e, and it is why
// this is a function rather than a call to toLowerCase at each site.
export function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

// Does this guest answer to what was typed?
//
// Both names are searched, because the name on the invite and the name of the person holding the
// phone are often different people: "The Nguyens" is texted to Tommy, and a host looking for
// Tommy is looking for that row.
//
// Any part of the name matches, not just the start. A host who knows a guest as Ben searches ben
// and should find Bennett, and one who only remembers a surname should find it too. The lists are
// tens of people, not thousands, so a loose match costs nothing and a strict one costs a guest.
export function matches(guest: { name: string; contact_name?: string | null }, typed: string): boolean {
  const q = fold(typed);
  if (!q) return true;
  return fold(guest.name).includes(q) || fold(guest.contact_name ?? "").includes(q);
}
