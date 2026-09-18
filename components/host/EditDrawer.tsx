"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveEvent, type SaveState } from "@/app/app/events/[id]/settings/actions";
import type { EventRow } from "@/lib/db/types";
import { ShowSwitch, type Section } from "./sections";

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
  const sheet = useRef<HTMLDivElement>(null);
  // Typing in here and then tapping what is behind used to close the drawer and throw the change
  // away without a word, which looks exactly like a save that did not work. Once there is
  // something to lose, only the button marked Discard can lose it.
  const [dirty, setDirty] = useState(false);
  const leave = () => { if (!dirty) onClose(); };

  useEffect(() => { if (state.saved) onSaved(); }, [state.saved, onSaved]);

  // The tap that opened this may have come from inside a frame, so that is where the keyboard
  // still is. Moving focus into the sheet is what makes Escape work at all, and it is also where
  // a screen reader should land: the thing that just appeared.
  useEffect(() => { sheet.current?.focus(); }, []);

  const fields = section.show ? [...section.fields, section.show.column] : section.fields;
  const nothingToEdit = section.render(e) === null;

  return (
    <div className="sheet-back" onClick={leave} role="presentation">
      <div
        className="sheet"
        ref={sheet}
        tabIndex={-1}
        onClick={(ev) => ev.stopPropagation()}
        onKeyDown={(ev) => { if (ev.key === "Escape") leave(); }}
        role="dialog"
        aria-modal="true"
        aria-label={section.title}
      >
        <div className="sheet-head">
          <h2 className="h2">{section.title}</h2>
          <button type="button" className="btn small" onClick={onClose}>{dirty ? "Discard" : "Close"}</button>
        </div>
        {section.blurb && <p className="hint">{section.blurb}</p>}
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
      </div>
    </div>
  );
}
