import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";

// The good-to-know lines, in one place.
//
// Three layouts built this list, two of them from identical copies of the same function and the
// third from its own version with icons attached. Adding a line meant remembering all three.
// Each line now carries what kind of thing it is, and a layout decides whether to draw a picture
// beside it.
export const NOTE_KINDS = ["siblings", "bring", "serve", "plate", "gifts", "photos", "other"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];
export type Note = { kind: NoteKind; text: string };

export function goodToKnow(e: PublicEvent): Note[] {
  const lines: Note[] = [];
  // Whether the other children can come is the first thing a parent works out, before what to
  // pack and long before what to buy: a no means arranging somebody to have them, and the answer
  // used to be nowhere on the invite at all although the event has carried the switch since the
  // first migration. It only ever says yes. A silent invite is not a no, it is a question the
  // parent has to ask, which is the thing this line exists to save them.
  if (e.siblings_welcome) lines.push({ kind: "siblings", text: copy.lines.siblings });
  // What to bring or wear comes next: it is the one line a guest has to act on before they leave
  // the house. It used to sit on the details card, next to when and where, which is the moment for
  // deciding whether to come rather than the moment for getting ready.
  if (e.what_to_bring) lines.push({ kind: "bring", text: e.what_to_bring });
  if (e.serve_text) lines.push({ kind: "serve", text: e.serve_text });
  if (e.plate_enabled && e.plate_host_note) lines.push({ kind: "plate", text: e.plate_host_note });
  // Gifts: every stance except quiet says something, and quiet is the point of having a stance
  // called quiet. Books and the wish list used to be offered in the editor and print nothing at
  // all, so a host picking one got silence and no way to tell it apart from a bug. A wish list
  // with no link is still silence, because the line would be an announcement with nothing behind
  // it, and the editor says so under the box.
  if (e.gift_stance === "none") lines.push({ kind: "gifts", text: copy.lines.giftsNone });
  if (e.gift_stance === "optional") lines.push({ kind: "gifts", text: e.gift_note ? `${copy.lines.giftsOptional} ${e.gift_note}` : copy.lines.giftsOptional });
  if (e.gift_stance === "books") lines.push({ kind: "gifts", text: e.gift_note ? `${copy.lines.giftsBooks} ${e.gift_note}` : copy.lines.giftsBooks });
  if (e.gift_stance === "wishlist" && e.gift_note) lines.push({ kind: "gifts", text: `${copy.lines.giftsWishlist} ${e.gift_note}` });
  if (e.photo_sharing === "kids_off_social") lines.push({ kind: "photos", text: copy.lines.photosKidsOff });
  if (e.photo_sharing === "ask") lines.push({ kind: "photos", text: copy.lines.photosAsk });
  if (e.photo_sharing === "share") lines.push({ kind: "photos", text: copy.lines.photosShare });
  if (e.good_to_know) lines.push({ kind: "other", text: e.good_to_know });
  return lines;
}

// What a host can say about gifts and about photos, in one place, because it was in two.
//
// The editor offered Say nothing and the save action kept a separate list of the values it would
// accept. Adding the setting to one and not the other meant the choice was dropped on the way in
// without a word: the screen said saved, the row kept what it had, and the line stayed on the
// invite. One list, read by both, so a setting that can be picked is a setting that can be saved.
export const GIFT_OPTIONS: [string, string][] = [
  ["quiet", "Say nothing"],
  ["none", "No gifts please"],
  ["optional", "Gifts optional"],
  ["books", "Books only"],
  ["wishlist", "Wish list link"],
];

export const PHOTO_OPTIONS: [string, string][] = [
  ["none", "Say nothing"],
  ["kids_off_social", "Please keep photos of the kids off social media"],
  ["ask", "Please ask before posting anyone's photos"],
  ["share", "Share away"],
];

export const optionValues = (options: [string, string][]): string[] => options.map(([v]) => v);

export const NOTE_NAMES: Record<NoteKind, string> = {
  siblings: "Brothers and sisters",
  bring: "What to bring or wear",
  serve: "What you'll serve",
  plate: "Bring a plate",
  gifts: "Gifts",
  photos: "Photos",
  other: "Other notes",
};

// The lines a host has, in the order they have put them in.
//
// Same shape as the invite's own part order, and for the same reasons. Anything unknown is
// dropped, so a kind that gets renamed later cannot leave a hole or crash a guest's page. Anything
// missing is put back at its default position rather than on the end, so a line added after a host
// last saved does not turn up under the last one. An empty saved order gives exactly the default.
//
// Kinds the event has nothing to say about never appear at all: the order is over the lines that
// exist, not over the ones that could.
export function orderedNotes(e: PublicEvent): Note[] {
  const lines = goodToKnow(e);
  const saved = e.know_order ?? [];
  const byKind = new Map(lines.map((l) => [l.kind, l]));
  const out: NoteKind[] = [];
  for (const k of saved) {
    if (byKind.has(k as NoteKind) && !out.includes(k as NoteKind)) out.push(k as NoteKind);
  }
  NOTE_KINDS.forEach((k, i) => {
    if (byKind.has(k) && !out.includes(k)) out.splice(Math.min(i, out.length), 0, k);
  });
  return out.map((k) => byKind.get(k)!);
}

// Every kind, in the host's order. The editor needs this: the invite shows only the lines that
// have something in them, but the place you write them has to show all of them or there is no way
// to fill an empty one in.
export function orderedKinds(saved: readonly string[] | null | undefined): NoteKind[] {
  const known = new Set<string>(NOTE_KINDS);
  const out: NoteKind[] = [];
  for (const k of saved ?? []) {
    if (known.has(k) && !out.includes(k as NoteKind)) out.push(k as NoteKind);
  }
  NOTE_KINDS.forEach((k, i) => {
    if (!out.includes(k)) out.splice(Math.min(i, out.length), 0, k);
  });
  return out;
}
