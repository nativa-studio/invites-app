"use client";
import { useTransition } from "react";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { GIFT_OPTIONS, NOTE_NAMES, PHOTO_OPTIONS, orderedKinds, type NoteKind } from "@/lib/good-to-know";
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


export const KNOW_FIELDS = [
  "siblings_welcome", "what_to_bring", "serve_text",
  "gift_stance", "gift_note", "group_gift_enabled", "photo_sharing", "good_to_know",
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
      case "plate":
        // Settings live on the Potluck tab, with the board they belong to. This row is here so
        // the line can be moved up and down the invite with the others, and so a host looking
        // for it is told where it went rather than finding a second copy of it.
        return <p className="hint">{copy.host.plateElsewhere}</p>;
      case "gifts":
        // Two settings, not one choice, because they are two different questions and a host
        // wants both answers: gifts are optional AND there is a group gift. The stance is what
        // to do about bringing a present, the switch is whether everyone is going in on one, and
        // the invite joins whichever are on into a single sentence rather than two that read
        // like the invite arguing with itself.
        //
        // The switch is also on the Gift tab, where the rest of running a gift lives. It is here
        // as well because this is where the wording is, and a host picking "gifts are optional"
        // is standing exactly where the question "should I also mention the group gift" occurs
        // to them. Both write the same column, so there is no second copy to drift.
        return (
          <>
            <Choice id="gift_stance" label={NOTE_NAMES.gifts} value={e.gift_stance} options={GIFT_OPTIONS} hint="Say nothing leaves gifts off the invite altogether." />
            <Field id="gift_note" label="Gift note (optional)" value={e.gift_note} hint="Added to the end of the line above. Wish list needs it, and prints nothing without it: put the link here." />
            <Switch id="group_gift_enabled" label={copy.host.giftSwitch} value={e.group_gift_enabled} hint={copy.host.giftAlongside} />
          </>
        );
      case "photos":
        return <Choice id="photo_sharing" label={NOTE_NAMES.photos} value={e.photo_sharing} options={PHOTO_OPTIONS} />;
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
