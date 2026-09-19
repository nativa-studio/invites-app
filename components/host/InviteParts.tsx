"use client";
import { useTransition } from "react";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { INVITE_PARTS, orderedParts, PART_NAMES, PART_SWITCH, type InvitePart } from "@/lib/invite-parts";
import { setSectionOrder, setSectionShown } from "@/app/app/events/[id]/actions";
import { Reorder } from "./Reorder";

// What the invite is made of, in the order it comes in.
//
// This is the other half of editing by pointing. Tapping the invite changes what a part says;
// this changes whether it is there at all and where it sits, which are the two things you cannot
// do by tapping a part that is switched off or by tapping the gap it should move into.
//
// Dragged, by the same handle the good to know lines use. This was a pair of little arrows per
// row, which is a fine fallback and a poor first choice: arrows make you tap once per position,
// and with seven parts moving the last one to the top is six taps. The arrow keys still do exactly
// that for anyone on a keyboard, from the handle itself.
//
// On or off is a switch, green or red. It was a button reading "Take off" or "Put back", which
// named the state the tap would produce rather than the state the part is in, so reading down
// seven rows meant inverting every one of them. A switch is the state, and its side says so as
// well as its colour.
export function InviteParts({ e, onEdit }: { e: EventRow; onEdit: (part: InvitePart) => void }) {
  const [pending, start] = useTransition();
  const order = orderedParts(e.section_order);

  const shown = (p: InvitePart) => {
    const col = PART_SWITCH[p];
    if (!col) return true;
    return (e as unknown as Record<string, unknown>)[col] !== false;
  };

  return (
    <section className="card">
      <h2 className="h2">{copy.host.partsHeading}</h2>
      <p className="hint">{copy.host.partsBlurb}</p>
      <Reorder<InvitePart>
        items={order}
        label={(p) => PART_NAMES[p]}
        disabled={pending}
        onReorder={(next) => start(() => { void setSectionOrder(e.id, next); })}
      >
        {(p) => {
          const col = PART_SWITCH[p];
          const on = shown(p);
          return (
            <>
              <button type="button" className={`n as-link${on ? "" : " off"}`} onClick={() => onEdit(p)}>
                {PART_NAMES[p]}
              </button>
              {col && (
                <button
                  type="button"
                  className="sw"
                  role="switch"
                  aria-checked={on}
                  aria-label={copy.host.partSwitch(PART_NAMES[p])}
                  disabled={pending}
                  onClick={() => start(() => { void setSectionShown(e.id, col, !on); })}
                >
                  <span className="track"><span className="knob" /></span>
                </button>
              )}
            </>
          );
        }}
      </Reorder>
      {order.length !== INVITE_PARTS.length && <p className="hint">{copy.host.partsRepaired}</p>}
    </section>
  );
}
