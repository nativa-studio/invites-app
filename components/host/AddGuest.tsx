"use client";
import { useActionState, useEffect, useRef } from "react";
import { copy } from "@/lib/copy";
import { addGuest, type AddGuestState } from "@/app/app/events/[id]/actions";

export function AddGuest({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState<AddGuestState, FormData>(addGuest, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.added) form.current?.reset(); }, [state]);
  return (
    <form ref={form} action={formAction} className="card">
      <h2 className="h2">{copy.host.addGuest}</h2>
      <input type="hidden" name="event_id" value={eventId} />
      <div className="field"><label htmlFor="g-name">{copy.host.name}</label><input id="g-name" name="name" type="text" required autoComplete="off" /></div>
      <div className="field"><label htmlFor="g-contact">{copy.host.contactName}</label><input id="g-contact" name="contact_name" type="text" autoComplete="off" /></div>
      <div className="field"><label htmlFor="g-phone">{copy.host.phone}</label><input id="g-phone" name="phone" type="tel" inputMode="tel" placeholder="04xx xxx xxx" /></div>
      {state.error && <p className="notice" role="alert">{state.error}</p>}
      {state.added && <p className="muted" aria-live="polite">Added {state.added}.</p>}
      <div className="actions"><button className="btn primary" type="submit" disabled={pending}>{copy.host.add}</button></div>
    </form>
  );
}
