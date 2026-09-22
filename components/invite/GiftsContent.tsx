import React from "react";
import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";

// What the gifts block says, once, for every layout that draws one.
//
// Five layouts draw this now and they do not agree on clothes: the suite puts it on a tilted
// cream card with tape, the strip has no cards at all, peek and lineup run it as lines under a
// label. What it says is the same in all five, so what it says lives here and each layout wraps
// it in its own container. The plate card and the gift card are each written out three times and
// CLAUDE.md records that they will drift; this is the same content in five places, which would
// have been worse, so it is one.
//
// The container has to carry the `gifts` class for the four rules in invite.css that size the
// ideas line and the rule between the parts.

/** Whether there is anything at all to say about gifts. Every layout guards on this, so an empty
 *  block is impossible: a heading with nothing under it is worse than no heading. */
export function hasGifts(e: PublicEvent): boolean {
  return Boolean(e.gift_note?.trim()) || (e.wishlist ?? []).length > 0 || Boolean(e.group_gift_enabled);
}

export function GiftsContent({ e, editing }: {
  e: PublicEvent;
  /** The host's editor, where an empty block still says something so the card can be tapped. */
  editing?: boolean;
}) {
  const note = e.gift_note?.trim();
  const list = e.wishlist ?? [];
  // undefined means no group gift at all; null means one is running with nothing typed about it
  // yet, which is still worth saying.
  const group = e.group_gift_enabled ? (e.group_gift_what?.trim() || null) : undefined;
  const said = e.group_gift_note?.trim();

  return (
    <>
      {note
        ? <p className="para">{note}</p>
        : editing && <p className="para">{copy.host.giftsEmpty}</p>}

      {list.length > 0 && (
        // Shut to begin with. The block runs long once a host has filled it in, and the two parts
        // below the opening sentence are both optional detail: what they would like, and whether
        // there is a group thing. A guest deciding what to bring opens the one they want. Native
        // details and summary, so it works with no JavaScript, takes the keyboard, and does not
        // make this a client component.
        <details className="gift-part">
          <summary className="label sky small-label">{copy.sections.wishlist}</summary>
          {/* A sentence, not a list of things to study. Same shape as What's covered on the plate
              card, and for the same reason: a guest reads this once, to know roughly what would
              be welcome, and it should take one line of reading and no decisions. */}
          <p className="para ideas">
            {list.map((w, i) => (
              <React.Fragment key={`${w.label}-${i}`}>
                {w.url
                  ? <a href={w.url} target="_blank" rel="noreferrer">{w.label}</a>
                  : w.label}
                {joiner(i, list.length)}
              </React.Fragment>
            ))}
          </p>
        </details>
      )}

      {group !== undefined && (
        <details className="gift-part">
          <summary className="label sky small-label">{copy.sections.groupGift}</summary>
          {/* Everything about the group gift under its own title, including the host's sentence,
              which used to sit above the title where it read as part of the opening paragraph
              rather than as the start of this part. */}
          {/* The host's words win outright. Nothing is appended to them, ever. That rule had to
              be written in after the group gift started adding its own sentence onto the end of
              whatever a host had typed, and an invite came out saying the same thing twice in two
              voices. Empty, the app's sentence fills the silence: a group gift that is running
              and never mentioned is worse than a default line. */}
          <p className="para">
            {said || (group ? copy.gift.blockWhat(group) : copy.gift.blockNoWhat)}
          </p>
          {/* What the present actually is. Only when the host wrote their own sentence: theirs
              replaces the app's, and the app's is the one that names the present, so writing your
              own quietly cost a guest the one fact they need before chipping in. Without a
              sentence of their own, blockWhat above already names it. */}
          {said && group && <p className="para ideas">{group}</p>}
          <p className="small">{copy.gift.blockHow}</p>
        </details>
      )}
    </>
  );
}

// ", " between, " and " before the last. The same shape sentenceList gives, written out here
// because the labels can carry links and a joined string cannot.
function joiner(i: number, n: number): string {
  if (i >= n - 1) return "";
  return i === n - 2 ? " and " : ", ";
}
