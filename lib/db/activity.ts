import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { GuestRow } from "./types";
import { copy } from "@/lib/copy";
import { saysNoAllergy } from "@/lib/allergies";

// What has happened on this event, newest first.
//
// It comes from two places, because the two record different things and neither one is enough.
//
// The activity table holds a row per event, so it keeps a history: a guest who said yes in
// October and no in November has both, and the trail says so. The guest row holds one timestamp
// per kind, so it only ever remembers the last one, but it is the only record of three things
// that were never written to activity at all: their link going out, their first look at it, and a
// reminder.
//
// So: activity for the things that can happen more than once, guest columns for the things that
// are stamped once, merged and sorted. Nothing is counted twice, because no kind appears in both.
export type Happening = {
  at: string;
  kind: "yes" | "no" | "joined" | "calendar" | "token" | "sent" | "opened" | "reminded" | "groupOpen";
  who: string;
  /** The group they are labelled with, for the tag beside the line. Null for anybody who has not
   *  been put in one, which shows nothing rather than the words "no group": the tag is there to
   *  tell two Sarahs apart, not to nag about tidying the list. */
  group: string | null;
  /** What the guest wrote when they replied: allergies, then food, then their note to the host.
   *  Empty for every other kind of line, and for a reply that came with nothing written on it.
   *
   *  Only ever on a guest's newest reply. The activity table keeps every reply a guest has made,
   *  the guest row keeps one set of answers, so hanging today's words on last month's line would
   *  be putting a note against a decision it was never written about. */
  said?: Said[];
};

/** One line of what a guest wrote. `warn` is the allergy line and nothing else: it is the one
 *  thing here somebody has to act on rather than read past, and it is marked so it cannot be
 *  skimmed as another dietary preference. */
export type Said = { text: string; warn?: boolean };

type Row = {
  kind: string;
  detail: string | null;
  at: string;
  guest: Named | Named[] | null;
};

type Named = { id: string; name: string; groups: string[] | null };

// One group per guest in the app, even though the column holds a list: the picker on a guest's
// row sets one. First is therefore the one, and a guest who somehow carries two is labelled with
// the first rather than with a crowd of tags.
const groupOf = (g: { groups?: string[] | null } | null | undefined) => g?.groups?.[0] ?? null;

export const loadActivity = cache(async (eventId: string, guests: GuestRow[]): Promise<Happening[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity")
    .select("kind, detail, at, guest:guests(id, name, groups)")
    .eq("event_id", eventId)
    .order("at", { ascending: false })
    .limit(120);

  const byId = new Map(guests.map((g) => [g.id, g]));
  // Rows arrive newest first, so the first reply seen for a guest is their current one, and it is
  // the only one their notes belong on.
  const noted = new Set<string>();

  const out: Happening[] = [];
  for (const row of (data ?? []) as Row[]) {
    const g = Array.isArray(row.guest) ? row.guest[0] : row.guest;
    // Somebody opened a group link. The one kind here that belongs to nobody: there is no row to
    // attribute it to, so it carries the link it was rather than a name, and the group tag beside
    // the time says which link. Handled before the name check, which every other kind must pass.
    if (row.kind === "group_open") {
      out.push({ at: row.at, kind: "groupOpen", who: copy.host.someone, group: row.detail });
      continue;
    }
    // A guest who has since been removed takes their name with them, and a line about nobody is
    // worse than no line.
    const who = g?.name;
    if (!who) continue;
    const kind = row.kind === "rsvp"
      ? (row.detail === "yes" ? "yes" : row.detail === "no" ? "no" : null)
      : row.kind === "joined" || row.kind === "calendar" || row.kind === "token"
        ? (row.kind as Happening["kind"])
        : null;
    if (!kind) continue;
    const reply = kind === "yes" || kind === "no";
    const said = reply && g && !noted.has(g.id) ? (noted.add(g.id), saidBy(byId.get(g.id))) : [];
    out.push({ at: row.at, kind, who, group: groupOf(g), ...(said.length ? { said } : {}) });
  }

  for (const g of guests) {
    const group = groupOf(g);
    if (g.sent_at) out.push({ at: g.sent_at, kind: "sent", who: g.name, group });
    if (g.opened_at) out.push({ at: g.opened_at, kind: "opened", who: g.name, group });
    if (g.reminded_at) out.push({ at: g.reminded_at, kind: "reminded", who: g.name, group });
  }

  return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)).slice(0, 80);
});

// What a guest wrote with their reply, in the order a host needs it.
//
// Allergies first and on their own line, never folded in with the food chips. An allergy is a
// safety fact somebody has to act on; a preference is a thing to remember when shopping. The two
// read the same on a screen and are not the same, so the prefix says which is which. Same rule as
// the potluck's allergy banner and the Food and drink card on this screen.
//
// Their note to the host is last and in quotes, because it is the one line here that is the guest
// talking rather than a field being reported.
function saidBy(g: GuestRow | undefined): Said[] {
  if (!g) return [];
  const food = [g.dietary.join(", "), g.dietary_note?.trim()].filter(Boolean).join(" · ");
  // "No", "None that we know of", "N/A". The question is asked of everybody who says yes, so
  // most answers to it are polite nothings, and a feed that bolds "Allergies: No" on six lines
  // buries the one that says Romik carries an epipen. Same filter as the Food and drink card,
  // which errs one way only: anything with a real word in it is kept.
  const allergies = saysNoAllergy(g.allergies) ? null : g.allergies?.trim();
  const note = g.note?.trim();
  return [
    allergies ? { text: copy.host.saidAllergies(allergies), warn: true } : null,
    food ? { text: copy.host.saidFood(food) } : null,
    note ? { text: copy.host.saidNote(note) } : null,
  ].filter((s): s is Said => Boolean(s));
}
