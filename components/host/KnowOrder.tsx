"use client";
import { useTransition } from "react";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { NOTE_NAMES, orderedNotes, type NoteKind } from "@/lib/good-to-know";
import { setKnowOrder } from "@/app/app/events/[id]/actions";
import { Reorder } from "./Reorder";

// The order of the good to know lines, dragged.
//
// Only the lines this event actually has are listed. A host reorders what is on their invite, not
// a menu of everything an invite could say, and a row for something they have not written would
// be a row that does nothing.
export function KnowOrder({ e }: { e: EventRow }) {
  const [pending, start] = useTransition();
  const kinds = orderedNotes(e).map((n) => n.kind);
  if (kinds.length < 2) return null;
  return (
    <div className="field">
      <span className="label-ish">{copy.host.knowOrderHeading}</span>
      <Reorder<NoteKind>
        items={kinds}
        label={(k) => NOTE_NAMES[k]}
        disabled={pending}
        onReorder={(next) => start(() => { void setKnowOrder(e.id, next); })}
      >
        {(k) => <span className="n">{NOTE_NAMES[k]}</span>}
      </Reorder>
      <span className="hint">{copy.host.knowOrderHint}</span>
    </div>
  );
}
