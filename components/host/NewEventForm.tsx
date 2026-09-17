"use client";
import { useActionState, useState } from "react";
import { createEvent, type NewEventState } from "@/app/app/events/new/actions";
import { EVENT_TYPES } from "@/lib/event-types";

export function NewEventForm() {
  const [state, action, pending] = useActionState<NewEventState, FormData>(createEvent, {});
  const [type, setType] = useState("kids_party");
  const chosen = EVENT_TYPES.find((t) => t.id === type);

  return (
    <form action={action} style={{ display: "grid", gap: 20 }}>
      <section className="card">
        <h2 className="h2">What kind of event</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {EVENT_TYPES.map((t) => (
            <label key={t.id} className="guest" style={{ cursor: "pointer", borderColor: type === t.id ? "var(--terracotta)" : undefined, borderWidth: type === t.id ? 2.5 : 1.5 }}>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="radio" name="type" value={t.id} checked={type === t.id} onChange={() => setType(t.id)} style={{ width: 20, height: 20 }} />
                <span className="name">{t.label}</span>
              </span>
              <span className="trail">{t.blurb}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="h2">The basics</h2>
        <div className="field">
          <label htmlFor="e-title">Title</label>
          <input id="e-title" name="title" type="text" required autoComplete="off" placeholder={chosen?.id === "kids_party" ? "Gabriel is turning 4" : "Sunday lunch at ours"} />
          <span className="muted" style={{ fontSize: 13 }}>For a birthday, &quot;Name is turning N&quot; puts the age on the stamp.</span>
        </div>
        <div className="field">
          <label htmlFor="e-host">From</label>
          <input id="e-host" name="host_line" type="text" autoComplete="off" placeholder="With love from Gabriel's mum and dad" />
        </div>
        <div className="field">
          <label htmlFor="e-intro">A line or two</label>
          <textarea id="e-intro" name="intro" rows={3} placeholder="A pool party! Come for a swim, a light spread and cake." />
        </div>
        <div className="counts">
          <div className="field"><label htmlFor="e-date">Date</label><input id="e-date" name="date" type="date" /></div>
          <div className="field"><label htmlFor="e-start">Start</label><input id="e-start" name="start_time" type="time" /></div>
          <div className="field"><label htmlFor="e-end">End (optional)</label><input id="e-end" name="end_time" type="time" /></div>
        </div>
        <div className="field"><label htmlFor="e-venue">Where</label><input id="e-venue" name="venue" type="text" placeholder="Our place" autoComplete="off" /></div>
        <div className="field"><label htmlFor="e-address">Address</label><input id="e-address" name="address" type="text" autoComplete="off" /></div>
      </section>

      {state.error && <p className="notice" role="alert">{state.error}</p>}
      <div className="actions"><button className="btn primary" type="submit" disabled={pending}>{pending ? "Making it" : "Make the invite"}</button></div>
    </form>
  );
}
