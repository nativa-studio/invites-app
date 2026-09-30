"use client";
import type { EventRow } from "@/lib/db/types";
import { LookStudio } from "@/components/host/LookStudio";
import { asLayoutId } from "@/lib/layouts";
import { PanelForm } from "@/components/host/PanelForm";

// What the invite looks like: its shape, and nothing else.
//
// Not who stands on it. The characters belong to the design and are read from it, so there is
// nothing here to save and, more to the point, nothing to save that could put one design's
// characters on another. See artworkFor in lib/layouts.ts.
// The four show switches have gone from this panel. They were a third list of the same four
// booleans, after the parts sheet and the drawer on each part, and the furthest of the three from
// the thing it controls: a host reading "Info booth" in a column of checkboxes has to remember
// which card that is, where the same switch inside that card's own drawer needs no remembering.
export const LOOK_FIELDS = ["type", "layout_id", "strip_set", "ink"] as const;

export function LookPanel({ e }: { e: EventRow }) {
  return (
    <PanelForm eventId={e.id} fields={LOOK_FIELDS}>
      <LookStudio
        eventId={e.id}
        saved={{
          type: e.type,
          title: e.title,
          intro: e.intro,
          layout: asLayoutId(e.layout_id),
          palette: e.palette,
          themeId: e.theme_id,
          ink: e.ink,
          stripSet: e.strip_set ?? null,
        }}
      />
    </PanelForm>
  );
}
