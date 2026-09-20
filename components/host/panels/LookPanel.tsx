"use client";
import type { EventRow } from "@/lib/db/types";
import { LookStudio } from "@/components/host/LookStudio";
import { asLayoutId } from "@/lib/layouts";
import { PanelForm } from "@/components/host/PanelForm";

// What the invite looks like: its shape, and which parts of it show at all. The pictures are no
// longer a choice: there is one bundled set and every event gets it.
export const LOOK_FIELDS = ["type", "layout_id", "strip_set", "ink", "show_details", "show_runsheet", "show_good_to_know", "show_after"] as const;

export function LookPanel({ e }: { e: EventRow }) {
  return (
    <PanelForm eventId={e.id} fields={LOOK_FIELDS}>
      <LookStudio
        eventId={e.id}
        saved={{
          type: e.type,
          title: e.title,
          intro: e.intro,
          artwork: e.invite_image_path,
          layout: asLayoutId(e.layout_id),
          palette: e.palette,
          themeId: e.theme_id,
          ink: e.ink,
          stripSet: e.strip_set ?? null,
          sections: {
            details: e.show_details !== false,
            day: e.show_runsheet !== false,
            know: e.show_good_to_know !== false,
            after: e.show_after !== false,
          },
        }}
      />
    </PanelForm>
  );
}
