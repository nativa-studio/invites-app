"use client";
import type { EventRow } from "@/lib/db/types";
import { LookStudio } from "@/components/host/LookStudio";
import { PanelForm } from "@/components/host/PanelForm";

// What the invite looks like: its shape, its picture, and which parts of it show at all.
export const LOOK_FIELDS = ["layout_id", "invite_image_path", "show_details", "show_runsheet", "show_good_to_know", "show_after"] as const;

export function LookPanel({ e }: { e: EventRow }) {
  return (
    <PanelForm eventId={e.id} fields={LOOK_FIELDS}>
      <LookStudio
        eventId={e.id}
        saved={{
          layout: e.layout_id,
          artwork: e.invite_image_path ?? "",
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
