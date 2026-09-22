import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";

// The good-to-know lines, in one place.
//
// Three layouts built this list, two of them from identical copies of the same function and the
// third from its own version with icons attached. Adding a line meant remembering all three.
// Each line now carries what kind of thing it is, and a layout decides whether to draw a picture
// beside it.
// No "gifts". They have a block of their own now and are not a line here, so they are not a
// line to order either. A stale "gifts" left in a host's saved know_order is dropped by
// orderedNotes the way any unknown kind is, which is why nothing had to be backfilled.
export const NOTE_KINDS = ["siblings", "bring", "serve", "drinks", "plate", "photos", "other"] as const;
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
  // Drinks sit straight after the food, because they are the same question asked again and a
  // guest reading about the barbecue is already thinking about what is in the esky. Free text and
  // no default: the line exists when the host has written one and not otherwise.
  if (e.drinks_note?.trim()) lines.push({ kind: "drinks", text: e.drinks_note.trim() });
  // The invite's plate line and the board's own heading say different things on purpose. Here a
  // guest is deciding whether to come, so the line is what is being asked of them. The board says
  // claim something or add your own, and it is only on the page once they have said yes, which is
  // the moment that sentence means anything.
  if (e.plate_enabled) {
    lines.push({ kind: "plate", text: e.plate_host_note || (e.plate_mode === "everyone" ? copy.lines.plateEveryone : copy.lines.plateFree) });
  }
  // Gifts: every stance except quiet says something, and quiet is the point of having a stance
  // called quiet. Books and the wish list used to be offered in the editor and print nothing at
  // all, so a host picking one got silence and no way to tell it apart from a bug. A wish list
  // with no link is still silence, because the line would be an announcement with nothing behind
  // it, and the editor says so under the box.
  //
  // Gifts and photos are whatever the host wrote. They used to be a dropdown of preset wordings,
  // which is a guess at what somebody wants to say and gives a host who wants to say something
  // close but not identical nowhere to put it. The presets became each host's starting text in
  // migration 0021, so nothing changed on any invite that already existed.
  //
  // The group gift is still its own switch, because it is a fact about the event rather than a
  // sentence, and it joins onto whatever the host wrote rather than arriving as a line of its
  // own: two paragraphs about gifts read as the invite talking to itself.
  // What the host wrote is the whole of it. Nothing is appended to it, ever.
  //
  // The group gift used to add its own sentence on the end of whatever was typed, which is how
  // "Gifts are optional. There may be a group gift if you prefer that. More info to come." came
  // out of the invite followed by "If you'd like to join in, there's a group gift. Ask the host
  // and they'll let you know how." The host had already said all of that, in their own words, in
  // a field whose hint promises it is exactly what the invite says.
  //
  // The switch still writes a sentence when there is nothing to write over: a group gift that is
  // running and never mentioned is worse than a default sentence. So it fills a silence and
  // never edits a voice.
  //
  // None of it when gifts have a block of their own. The block draws the same gift_note, the same
  // wish list and the same group gift, so leaving the line here as well put one sentence on the
  // invite twice, a few centimetres apart, in two different voices. The block is the fuller of
  // the two and the switch that turns it on is a host saying gifts need more than a line.
  // Gifts are not a line here any more. They have a block of their own, which holds the same
  // sentence plus the wish list and the group gift, and a paragraph about presents sitting in a
  // list of practical facts (sun smart, BYO drinks, showers available) was never the same kind of
  // thing as the facts around it.
  //
  // It used to stand down only while the block was on, which left a host editing their invite
  // reading the same sentence twice, once here and once on the block below. Marcia: "remove the
  // top one, that should not exist."
  //
  // Nothing replaces it. An event that wants to say something about gifts switches the block on,
  // and one that does not says nothing, which is what an empty gift_note already meant.
  if (e.photos_note?.trim()) lines.push({ kind: "photos", text: e.photos_note.trim() });
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

// How much a host is asking for. The wording each one gives a guest lives in copy.plate, since
// the board and the invite both print it.
export const PLATE_MODES: [string, string][] = [
  ["free", "Optional, bring something if you like"],
  ["everyone", "Everyone brings something"],
];

export const optionValues = (options: [string, string][]): string[] => options.map(([v]) => v);

export const NOTE_NAMES: Record<NoteKind, string> = {
  siblings: "Siblings welcome",
  bring: "What to bring or wear",
  serve: "What you'll serve",
  drinks: "Drinks",
  plate: "Bring a plate",
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
