"use client";
import { useActionState, useState } from "react";
import { createEvent, type NewEventState } from "@/app/app/events/new/actions";
import { EVENT_TYPES } from "@/lib/event-types";
import { LAYOUTS } from "@/lib/layouts";
import { LayoutThumb } from "./LayoutThumb";

const STEPS = ["What kind of event", "Pick a look", "The details"] as const;

// Three questions, one screen each, in the order a host thinks in: what this is, what it should
// look like, then the words. Splitting them is the point. One long form asks everything at once
// and looks like work; a step asks one thing and looks like a decision.
//
// Nothing is saved until the last step, so the type and the look ride along as hidden inputs.
// There is no event to preview yet either, which is why the look step shows the drawings rather
// than the live preview the Layout tab has.
export function NewEventForm() {
  const [state, action, pending] = useActionState<NewEventState, FormData>(createEvent, {});
  const [step, setStep] = useState(0);
  const [type, setType] = useState("kids_party");
  const [layout, setLayout] = useState("suite");
  const [title, setTitle] = useState("");
  const chosen = EVENT_TYPES.find((t) => t.id === type);
  const last = step === STEPS.length - 1;

  return (
    <form action={action} className="steps">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="layout_id" value={layout} />

      <p className="step-count">Step {step + 1} of {STEPS.length}</p>
      <h2 className="h1 step-heading">{STEPS[step]}</h2>

      {/* Every step stays mounted and hidden, so going back does not empty the boxes. */}
      <div hidden={step !== 0}>
        <div className="tiles">
          {EVENT_TYPES.map((t) => (
            <button key={t.id} type="button" className={`tile ${type === t.id ? "on" : ""}`} aria-pressed={type === t.id} onClick={() => { setType(t.id); setStep(1); }}>
              <span className="tile-name">{t.label}</span>
              <span className="tile-line">{t.blurb}</span>
            </button>
          ))}
        </div>
        <p className="hint">This sets the questions your guests get asked. You can change any of it later.</p>
      </div>

      <div hidden={step !== 1}>
        <div className="tiles art">
          {LAYOUTS.map((l) => (
            <button key={l.id} type="button" className={`tile ${layout === l.id ? "on" : ""}`} aria-pressed={layout === l.id} onClick={() => { setLayout(l.id); setStep(2); }}>
              <LayoutThumb id={l.id} />
              <span className="tile-name">{l.name}</span>
              <span className="tile-line">{l.line}</span>
            </button>
          ))}
        </div>
        <p className="hint">You will see it properly on the Layout tab once the invite exists, and you can swap look at any time.</p>
      </div>

      <div hidden={step !== 2}>
        <div className="field">
          <label htmlFor="e-title">Title</label>
          <input id="e-title" name="title" type="text" required autoComplete="off" value={title} onChange={(ev) => setTitle(ev.target.value)} placeholder={chosen?.id === "kids_party" ? "Gabriel is turning 4" : "Sunday lunch at ours"} />
          <span className="hint">For a birthday, &quot;Name is turning N&quot; puts the age on the stamp.</span>
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
        <p className="hint">Only the title is needed now. Everything else can wait, and none of it is final.</p>
      </div>

      {state.error && <p className="notice" role="alert">{state.error}</p>}

      <div className="step-bar">
        <button type="button" className="btn" onClick={() => setStep(step - 1)} disabled={step === 0}>Back</button>
        {last ? (
          <button className="btn primary" type="submit" disabled={pending || !title.trim()}>{pending ? "Making it" : "Make the invite"}</button>
        ) : (
          <button type="button" className="btn primary" onClick={() => setStep(step + 1)}>Next</button>
        )}
      </div>
    </form>
  );
}
