"use client";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { Choice, Switch } from "@/components/host/fields";
import { LayoutPicker } from "@/components/host/LayoutPicker";
import { LAYOUTS } from "@/lib/layouts";
import { PanelForm } from "@/components/host/PanelForm";

// What the invite looks like: its shape, its picture, and which parts of it show at all.
export const LOOK_FIELDS = ["layout_id", "invite_image_path", "show_details", "show_runsheet", "show_good_to_know", "show_after"] as const;

export function LookPanel({ e }: { e: EventRow }) {
  return (
    <PanelForm eventId={e.id} fields={LOOK_FIELDS}>
      <section className="card">
        <LayoutPicker eventId={e.id} value={e.layout_id} options={LAYOUTS} />
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
