import React from "react";
import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";
import { Gift as GiftIcon } from "@/components/art/icons";

// Gifts, as a block of its own.
//
// Everything about gifts used to be one line in the info booth. That is the right size for "gifts
// optional" and far too small for a wish list, which is a list of things and reads as one.
//
// Three parts, and each one draws only if the host has given it something. A block with a heading
// and nothing under it is worse than no block:
//
//   1. What the host wants to say about gifts. Their words, never edited, never appended to.
//   2. The wish list, as one sentence under its own label. It was tiles with a note under each,
//      which turned four ideas into most of a screen and read like a set of instructions; then it
//      was the plate card's footnote line, which went too far the other way and lost the list
//      inside a single uppercase run. A guest reads this once, to know roughly what would be
//      welcome, and it should look like the few things it is.
//   3. The group gift, named. Only what it is and that it is happening. Where to send money and
//      who has already chipped in live on the card after the reply, which takes a token and
//      answers only for somebody who has said yes: a stranger opening a forwarded link should not
//      be reading somebody's bank details.
//
// Nothing here is a button. The whole block is for reading, which is why it can sit on the invite
// before anybody has answered without asking anything of them.
export function GiftsCard({ e, off }: {
  e: PublicEvent;
  /** Only the host's editor passes this, and passing it at all means "draw even with nothing in
   *  you". A part switched off has to keep drawing there, faded, because the switch that turns it
   *  back on lives in the drawer behind this card and nothing else opens that drawer. With no
   *  note, no list and no group gift there would be nothing on the screen to tap, and the block
   *  would be a feature a host could not find. That is the fault CLAUDE.md opens with. */
  off?: boolean;
}) {
  const editing = off !== undefined;
  const note = e.gift_note?.trim();
  const list = e.wishlist ?? [];
  const group = e.group_gift_enabled ? (e.group_gift_what?.trim() || null) : undefined;
  // undefined means no group gift at all; null means one is running with nothing typed about it
  // yet, which is still worth saying.
  const hasGroup = group !== undefined;
  const said = e.group_gift_note?.trim();
  if (!editing && !note && list.length === 0 && !hasGroup) return null;

  return (
    <div className={`pcard cream tilt-l gifts${off ? " off" : ""}`} data-section="gifts">
      <div className="tape cross" />
      <div className="tape over sky" />
      <div className="label red">{copy.sections.gifts}</div>
      <GiftIcon size={36} />

      {note
        ? <p className="para">{note}</p>
        : editing && <p className="para">{copy.host.giftsEmpty}</p>}

      {list.length > 0 && (
        <>
          {/* No rule above this one. The ideas follow straight on from whatever the host wrote,
              because they are the same thought continued. The rule below separates that thought
              from the group gift, which is a different one. */}
          {/* A sentence, not a list of things to study. Same shape as What's covered on the
              plate card, and for the same reason: a guest reads this once, to know roughly what
              would be welcome, and it should take one line of reading and no decisions. It was
              tiles with a note under each, which turned four ideas into most of a screen and made
              a wish list look like a set of instructions. A link keeps its word underlined; the
              rest is plain text. */}
          {/* The label on its own line, the ideas under it in reading type.
          
              First go ran them together in one uppercase hand-font line, copied from the plate
              card's "What's covered". That works there because it is a footnote about other
              people's dishes. Here the list is what the block is for, and shrinking it to a
              footnote lost it: "SOME IDEAS A BALANCE BIKE, BOOKS, DUPLO AND A SWIMMING TOWEL"
              reads as one long shout, not as a list of four things. */}
          <div className="label sky small-label">{copy.sections.wishlist}</div>
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
        </>
      )}

      {hasGroup && (
        <>
          <div className="rule" />
          {/* The host's words win outright. Nothing is appended to them, ever. That rule had to
              be written into good-to-know.ts after the group gift started adding its own sentence
              onto the end of whatever a host had typed, and an invite came out saying the same
              thing twice in two voices. Empty, the app's sentence fills the silence: a group gift
              that is running and never mentioned is worse than a default line. */}
          <p className="para">
            {said || (group ? copy.gift.blockWhat(group) : copy.gift.blockNoWhat)}
          </p>
          <p className="small">{copy.gift.blockHow}</p>
        </>
      )}

      {/* Only in the editor, and it says which of the two states this is: off and therefore
          invisible to guests, or on and waiting for words. */}
      {editing && <div className="small">{off ? copy.host.giftsOff : copy.host.previewGifts}</div>}
    </div>
  );
}

// ", " between, " and " before the last. The same shape sentenceList gives, written out here
// because the labels can carry links and a joined string cannot.
function joiner(i: number, n: number): string {
  if (i >= n - 1) return "";
  return i === n - 2 ? " and " : ", ";
}
