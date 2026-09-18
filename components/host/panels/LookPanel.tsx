"use client";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { Choice, Switch } from "@/components/host/fields";
import { LayoutPicker } from "@/components/host/LayoutPicker";
import { PanelForm } from "@/components/host/PanelForm";

const LAYOUT_OPTIONS = [
  { id: "suite", name: "Stationery suite", line: "Cards in an envelope that opens" },
  { id: "lineup", name: "The lineup", line: "One page, artwork along the bottom" },
  { id: "peek", name: "Peek", line: "Characters leaning in from the edges" },
  { id: "post", name: "In the post", line: "An envelope opens, and the characters lean in" },
  { id: "strip", name: "Illustrated strip", line: "The same cards, no envelope, straight down" },
];

// What the invite looks like: its shape, its picture, and which parts of it show at all.
export const LOOK_FIELDS = ["layout_id", "invite_image_path", "show_details", "show_runsheet", "show_good_to_know", "show_after"] as const;

export function LookPanel({ e }: { e: EventRow }) {
  return (
    <PanelForm eventId={e.id} fields={LOOK_FIELDS}>
      <section className="card">
        <LayoutPicker eventId={e.id} value={e.layout_id} options={LAYOUT_OPTIONS} />
        <Choice
          id="invite_image_path"
          label="Artwork"
          value={e.invite_image_path}
          options={[["", "None"], ["/artwork/gabriel-lineup.png", "Gabriel's lineup"]]}
          hint="Uploading your own is coming. The lineup and peek layouts use the picture above."
        />
      </section>
      <section className="card">
        <h2 className="h2">{copy.host.sectionsHeading}</h2>
        <Switch id="show_details" label="The details: when, where, what to wear" value={e.show_details} />
        <Switch id="show_runsheet" label="The order of the afternoon" value={e.show_runsheet} />
        <Switch id="show_good_to_know" label="Good to know" value={e.show_good_to_know} />
        <Switch id="show_after" label="Updates and photos" value={e.show_after} />
        <span className="hint">{copy.host.sectionsHint}</span>
      </section>
    </PanelForm>
  );
}
