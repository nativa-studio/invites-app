"use client";
import { useActionState, useEffect, useState } from "react";
import { saveEvent, type SaveState } from "@/app/app/events/[id]/settings/actions";
import type { EventRow } from "@/lib/db/types";
import { ShowSwitch, type Section } from "./sections";
import { Sheet } from "./Sheet";

// The drawer that edits one part of something, wherever that something is shown.
//
// It was written for the invite, and the message preview wants exactly the same thing: tap a
// piece, get its wording and nothing else. Two copies would have drifted the first time one of
// them learned something, so there is one.
//
// Each panel declares its own fields, and only those are ever written: the manifest travels with
// the form and the action honours it, so editing one part cannot touch another.
export function EditDrawer({
  section, e, onClose, onSaved,
}: { section: Section; e: EventRow; onClose: () => void; onSaved: () => void }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEvent, {});
  // Typing in here and then tapping what is behind used to close the drawer and throw the change
  // away without a word, which looks exactly like a save that did not work. Once there is
  // something to lose, only the button marked Discard can lose it.
  const [dirty, setDirty] = useState(false);

  useEffect(() => { if (state.saved) onSaved(); }, [state.saved, onSaved]);

  const fields = section.show ? [...section.fields, section.show.column] : section.fields;
  const nothingToEdit = section.render(e) === null;

  return (
    <Sheet title={section.title} blurb={section.blurb} dirty={dirty} onClose={onClose}>
      <form action={action} className="sheet-body" onInput={() => setDirty(true)} onChange={() => setDirty(true)}>
        <input type="hidden" name="event_id" value={e.id} />
        <input type="hidden" name="_fields" value={[...new Set(fields)].join(",")} />
        {section.render(e)}
        <ShowSwitch section={section} e={e} />
        {state.error && <p className="notice" role="alert">{state.error}</p>}
        {fields.length > 0 ? (
          <div className="sheet-foot">
            {dirty && <span className="hint" aria-live="polite">Not saved yet</span>}
            <button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving" : "Save"}</button>
          </div>
          ) : (
          nothingToEdit && <p className="hint">Nothing to change here.</p>
          )}
      </form>
    </Sheet>
  );
}
