// The parts of an invite, below the cover, and the order they come in.
//
// The cover is not here: it is always first, because a card that opens on something other than
// what it is for is not an invite.
//
// The default order is the one the self-check asks for, each thing at the moment it is needed.
// What changed, then everything needed to decide whether to come, then the reply while the
// deciding is still in hand. Everything after it is for someone who has already said yes.
//
// Bring a plate is one of those, and it sits after the info booth rather than directly under the
// reply, where it used to be. Claiming a dish is a job for somebody who has read what the day
// involves, not the next thing to do after answering.
// Gifts sits after the plate and before the questions. Both are things a guest carries, so they
// read as a pair, and both belong to somebody who has already decided to come: what to bring for
// the table, then what to bring for the person.
export const INVITE_PARTS = ["updates", "details", "reply", "day", "know", "plate", "gifts", "after", "signoff"] as const;
export type InvitePart = (typeof INVITE_PARTS)[number];

export const PART_NAMES: Record<InvitePart, string> = {
  updates: "Updates",
  details: "The details",
  reply: "The reply",
  day: "The order of the afternoon",
  know: "Info booth",
  plate: "Bring a plate",
  gifts: "Gifts",
  after: "Questions",
  signoff: "The sign-off",
};

/** The column that decides whether a part appears at all. The reply and updates have none: the
 *  reply is the point of the invite, and updates show themselves only once there are any. */
export const PART_SWITCH: Partial<Record<InvitePart, string>> = {
  details: "show_details",
  // Not plate_block, which decides whether the invite carries a card announcing it before anybody
  // has replied. This is whether there is a plate at all.
  plate: "plate_enabled",
  day: "show_runsheet",
  know: "show_good_to_know",
  gifts: "show_gifts",
  after: "show_after",
  signoff: "show_signoff",
};

// A saved order, made safe to render from.
//
// Anything unknown is dropped, so a part that gets renamed or deleted later cannot leave a hole
// or crash a guest's page. Anything missing is put back at its default position rather than on
// the end, so a part added after a host last saved does not turn up under the thank you.
// An empty saved order therefore gives exactly the default, which is what every existing event
// has and why nothing had to be backfilled.
export function orderedParts(saved: readonly string[] | null | undefined): InvitePart[] {
  const known = new Set<string>(INVITE_PARTS);
  const out: InvitePart[] = [];
  for (const p of saved ?? []) {
    if (known.has(p) && !out.includes(p as InvitePart)) out.push(p as InvitePart);
  }
  INVITE_PARTS.forEach((p, i) => {
    if (!out.includes(p)) out.splice(Math.min(i, out.length), 0, p);
  });
  return out;
}

/** The heading a part carries, which is the host's word where they have written one.
 *
 *  Every layout draws its own headings, and several of them draw different words for the same
 *  part: the strip's "The day" is the lineup's "The order of the afternoon". So the layout's own
 *  word is the fallback rather than a single default written here, and the only thing this adds
 *  is the host's override on top of whatever that design would have said.
 *
 *  This is the one place section_titles is read. Six layouts draw these headings, and a rename
 *  honoured in five of them is exactly the fault CLAUDE.md opens with, so there is one function
 *  and every layout calls it.
 */
export function partTitle(
  e: { section_titles?: Record<string, string> | null },
  part: InvitePart,
  fallback: string,
): string {
  const own = e.section_titles?.[part];
  return typeof own === "string" && own.trim() ? own.trim() : fallback;
}

/** How long a heading may be. Long enough for "Everything you need to know", short enough that it
 *  cannot push a one-line heading onto three lines on a phone. Enforced on the way in, so no
 *  layout has to cope with a paragraph where a title goes. */
export const PART_TITLE_MAX = 40;

/** The parts whose heading a host may write. The reply is not one: its heading is the question
 *  with the guest's own name in it ("Can Mia make it?"), built per guest rather than stored, and
 *  the sign-off has no heading at all. */
export const NAMEABLE_PARTS: readonly InvitePart[] = ["updates", "details", "day", "know", "plate", "gifts", "after"];
