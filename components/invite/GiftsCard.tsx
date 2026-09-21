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
//   2. The wish list, as tiles two to a row, the same shape the plate board uses. Marcia asked
//      for rows rather than a long list for the same reason the dishes are tiles: eight things in
//      a column is most of a phone screen, and eight things two-up is a third of one.
//   3. The group gift, named. Only what it is and that it is happening. Where to send money and
//      who has already chipped in live on the card after the reply, which takes a token and
//      answers only for somebody who has said yes: a stranger opening a forwarded link should not
//      be reading somebody's bank details.
//
// Nothing here is a button. The whole block is for reading, which is why it can sit on the invite
// before anybody has answered without asking anything of them.
export function GiftsCard({ e }: { e: PublicEvent }) {
  const note = e.gift_note?.trim();
  const list = e.wishlist ?? [];
  const group = e.group_gift_enabled ? (e.group_gift_what?.trim() || null) : undefined;
  // undefined means no group gift at all; null means one is running with nothing typed about it
  // yet, which is still worth saying.
  const hasGroup = group !== undefined;
  if (!note && list.length === 0 && !hasGroup) return null;

  return (
    <div className="pcard cream tilt-l gifts" data-section="gifts">
      <div className="tape cross" />
      <div className="tape over sky" />
      <div className="label red">{copy.sections.gifts}</div>
      <GiftIcon size={36} />

      {note && <p className="para">{note}</p>}

      {list.length > 0 && (
        <>
          {/* A heading only when there is something else above it to tell it apart from. On its
              own under the card's own label it would be the same word twice. */}
          {note && <div className="label sky small-label">{copy.sections.wishlist}</div>}
          <ul className="wishtiles">
            {list.map((w, i) => (
              <li key={`${w.label}-${i}`}>
                {/* A link only where the host gave one. The rest are things to read, and a tile
                    that looks pressable and is not is worse than a plain one. */}
                {w.url
                  ? <a className="wishtile" href={w.url} target="_blank" rel="noreferrer">{face(w)}</a>
                  : <span className="wishtile">{face(w)}</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      {hasGroup && (
        <>
          <div className="rule" />
          <p className="para">{group ? copy.gift.blockWhat(group) : copy.gift.blockNoWhat}</p>
          <p className="small">{copy.gift.blockHow}</p>
        </>
      )}
    </div>
  );
}

function face(w: { label: string; note?: string | null; url?: string | null }) {
  return (
    <>
      <span className="n">{w.label}</span>
      {w.note && <span className="b">{w.note}</span>}
      {w.url && <span className="go">{copy.sections.wishlistLink}</span>}
    </>
  );
}
