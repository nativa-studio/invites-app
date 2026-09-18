"use client";
import type { EventRow } from "@/lib/db/types";
import { Field } from "@/components/host/fields";
import { PanelForm } from "@/components/host/PanelForm";

// The words that go out rather than the words on the invite.
//
// These used to sit under the guest list, which put a form a host fills in once at the bottom of
// the screen they use every day. They are a setting, so they live with the settings, and they
// fold, because Details is long enough already.
//
// The fold wraps the form rather than sitting inside it. The save bar is sticky, so a form left
// showing inside a shut panel would float its own Save button under a heading with nothing above
// it. Shut means shut.
export const MESSAGE_FIELDS = ["text_template", "reminder_template", "share_title", "share_description"] as const;

export function MessagesPanel({ e }: { e: EventRow }) {
  return (
    <details className="card drop">
      <summary>Messages</summary>
      <div className="drop-body">
        <PanelForm eventId={e.id} fields={MESSAGE_FIELDS} label="Save messages">
          <Field id="text_template" label="Invite text" value={e.text_template} rows={3} hint="{name}, {title}, {date} and {link} are filled in per guest." />
          <Field id="reminder_template" label="Reminder text" value={e.reminder_template} rows={3} />
          <Field id="share_title" label="Link preview title (optional)" value={e.share_title} />
          <Field id="share_description" label="Link preview description (optional)" value={e.share_description} rows={2} />
        </PanelForm>
      </div>
    </details>
  );
}
