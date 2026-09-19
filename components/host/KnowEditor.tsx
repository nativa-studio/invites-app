"use client";
import { useTransition } from "react";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { NOTE_NAMES, orderedKinds, type NoteKind } from "@/lib/good-to-know";
import { setKnowOrder } from "@/app/app/events/[id]/actions";
import { Choice, Field, Switch } from "@/components/host/fields";
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
const GIFTS: [string, string][] = [["none", "No gifts please"], ["optional", "Gifts optional"], ["books", "Books only"], ["wishlist", "Wish list link"]];
const PHOTOS: [string, string][] = [["none", "Say nothing"], ["kids_off_social", "Please keep photos of the kids off social media"], ["ask", "Please ask before posting anyone's photos"], ["share", "Share away"]];

export const KNOW_FIELDS = [
  "what_to_bring", "serve_text", "plate_enabled", "plate_host_note",
  "gift_stance", "gift_note", "photo_sharing", "good_to_know",
] as const;

export function KnowEditor({ e }: { e: EventRow }) {
  const [pending, start] = useTransition();
  const kinds = orderedKinds(e.know_order);

  // Each control keeps a real label. An empty one next to a row heading would leave the input with
  // no accessible name at all, and the heading is a span, which a screen reader does not tie to
  // anything. The row's name is the first control's label, so it is said once and said properly.
  function fieldsFor(k: NoteKind) {
    switch (k) {
      case "bring":
        return <Field id="what_to_bring" label={NOTE_NAMES.bring} value={e.what_to_bring} hint='e.g. "Swimmers, a towel and a hat"' />;
      case "serve":
        return <Field id="serve_text" label={NOTE_NAMES.serve} value={e.serve_text} hint='e.g. "Afternoon tea, and cake at 4ish"' />;
      case "plate":
        return (
          <>
            <Switch id="plate_enabled" label={NOTE_NAMES.plate} value={e.plate_enabled} />
            <Field id="plate_host_note" label="Bring a plate wording" value={e.plate_host_note} hint="Only appears when the switch above is on." />
          </>
        );
      case "gifts":
        return (
          <>
            <Choice id="gift_stance" label={NOTE_NAMES.gifts} value={e.gift_stance} options={GIFTS} />
            <Field id="gift_note" label="Gift note (optional)" value={e.gift_note} />
          </>
        );
      case "photos":
        return <Choice id="photo_sharing" label={NOTE_NAMES.photos} value={e.photo_sharing} options={PHOTOS} />;
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
