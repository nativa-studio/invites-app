import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";

// The good-to-know lines, in one place.
//
// Three layouts built this list, two of them from identical copies of the same function and the
// third from its own version with icons attached. Adding a line meant remembering all three.
// Each line now carries what kind of thing it is, and a layout decides whether to draw a picture
// beside it.
export type NoteKind = "bring" | "serve" | "plate" | "parents" | "gifts" | "photos" | "other";
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
