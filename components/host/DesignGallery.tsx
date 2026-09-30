"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { designsFor, LAYOUTS, type LayoutOption } from "@/lib/layouts";
import type { Palette } from "@/lib/db/types";
import { InviteThumb } from "./InviteThumb";
import { Sheet } from "./Sheet";

/** What the tiles draw. A handful of things about one invite, which is all a thumbnail knows. */
export type ThumbEvent = {
  title: string;
  intro: string | null;
  palette: Palette | null;
  themeId: string | null;
  ink: string | null;
  set: string | null;
};

// The row of designs, and the sheet behind each one.
//
// Two screens offer this same choice: the Design tab, against the host's own invite, and step two
// of New event, against a stand in party because there is no event yet. They were not the same
// component, and the difference showed: the Design tab drew each invite in its own artwork with
// its own envelope, and New event drew four copies of one beige diagram. A host therefore picked
// their look twice, once blind and once properly.
//
// So it is one component, and what differs between the two screens is passed in: which invite the
// tiles are drawn from, and where the preview frame points. Everything about how a design is
// offered, chosen and looked at lives here, once.
export function DesignGallery({ type, layout, onPick, thumb, previewSrc, fullSrc }: {
  /** Which kind of party, which decides what is offered first. */
  type: string;
  /** The design in use now. */
  layout: string;
  onPick: (id: string) => void;
  thumb: ThumbEvent;
  /** The page the sheet's frame loads for one design. */
  previewSrc: (id: string) => string;
  /** Where Open full size goes, when there is anywhere to come back to. Left out in the setup
   *  flow: a new tab there has no party to return to, and the frame is already phone sized. */
  fullSrc?: (id: string) => string;
}) {
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<LayoutOption | null>(null);
  const { fits, rest } = designsFor(type);
  const offered = showAll ? [...fits, ...rest] : fits;
  const chosenName = LAYOUTS.find((l) => l.id === layout)?.name ?? layout;

  return (
    <>
      <div className="designs">
        {offered.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`design ${layout === d.id ? "on" : ""}`}
            onClick={() => setOpen(d)}
          >
            <span className="design-art">
              <InviteThumb layout={d.id} title={thumb.title} intro={thumb.intro} palette={thumb.palette} themeId={thumb.themeId} ink={thumb.ink} set={thumb.set} />
            </span>
            <span className="n">{d.name}</span>
            {d.line && <span className="b">{d.line}</span>}
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

      {open && (
        <DesignSheet
          design={open}
          src={previewSrc(open.id)}
          full={fullSrc?.(open.id)}
          chosen={layout === open.id}
          chosenName={chosenName}
          onUse={() => { onPick(open.id); setOpen(null); }}
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
function DesignSheet({ design, src, full, chosen, chosenName, onUse, onClose }: {
  design: LayoutOption;
  src: string;
  full?: string;
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
          {full && <a className="btn small" href={full} target="_blank" rel="noreferrer">{copy.host.openFull}</a>}
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
