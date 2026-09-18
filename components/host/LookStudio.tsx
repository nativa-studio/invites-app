"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { LAYOUTS } from "@/lib/layouts";
import { LayoutThumb } from "./LayoutThumb";

type Sections = { details: boolean; day: boolean; know: boolean; after: boolean };

const SECTION_LABELS: [keyof Sections, string, string][] = [
  ["details", "show_details", "The details: when, where, what to wear"],
  ["day", "show_runsheet", "The order of the afternoon"],
  ["know", "show_good_to_know", "Good to know"],
  ["after", "show_after", "Questions, and how to ask them"],
];

export type LookState = { layout: string; sections: Sections };

// Everything that decides what the invite looks like, with one preview that answers for all of
// it. Previously the preview only knew about the layout, so flicking a section switch or changing
// the picture changed nothing on screen and you found out after saving. Now every control here
// feeds the same address, so what you are looking at is what you are about to save.
//
// The controls carry their own form names, so the panel's field manifest saves them as before.
export function LookStudio({ eventId, saved }: { eventId: string; saved: LookState }) {
  const [layout, setLayout] = useState(saved.layout);
  const [sections, setSections] = useState(saved.sections);

  const on = SECTION_LABELS.filter(([k]) => sections[k]).map(([k]) => k).join(",");
  const src = `/app/preview/${eventId}?layout=${layout}&show=${on}`;
  const savedName = LAYOUTS.find((l) => l.id === saved.layout)?.name ?? saved.layout;
  const changed = layout !== saved.layout || SECTION_LABELS.some(([k]) => sections[k] !== saved.sections[k]);

  return (
    <>
      <section className="card">
        <div className="look-head">
          <h2 className="h2">{copy.host.layoutHeading}</h2>
          <span className="hint">{changed ? `Guests still see ${savedName}. Save to change it.` : `Guests see ${savedName}.`}</span>
        </div>
        <div className="screen phone">
          <iframe key={src} src={src} title="Preview of the invite" loading="lazy" />
        </div>
        <div className="actions">
          <a className="btn small" href={src} target="_blank" rel="noreferrer">{copy.host.openFull}</a>
        </div>
      </section>

      <section className="card">
        <span className="label-ish">Shape</span>
        <div className="layouts">
          {LAYOUTS.map((o) => (
            <label key={o.id} className={`layout ${layout === o.id ? "on" : ""}`}>
              <input type="radio" name="layout_id" value={o.id} checked={layout === o.id} onChange={() => setLayout(o.id)} />
              <LayoutThumb id={o.id} />
              <span className="n">{o.name}</span>
              <span className="b">{o.line}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="h2">{copy.host.sectionsHeading}</h2>
        {SECTION_LABELS.map(([key, name, label]) => (
          <div className="field" key={key}>
            <label className="switch" htmlFor={name}>
              <input
                id={name}
                name={name}
                type="checkbox"
                checked={sections[key]}
                onChange={(e) => setSections({ ...sections, [key]: e.target.checked })}
              />
              <span>{label}</span>
            </label>
          </div>
        ))}
        <span className="hint">{copy.host.sectionsHint}</span>
      </section>
    </>
  );
}
