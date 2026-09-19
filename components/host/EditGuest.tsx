"use client";
import { useActionState, useEffect, useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import type { GuestRow } from "@/lib/db/types";
import { editGuest, newLink, removeGuest, type EditGuestState } from "@/app/app/events/[id]/actions";
import { Sheet } from "./Sheet";

// Everything about one guest, in the sheet everything else here opens.
//
// There was no way to change a guest at all once they were added, short of removing them and
// adding them again, which threw away their link and anything they had already replied.
//
// New link and Remove live in here rather than on the row. Neither is something a host does
// while working down a list: one of them is for a link that went to the wrong person, the other
// cannot be undone, and both were sitting next to the button you tap fifty times.
export function EditGuest({ eventId, guest, known, onClose }: {
  eventId: string;
  guest: GuestRow;
  known: string[];
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<EditGuestState, FormData>(editGuest, {});
  const [dirty, setDirty] = useState(false);
  const [busy, start] = useTransition();
  const [group, setGroup] = useState(guest.groups?.[0] ?? "");

  useEffect(() => { if (state.saved) onClose(); }, [state.saved, onClose]);

  return (
    <Sheet title={guest.name} blurb={copy.host.editGuestBlurb} dirty={dirty} onClose={onClose}>
      <form action={action} className="sheet-body" onInput={() => setDirty(true)} onChange={() => setDirty(true)}>
        <input type="hidden" name="event_id" value={eventId} />
        <input type="hidden" name="guest_id" value={guest.id} />

        <div className="field">
          <label htmlFor="e-name">{copy.host.name}</label>
          <input id="e-name" name="name" type="text" defaultValue={guest.name} required autoComplete="off" />
        </div>

        <div className="field">
          <label htmlFor="e-contact">{copy.host.contactName}</label>
          <input id="e-contact" name="contact_name" type="text" defaultValue={guest.contact_name ?? ""} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="e-phone">{copy.host.phone}</label>
          <input id="e-phone" name="phone" type="tel" inputMode="tel" placeholder="04xx xxx xxx" defaultValue={guest.phone ?? ""} />
        </div>

        {/* The second person to text about the same guest. A mum and a dad, so whoever answers,
            answers. Blank on most guests and costs nothing when it is. */}
        <fieldset className="stack">
          <legend className="label-ish">{copy.host.secondContact}</legend>
          <span className="hint">{copy.host.secondContactHint}</span>
          <div className="field">
            <label htmlFor="e-contact2">{copy.host.contactName}</label>
            <input id="e-contact2" name="contact_name_2" type="text" defaultValue={guest.contact_name_2 ?? ""} autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="e-phone2">{copy.host.phone}</label>
            <input id="e-phone2" name="phone_2" type="tel" inputMode="tel" placeholder="04xx xxx xxx" defaultValue={guest.phone_2 ?? ""} />
          </div>
        </fieldset>

        <fieldset className="stack">
          <legend className="label-ish">{copy.host.expected}</legend>
          <div className="counts">
            <div className="field">
              <label htmlFor="e-kids">{copy.host.expectedChildren}</label>
              <input id="e-kids" name="expected_children" type="number" inputMode="numeric" min={0} max={50} placeholder="0" defaultValue={guest.expected_children ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="e-adults">{copy.host.expectedAdults}</label>
              <input id="e-adults" name="expected_adults" type="number" inputMode="numeric" min={0} max={50} placeholder="0" defaultValue={guest.expected_adults ?? ""} />
            </div>
          </div>
          <span className="hint">{copy.host.expectedHint}</span>
        </fieldset>

        <div className="field">
          <label htmlFor="e-group">{copy.host.guestGroup}</label>
          <input id="e-group" name="group" type="text" list="known-groups" value={group} onChange={(ev) => setGroup(ev.target.value)} autoComplete="off" />
          <datalist id="known-groups">{known.map((n) => <option key={n} value={n} />)}</datalist>
          <span className="hint">{copy.host.groupHint}</span>
        </div>

        {state.error && <p className="notice" role="alert">{state.error}</p>}

        <div className="sheet-foot">
          {dirty && <span className="hint" aria-live="polite">{copy.host.notSavedYet}</span>}
          <button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving" : "Save"}</button>
        </div>

        {/* Below the Save, because neither belongs in the run of the form. */}
        <div className="guest-danger">
          <button
            type="button"
            className="btn small"
            disabled={busy}
            onClick={() => { if (confirm(copy.host.newLinkAsk)) start(() => { void newLink(eventId, guest.id); }); }}
          >
            {copy.host.newLink}
          </button>
          <span className="hint">{copy.host.newLinkWhy}</span>
          <button
            type="button"
            className="btn small danger"
            disabled={busy}
            onClick={() => { if (confirm(`Remove ${guest.name}?`)) start(() => { void removeGuest(eventId, guest.id); onClose(); }); }}
          >
            {copy.host.remove}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
