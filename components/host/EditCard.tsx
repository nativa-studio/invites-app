"use client";
import { useActionState, useEffect, useState } from "react";
import { saveEvent, type SaveState } from "@/app/app/events/[id]/settings/actions";
import { copy } from "@/lib/copy";
import { Sheet } from "./Sheet";

// One setting, shown as what it currently says, changed in a sheet.
//
// The panels used to be long forms with a Save at the bottom: forty fields on a phone, most of
// them not the one you came for, and a Save you had to scroll to and could not see from the field
// you had just typed in. The card version answers the question a host actually arrives with,
// which is "what does it say now", and opening the sheet is the only way to change anything.
//
// `fields` is the manifest this card owns. It travels with the form and the action honours it, so
// a card can never write over a field it does not show. Leave a field off the list and it does
// not save, which is the safe way round.
export function EditCard({
  eventId, title, blurb, fields, summary, extra, children,
}: {
  eventId: string;
  title: string;
  blurb?: string;
  fields: readonly string[];
  summary: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2 className="h2">{title}</h2>
          <button type="button" className="btn small" onClick={() => setOpen(true)}>
            {copy.host.change}
          </button>
        </div>
        <dl className="sum">{summary}</dl>
        {/* Anything the card does as well as say what it is set to, like the link itself and the
            button that copies it. Outside the list, because a dl holds only dt and dd. */}
        {extra}
      </section>
      {/* Keyed by open, so a sheet dismissed with typing in it does not come back still holding it. */}
      {open && (
        <EditSheet key={String(open)} eventId={eventId} title={title} blurb={blurb} fields={fields} onClose={() => setOpen(false)}>
          {children}
        </EditSheet>
      )}
    </>
  );
}

function EditSheet({
  eventId, title, blurb, fields, onClose, children,
}: {
  eventId: string;
  title: string;
  blurb?: string;
  fields: readonly string[];
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEvent, {});
  const [dirty, setDirty] = useState(false);

  // The action revalidates, so the card behind is already showing the new words by the time this
  // closes. Nothing to refresh by hand.
  useEffect(() => { if (state.saved) onClose(); }, [state.saved, onClose]);

  return (
    <Sheet title={title} blurb={blurb} dirty={dirty} onClose={onClose}>
      <form action={action} className="sheet-body" onInput={() => setDirty(true)} onChange={() => setDirty(true)}>
        <input type="hidden" name="event_id" value={eventId} />
        <input type="hidden" name="_fields" value={[...new Set(fields)].join(",")} />
        {children}
        {state.error && <p className="notice" role="alert">{state.error}</p>}
        <div className="sheet-foot">
          {dirty && <span className="hint" aria-live="polite">{copy.host.notSavedYet}</span>}
          <button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving" : "Save"}</button>
        </div>
      </form>
    </Sheet>
  );
}

// One line of a card's summary: what the setting is called, and what it currently says.
//
// An empty one still draws its label, because "Parking" with nothing under it is how a host
// notices they never filled it in. A missing row is invisible.
export function Sum({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value == null || value === "" || value === false;
  return (
    <>
      <dt>{label}</dt>
      <dd className={empty ? "muted" : undefined}>{empty ? copy.host.notSet : value}</dd>
    </>
  );
}
