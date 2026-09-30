import { copy } from "@/lib/copy";
import type { Happening } from "@/lib/db/activity";

// One line of the feed, as a sentence.
//
// Two screens draw this feed: the five most recent things on the Overview, and all eighty of them
// in the drawer behind Guests. They wrote the sentence themselves, and one of them got it wrong.
//
// Every other kind of line takes a name and nothing else, so `did[kind](who)` reads every one of
// them. Crossing a present off takes a name and the present, because "Sarah is getting something"
// tells a host nothing: the whole reason that line exists is to stop them wondering about the
// scooter. The Overview knew that and the drawer did not, so the short feed named the present and
// the long one, the one you open to read the detail, said "Sarah is getting one of the ideas".
//
// Here rather than in either of them, because one is a server screen and the other is "use client"
// and this is the thing they share. Same rule as counts() and lib/heads.ts.
export function happeningLine(h: Happening): string {
  return h.kind === "wishClaimed"
    ? copy.host.did.wishClaimed(h.who, h.what)
    : copy.host.did[h.kind](h.who);
}
