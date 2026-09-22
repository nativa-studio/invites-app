"use client";
import { useTransition } from "react";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { NOTE_NAMES, orderedKinds, type NoteKind } from "@/lib/good-to-know";
import { setKnowOrder } from "@/app/app/events/[id]/actions";
import { Field, Switch } from "@/components/host/fields";
import { Reorder } from "./Reorder";

// Good to know: the lines, and the order they come in, as one thing.
//
// These were two lists. One of text boxes to write the lines in, and underneath it a second list
// of the same lines with handles to drag. Which meant reading the name of a line in one place to
// find it in the other, and a line you had just written not appearing in the list below until you
// saved. One list: each row is the line, its words, and the handle that moves it.
//
// The fields keep their own ids, so the drawer's form and its manifest save them exactly as they
// did when they were a flat column of boxes. Only the arrangement changed.
//
// Every kind is listed, not only the ones with something in them: the invite shows the filled ones
// and this is where you fill them.


// No gift_note and no group_gift_enabled. Both are edited on the gifts block's own drawer, and a
// panel that declares a field it no longer draws saves empty over it: the fault the manifest
// exists to prevent, arrived at from the other end.
export const KNOW_FIELDS = [
  "siblings_welcome", "what_to_bring", "serve_text", "drinks_note",
  "photos_note", "good_to_know",
] as const;

export function KnowEditor({ e }: { e: EventRow }) {
  const [pending, start] = useTransition();
  const kinds = orderedKinds(e.know_order);

  // Each control keeps a real label. An empty one next to a row heading would leave the input with
  // no accessible name at all, and the heading is a span, which a screen reader does not tie to
  // anything. The row's name is the first control's label, so it is said once and said properly.
  function fieldsFor(k: NoteKind) {
    switch (k) {
      case "siblings":
        return <Switch id="siblings_welcome" label={NOTE_NAMES.siblings} value={e.siblings_welcome} hint="On, the invite says brothers and sisters are welcome. Off, it says nothing either way." />;
      case "bring":
        return <Field id="what_to_bring" label={NOTE_NAMES.bring} value={e.what_to_bring} hint='e.g. "Swimmers, a towel and a hat"' />;
      case "serve":
        return <Field id="serve_text" label={NOTE_NAMES.serve} value={e.serve_text} hint='e.g. "Afternoon tea, and cake at 4ish"' />;
      case "drinks":
        return <Field id="drinks_note" label={NOTE_NAMES.drinks} value={e.drinks_note ?? null} rows={2} hint={copy.host.drinksNoteFree} />;
      case "plate":
        // Settings live on the Potluck tab, with the board they belong to. This row is here so
        // the line can be moved up and down the invite with the others, and so a host looking
        // for it is told where it went rather than finding a second copy of it.
        return <p className="hint">{copy.host.plateElsewhere}</p>;
      case "photos":
        return <Field id="photos_note" label={NOTE_NAMES.photos} value={e.photos_note ?? null} rows={2} hint={copy.host.photosNoteFree} />;
      case "other":
        return <Field id="good_to_know" label={NOTE_NAMES.other} value={e.good_to_know} rows={2} hint="Anything the lines above do not cover." />;
    }
  }

  return (
    <div className="field">
      <span className="label-ish">{copy.host.knowOrderHeading}</span>
      <Reorder<NoteKind>
        items={kinds}
        label={(k) => NOTE_NAMES[k]}
        disabled={pending}
        onReorder={(next) => start(() => { void setKnowOrder(e.id, next); })}
      >
        {(k) => <div className="note-edit">{fieldsFor(k)}</div>}
      </Reorder>
      <span className="hint">{copy.host.knowOrderHint}</span>
    </div>
  );
}
