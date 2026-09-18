"use client";
import { useTransition } from "react";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { INVITE_PARTS, orderedParts, PART_NAMES, PART_SWITCH, type InvitePart } from "@/lib/invite-parts";
import { setSectionOrder, setSectionShown } from "@/app/app/events/[id]/actions";

// What the invite is made of, in the order it comes in.
//
// This is the other half of editing by pointing. Tapping the invite changes what a part says;
// this changes whether it is there at all and where it sits, which are the two things you cannot
// do by tapping a part that is switched off or by tapping the gap it should move into.
//
// Up and down rather than dragging: a drag inside a phone that is already scrolling is a fight,
// and there are six parts at most.
export function InviteParts({ e, onEdit }: { e: EventRow; onEdit: (part: InvitePart) => void }) {
  const [pending, start] = useTransition();
  const order = orderedParts(e.section_order);

  const shown = (p: InvitePart) => {
    const col = PART_SWITCH[p];
    if (!col) return true;
    return (e as unknown as Record<string, unknown>)[col] !== false;
  };

  function move(from: number, by: number) {
    const to = from + by;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    start(() => { void setSectionOrder(e.id, next); });
  }

  return (
    <section className="card">
      <h2 className="h2">{copy.host.partsHeading}</h2>
      <p className="hint">{copy.host.partsBlurb}</p>
      <ol className="parts">
        {order.map((p, i) => {
          const col = PART_SWITCH[p];
          const on = shown(p);
          return (
            <li className={`part ${on ? "" : "off"}`} key={p}>
              <button type="button" className="n" onClick={() => onEdit(p)}>
                {PART_NAMES[p]}
                {!on && <span className="tag-off">{copy.host.partOff}</span>}
              </button>
              <div className="moves">
                <button type="button" className="btn small" disabled={pending || i === 0} aria-label={`Move ${PART_NAMES[p]} up`} onClick={() => move(i, -1)}>&uarr;</button>
                <button type="button" className="btn small" disabled={pending || i === order.length - 1} aria-label={`Move ${PART_NAMES[p]} down`} onClick={() => move(i, 1)}>&darr;</button>
                {col && (
                  <button
                    type="button"
                    className="btn small"
                    disabled={pending}
                    aria-pressed={on}
                    onClick={() => start(() => { void setSectionShown(e.id, col, !on); })}
                  >
                    {on ? copy.host.partHide : copy.host.partShow}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {order.length !== INVITE_PARTS.length && <p className="hint">{copy.host.partsRepaired}</p>}
    </section>
  );
}
