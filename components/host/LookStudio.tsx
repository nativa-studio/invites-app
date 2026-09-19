"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { designsFor, LAYOUTS, type LayoutOption } from "@/lib/layouts";
import { EVENT_TYPES } from "@/lib/event-types";
import { DesignThumb } from "./DesignThumb";
import { Sheet } from "./Sheet";
import type { Palette } from "@/lib/db/types";

type Sections = { details: boolean; day: boolean; know: boolean; after: boolean };

const SECTION_LABELS: [keyof Sections, string, string][] = [
  ["details", "show_details", "The details: when, where, what to wear"],
  ["day", "show_runsheet", "The order of the afternoon"],
  ["know", "show_good_to_know", "Good to know"],
  ["after", "show_after", "Questions, and how to ask them"],
];

export type LookState = {
  type: string;
  layout: string;
  sections: Sections;
  palette: Palette | null;
  themeId: string | null;
};

// Design: what kind of party it is, then what the invite looks like.
//
// The two are one screen because the first narrows the second. A memorial should not be offered
// tape, tilted cards and cartoon characters, and a fourth birthday should not have to scroll past
// the quiet one to find them. The type filters rather than forbids: anything left out is one tap
// away, counted and offered by name, because a host wanting the wrong thing on purpose is allowed.
//
// A design is picked by looking at it, not by reading its name off a radio button. Each one is a
// square with the invite standing in front of its envelope, and tapping it opens the real thing
// at phone size, with a button that plays the envelope opening, which is the part of this product
// that does not survive being described.
//
// The controls carry their own form names, so the panel's field manifest saves them as before.
export function LookStudio({ eventId, saved }: { eventId: string; saved: LookState }) {
  const [type, setType] = useState(saved.type);
  const [layout, setLayout] = useState(saved.layout);
  const [sections, setSections] = useState(saved.sections);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<LayoutOption | null>(null);

  const { fits, rest } = designsFor(type);
  const offered = showAll ? [...fits, ...rest] : fits;
  const savedName = LAYOUTS.find((l) => l.id === saved.layout)?.name ?? saved.layout;
  const chosenName = LAYOUTS.find((l) => l.id === layout)?.name ?? layout;
  const changed = layout !== saved.layout || type !== saved.type || SECTION_LABELS.some(([k]) => sections[k] !== saved.sections[k]);

  const on = SECTION_LABELS.filter(([k]) => sections[k]).map(([k]) => k).join(",");
  const previewSrc = (id: string) => `/app/preview/${eventId}?layout=${id}&show=${on}`;

  return (
    <>
      {/* The chosen values travel as hidden inputs: the choosing happens in a sheet and on tiles,
          neither of which is a form control the panel could read. */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="layout_id" value={layout} />

      <section className="card">
        <h2 className="h2">{copy.host.partyTypeHeading}</h2>
        <p className="hint">{copy.host.partyTypeBlurb}</p>
        <div className="tiles">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tile ${type === t.id ? "on" : ""}`}
              aria-pressed={type === t.id}
              onClick={() => setType(t.id)}
            >
              <span className="tile-name">{t.label}</span>
              <span className="tile-line">{t.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="look-head">
          <h2 className="h2">{copy.host.designHeading}</h2>
          <span className="hint">{changed ? copy.host.designUnsaved(savedName) : copy.host.designSaved(savedName)}</span>
        </div>
        <div className="designs">
          {offered.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`design ${layout === d.id ? "on" : ""}`}
              onClick={() => setOpen(d)}
            >
              <span className="design-art">
                <DesignThumb id={d.id} palette={saved.palette} themeId={saved.themeId} />
              </span>
              <span className="n">{d.name}</span>
              <span className="b">{d.line}</span>
              {layout === d.id && <span className="tag">{copy.host.designChosen}</span>}
            </button>
          ))}
        </div>
        {rest.length > 0 && !showAll && (
          <button type="button" className="btn small" onClick={() => setShowAll(true)}>
            {copy.host.designShowRest(rest.length)}
          </button>
        )}
        {rest.length > 0 && showAll && <p className="hint">{copy.host.designRestHint}</p>}
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

      {open && (
        <DesignSheet
          design={open}
          src={previewSrc(open.id)}
          chosen={layout === open.id}
          chosenName={chosenName}
          onUse={() => { setLayout(open.id); setOpen(null); }}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

// One design, at the size a guest sees it, with the opening on a button.
//
// The frame is keyed by a counter rather than reloaded, because the envelope opens once per mount
// and then the card is out of it. Bumping the key mounts a fresh one, which is the only honest way
// to watch it again.
function DesignSheet({ design, src, chosen, chosenName, onUse, onClose }: {
  design: LayoutOption;
  src: string;
  chosen: boolean;
  chosenName: string;
  onUse: () => void;
  onClose: () => void;
}) {
  const [run, setRun] = useState(0);
  return (
    <Sheet title={design.name} blurb={design.line} onClose={onClose}>
      <div className="sheet-body">
        <div className="screen phone">
          <iframe key={run} src={src} title={copy.host.designFrameTitle(design.name)} loading="lazy" />
        </div>
        <div className="actions">
          <button type="button" className="btn small" onClick={() => setRun(run + 1)}>{copy.host.designPlay}</button>
          <a className="btn small" href={`${src}&full=1`} target="_blank" rel="noreferrer">{copy.host.openFull}</a>
        </div>
        <p className="hint">{copy.host.designPlayHint}</p>
        <div className="sheet-foot">
          {chosen
            ? <span className="hint">{copy.host.designAlready}</span>
            : <span className="hint">{copy.host.designInstead(chosenName)}</span>}
          <button type="button" className="btn primary" onClick={onUse} disabled={chosen}>{copy.host.designUse}</button>
        </div>
      </div>
    </Sheet>
  );
}
