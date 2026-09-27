"use client";
import { useActionState, useState } from "react";
import { createEvent, type NewEventState } from "@/app/app/events/new/actions";
import { copy } from "@/lib/copy";
import { EVENT_TYPES, defaultsFor } from "@/lib/event-types";
import { samplePartyTitle } from "@/lib/sample-event";
import { DesignGallery } from "./DesignGallery";

const STEPS = ["What kind of event", "Pick a look", "The details"] as const;

// Three questions, one screen each, in the order a host thinks in: what this is, what it should
// look like, then the words. Splitting them is the point. One long form asks everything at once
// and looks like work; a step asks one thing and looks like a decision.
//
// Nothing is saved until the last step, so the type and the look ride along as hidden inputs.
//
// The look step shows the same gallery the Design tab does, tiles and sheet and all, drawn on a
// stand in party rather than on the host's own: there is no event yet, and there is no id to point
// a preview at. See lib/sample-event.ts. It drew four little diagrams of each layout's shape
// before, which showed that the designs differ and not how, so a host picked their look off a name
// and then picked it again properly on the Design tab once the invite existed.
export function NewEventForm() {
  const [state, action, pending] = useActionState<NewEventState, FormData>(createEvent, {});
  const [step, setStep] = useState(0);
  const [type, setType] = useState("kids_party");
  const [layout, setLayout] = useState("suite");
  const [title, setTitle] = useState("");
  const last = step === STEPS.length - 1;

  // What the tiles are drawn on. The type's own defaults for the two colour settings, so the
  // invite in the tile is the one this kind of party would actually get, and the sample's title
  // until the host types their own.
  //
  // Their own, the moment there is one. The title box is on the next step, so the first time
  // through this is the stand in party's, and coming back from step three it is theirs.
  const defaults = defaultsFor(type);
  const thumb = {
    title: title.trim() || samplePartyTitle(type),
    intro: null,
    palette: null,
    themeId: (defaults.theme_id as string | undefined) ?? null,
    ink: (defaults.ink as string | undefined) ?? null,
    set: null,
  };
  // The sheet's frame, on the route that builds its row instead of reading one. No Open full size
  // here: a new tab has no party to come back to, and it would lose the step they are on.
  const previewSrc = (id: string) =>
    `/app/preview/sample?layout=${id}&type=${type}&title=${encodeURIComponent(title.trim())}`;

  return (
    <form action={action} className="steps">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="layout_id" value={layout} />

      <p className="step-count">Step {step + 1} of {STEPS.length}</p>
      <h2 className="h1 step-heading">{STEPS[step]}</h2>

      {/* Every step stays mounted and hidden, so going back does not empty the boxes.

          No placeholder text in any of the boxes below. They were somebody else's words, Gabriel's
          party and its pool and its cake, sitting greyed out in a stranger's form: a host filling
          this in for a different child reads them as something already written down about their
          own event. A hint under a box says the same thing without pretending to be an answer. */}
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
        <DesignGallery
          type={type}
          layout={layout}
          onPick={(id) => { setLayout(id); setStep(2); }}
          thumb={thumb}
          previewSrc={previewSrc}
        />
        <p className="hint">{copy.sample.note}</p>
      </div>

      <div hidden={step !== 2}>
        <div className="field">
          <label htmlFor="e-title">Title</label>
          <input id="e-title" name="title" type="text" required autoComplete="off" value={title} onChange={(ev) => setTitle(ev.target.value)} />
          <span className="hint">For a birthday, &quot;Name is turning N&quot; puts the age on the stamp.</span>
        </div>
        <div className="field">
          <label htmlFor="e-host">From</label>
          <input id="e-host" name="host_line" type="text" autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="e-intro">A line or two</label>
          <textarea id="e-intro" name="intro" rows={3} />
        </div>
        <div className="counts">
          <div className="field"><label htmlFor="e-date">Date</label><input id="e-date" name="date" type="date" /></div>
          <div className="field"><label htmlFor="e-start">Start</label><input id="e-start" name="start_time" type="time" /></div>
          <div className="field"><label htmlFor="e-end">End (optional)</label><input id="e-end" name="end_time" type="time" /></div>
        </div>
        <div className="field"><label htmlFor="e-venue">Where</label><input id="e-venue" name="venue" type="text" autoComplete="off" /></div>
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
