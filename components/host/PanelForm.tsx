"use client";
import { useActionState } from "react";
import { saveEvent, type SaveState } from "@/app/app/events/[id]/settings/actions";
import { copy } from "@/lib/copy";

// One panel of the event, and its Save.
//
// `fields` is the list of columns this panel is allowed to write. It travels with the form and
// the action honours it, so a panel can never save empty over a field that lives on another
// header. Forget to list a field and it simply will not save, which is the safe way round.
export function PanelForm({
  eventId, fields, children, label = "Save",
}: { eventId: string; fields: readonly string[]; children: React.ReactNode; label?: string }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEvent, {});
  return (
    <form action={action} className="panel">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="_fields" value={fields.join(",")} />
      {children}
      {state.error && <p className="notice" role="alert">{state.error}</p>}
      {state.saved && (
        <p className="notice" role="status" aria-live="polite">
          <b>{copy.host.savedTitle}</b> {state.note ?? copy.host.savedBody}
        </p>
      )}
      <div className="save-bar">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving" : label}</button>
      </div>
    </form>
  );
}
