import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";

// The good-to-know lines, in one place.
//
// Three layouts built this list, two of them from identical copies of the same function and the
// third from its own version with icons attached. Adding a line meant remembering all three.
// Each line now carries what kind of thing it is, and a layout decides whether to draw a picture
// beside it.
export const NOTE_KINDS = ["bring", "serve", "plate", "parents", "gifts", "photos", "other"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];
export type Note = { kind: NoteKind; text: string };

export function goodToKnow(e: PublicEvent): Note[] {
  const lines: Note[] = [];
  // What to bring or wear comes first: it is the one line a guest has to act on before they leave
  // the house. It used to sit on the details card, next to when and where, which is the moment for
  // deciding whether to come rather than the moment for getting ready.
  if (e.what_to_bring) lines.push({ kind: "bring", text: e.what_to_bring });
  if (e.serve_text) lines.push({ kind: "serve", text: e.serve_text });
  if (e.plate_enabled && e.plate_host_note) lines.push({ kind: "plate", text: e.plate_host_note });
  if (e.type === "kids_party" && e.parents_mode === "stay") {
    lines.push({ kind: "parents", text: e.siblings_welcome ? `${copy.lines.parentsStay} ${copy.lines.siblingsWelcome}` : copy.lines.parentsStay });
  }
  if (e.type === "kids_party" && e.parents_mode === "drop_off") lines.push({ kind: "parents", text: copy.lines.dropOff });
  if (e.gift_stance === "none") lines.push({ kind: "gifts", text: copy.lines.giftsNone });
  if (e.gift_stance === "optional") lines.push({ kind: "gifts", text: e.gift_note ? `${copy.lines.giftsOptional} ${e.gift_note}` : copy.lines.giftsOptional });
  if (e.photo_sharing === "kids_off_social") lines.push({ kind: "photos", text: copy.lines.photosKidsOff });
  if (e.photo_sharing === "ask") lines.push({ kind: "photos", text: copy.lines.photosAsk });
  if (e.photo_sharing === "share") lines.push({ kind: "photos", text: copy.lines.photosShare });
  if (e.good_to_know) lines.push({ kind: "other", text: e.good_to_know });
  return lines;
}

export const NOTE_NAMES: Record<NoteKind, string> = {
  bring: "What to bring or wear",
  serve: "What you'll serve",
  plate: "Bring a plate",
  parents: "Parents and siblings",
  gifts: "Gifts",
  photos: "Photos",
  other: "Anything else",
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
