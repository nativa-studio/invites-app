"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { LAYOUTS } from "@/lib/layouts";
import { STRIP_SETS, STRIP_INKS, stripSet, inkFor, paperFor } from "@/lib/strip-set";
import { Mono } from "@/components/art/mono";
import { EVENT_TYPES } from "@/lib/event-types";
import { DesignGallery } from "./DesignGallery";
import type { Palette } from "@/lib/db/types";

type Sections = { details: boolean; day: boolean; know: boolean; after: boolean };

const SECTION_LABELS: [keyof Sections, string, string][] = [
  ["details", "show_details", "The details: when, where, what to wear"],
  ["day", "show_runsheet", "The order of the afternoon"],
  ["know", "show_good_to_know", "Info booth"],
  ["after", "show_after", "Questions, and how to ask them"],
];

export type LookState = {
  type: string;
  layout: string;
  sections: Sections;
  title: string;
  intro: string | null;
  palette: Palette | null;
  themeId: string | null;
  ink: string | null;
  stripSet: string | null;
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
  const [ink, setInk] = useState(saved.ink ?? "charcoal");
  // Null in the column means "whatever the theme implies", so the picker opens on the set the
  // invite is actually drawn in rather than on nothing.
  const [set, setSet] = useState(stripSet(saved.stripSet, saved.themeId).id);

  const savedName = LAYOUTS.find((l) => l.id === saved.layout)?.name ?? saved.layout;
  const changed = layout !== saved.layout || type !== saved.type || SECTION_LABELS.some(([k]) => sections[k] !== saved.sections[k]);

  const on = SECTION_LABELS.filter(([k]) => sections[k]).map(([k]) => k).join(",");
  const previewSrc = (id: string) => `/app/preview/${eventId}?layout=${id}&show=${on}`;

  return (
    <>
      {/* The chosen values travel as hidden inputs: the choosing happens in a sheet and on tiles,
          neither of which is a form control the panel could read. */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="layout_id" value={layout} />
      <input type="hidden" name="strip_set" value={set} />
      <input type="hidden" name="ink" value={ink} />

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
        {/* The tiles and the sheet behind them, the same ones step two of New event draws. See
            components/host/DesignGallery.tsx. */}
        <DesignGallery
          type={type}
          layout={layout}
          onPick={setLayout}
          thumb={{ title: saved.title, intro: saved.intro, palette: saved.palette, themeId: saved.themeId, ink, set }}
          previewSrc={previewSrc}
          fullSrc={(id) => `${previewSrc(id)}&full=1`}
        />
      </section>


      {/* Only for the illustrated strip, because it is the only design these two do anything to.
          Shown under the gallery rather than inside the design sheet: a host picking Diwali is
          choosing the occasion, not inspecting a design, and it has to survive the sheet closing. */}
      {layout === "strip" && (
        <section className="card">
          <h2 className="h2">{copy.host.stripHeading}</h2>
          <p className="hint">{copy.host.stripHint}</p>

          <p className="look-sub">{copy.host.stripSetLabel}</p>
          <div className="sets">
            {STRIP_SETS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`set ${set === s.id ? "on" : ""}`}
                aria-pressed={set === s.id}
                onClick={() => setSet(s.id)}
                style={{ background: paperFor(ink), color: inkFor(ink) }}
              >
                <span className="trio">{s.trio.map((n, i) => <Mono key={i} name={n} size={30} />)}</span>
                <span className="n">{s.name}</span>
              </button>
            ))}
          </div>

          <p className="look-sub">{copy.host.stripInkLabel}</p>
          <div className="inks">
            {STRIP_INKS.map((i) => (
              <button
                key={i.id}
                type="button"
                className={`swatch ${ink === i.id ? "on" : ""}`}
                aria-pressed={ink === i.id}
                aria-label={i.name}
                title={i.name}
                onClick={() => setInk(i.id)}
                style={{ background: paperFor(i.id) }}
              >
                <span style={{ background: inkFor(i.id) }} />
              </button>
            ))}
          </div>
        </section>
      )}

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
