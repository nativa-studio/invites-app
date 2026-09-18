"use client";
import { useActionState, useState } from "react";
import { copy } from "@/lib/copy";
import { deleteEvent, type DeleteState } from "@/app/app/events/[id]/actions";

// Deleting the event. Shut by default, because nobody arrives on this screen meaning to do it,
// and it asks for the event's name rather than a yes, so it cannot be done by a stray tap.
export function DeleteEvent({ id, title, counts }: { id: string; title: string; counts: { guests: number; replies: number } }) {
  const [state, action, pending] = useActionState<DeleteState, FormData>(deleteEvent, {});
  const [open, setOpen] = useState(false);

  return (
    <section className="card danger">
      <h2 className="h2">{copy.host.deleteHeading}</h2>
      <p className="hint">{copy.host.deleteBlurb(counts.guests, counts.replies)}</p>
      {!open ? (
        <div className="actions">
          <button type="button" className="btn small" onClick={() => setOpen(true)}>{copy.host.deleteStart}</button>
        </div>
      ) : (
        <form action={action}>
          <input type="hidden" name="event_id" value={id} />
          <input type="hidden" name="title" value={title} />
          <div className="field">
            <label htmlFor="confirm">{copy.host.deleteConfirmLabel(title)}</label>
            <input id="confirm" name="confirm" type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} />
          </div>
          {state.error && <p className="notice" role="alert">{state.error}</p>}
          <div className="actions">
            <button className="btn danger" type="submit" disabled={pending}>{pending ? copy.host.deleting : copy.host.deleteConfirm}</button>
            <button type="button" className="btn small" onClick={() => setOpen(false)}>{copy.host.deleteCancel}</button>
          </div>
        </form>
      )}
    </section>
  );
}
