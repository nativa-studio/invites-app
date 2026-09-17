"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { addGuest, addGuests, type AddGuestState, type AddManyState } from "@/app/app/events/[id]/actions";

import { contactPicker, useHasContactPicker } from "./capabilities";

export function AddGuest({ eventId }: { eventId: string }) {
  const [mode, setMode] = useState<"one" | "many">("one");
  const hasPicker = useHasContactPicker();
  return (
    <section className="card">
      <h2 className="h2">{copy.host.addGuest}</h2>
      <div className="actions" role="tablist" aria-label="How to add guests">
        <button type="button" className="btn small" aria-pressed={mode === "one"} style={mode === "one" ? { background: "var(--ink)", color: "#fff" } : undefined} onClick={() => setMode("one")}>{copy.host.addOne}</button>
        <button type="button" className="btn small" aria-pressed={mode === "many"} style={mode === "many" ? { background: "var(--ink)", color: "#fff" } : undefined} onClick={() => setMode("many")}>{copy.host.addMany}</button>
      </div>
      {mode === "one" ? <OneForm eventId={eventId} /> : <ManyForm eventId={eventId} hasPicker={hasPicker} />}
    </section>
  );
}

function OneForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState<AddGuestState, FormData>(addGuest, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.added) form.current?.reset(); }, [state]);
  return (
    <form ref={form} action={formAction} style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="event_id" value={eventId} />
      <div className="field"><label htmlFor="g-name">{copy.host.name}</label><input id="g-name" name="name" type="text" required autoComplete="off" /></div>
      <div className="field"><label htmlFor="g-contact">{copy.host.contactName}</label><input id="g-contact" name="contact_name" type="text" autoComplete="off" /></div>
      <div className="field"><label htmlFor="g-phone">{copy.host.phone}</label><input id="g-phone" name="phone" type="tel" inputMode="tel" placeholder="04xx xxx xxx" /></div>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 6 }}>
        <legend className="field" style={{ padding: 0 }}><span style={{ fontFamily: "var(--font-hand)", fontSize: 19 }}>{copy.host.expected}</span></legend>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="field" style={{ flex: 1 }}><label htmlFor="g-kids">{copy.host.expectedChildren}</label><input id="g-kids" name="expected_children" type="number" inputMode="numeric" min={0} max={50} placeholder="0" /></div>
          <div className="field" style={{ flex: 1 }}><label htmlFor="g-adults">{copy.host.expectedAdults}</label><input id="g-adults" name="expected_adults" type="number" inputMode="numeric" min={0} max={50} placeholder="0" /></div>
        </div>
        <span className="muted" style={{ fontSize: 13 }}>{copy.host.expectedHint}</span>
      </fieldset>
      {state.error && <p className="notice" role="alert">{state.error}</p>}
      {state.added && <p className="muted" aria-live="polite">Added {state.added}.</p>}
      <div className="actions"><button className="btn primary" type="submit" disabled={pending}>{copy.host.add}</button></div>
    </form>
  );
}

function ManyForm({ eventId, hasPicker }: { eventId: string; hasPicker: boolean }) {
  const [state, formAction, pending] = useActionState<AddManyState, FormData>(addGuests, {});
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (state.added && box.current) box.current.value = ""; }, [state]);

  async function pick() {
    const picker = contactPicker();
    if (!picker || !box.current) return;
    try {
      const chosen = await picker.select(["name", "tel"], { multiple: true });
      const lines = chosen.map((c) => [c.name?.[0] ?? "", c.tel?.[0] ?? ""].filter(Boolean).join(" ")).filter(Boolean);
      box.current.value = [box.current.value.trim(), ...lines].filter(Boolean).join("\n");
    } catch {
      // The person closed the picker. Nothing to do.
    }
  }

  return (
    <form action={formAction} style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="event_id" value={eventId} />
      <div className="field">
        <label htmlFor="g-list">{copy.host.pasteLabel}</label>
        <textarea id="g-list" name="list" ref={box} rows={6} placeholder={copy.host.pasteExample} style={{ minHeight: 140 }} />
        <span className="muted" style={{ fontSize: 13 }}>{copy.host.pasteHint}</span>
      </div>
      {state.error && <p className="notice" role="alert">{state.error}</p>}
      {state.added ? <p className="muted" aria-live="polite">Added {state.added} {state.added === 1 ? "guest" : "guests"}.</p> : null}
      <div className="actions">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "Adding" : copy.host.addAll}</button>
        {hasPicker && <button type="button" className="btn small" onClick={() => void pick()}>{copy.host.pickContacts}</button>}
      </div>
    </form>
  );
}
