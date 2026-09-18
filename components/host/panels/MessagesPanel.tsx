"use client";
import type { EventRow } from "@/lib/db/types";
import { Field } from "@/components/host/fields";
import { PanelForm } from "@/components/host/PanelForm";

// The words that go out rather than the words on the invite, so they live beside the guests
// they are sent to.
export const MESSAGE_FIELDS = ["text_template", "reminder_template", "share_title", "share_description"] as const;

export function MessagesPanel({ e }: { e: EventRow }) {
  return (
    <PanelForm eventId={e.id} fields={MESSAGE_FIELDS} label="Save messages">
      <section className="card">
        <h2 className="h2">Messages</h2>
        <Field id="text_template" label="Invite text" value={e.text_template} rows={3} hint="{name}, {title}, {date} and {link} are filled in per guest." />
        <Field id="reminder_template" label="Reminder text" value={e.reminder_template} rows={3} />
        <Field id="share_title" label="Link preview title (optional)" value={e.share_title} />
        <Field id="share_description" label="Link preview description (optional)" value={e.share_description} rows={2} />
      </section>
    </PanelForm>
  );
}
