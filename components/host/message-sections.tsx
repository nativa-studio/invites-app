import type { EventRow } from "@/lib/db/types";
import { Field } from "@/components/host/fields";
import type { Section } from "./sections";

// The parts of a message a host can change, in the same shape as the parts of the invite, so the
// same drawer edits both.
//
// The ids match the data-part names the preview carries, so tapping a piece of the message finds
// its entry here.
export const MESSAGE_SECTIONS: Section[] = [
  {
    id: "card",
    title: "The link preview",
    blurb: "What chat apps draw above your message. The picture is your invite's envelope, with the age on the stamp, and it is made for you.",
    fields: ["share_title", "share_description"],
    render: (e) => (
      <>
        <Field id="share_title" label="Title" value={e.share_title} hint="Empty falls back to the event's title." />
        <Field id="share_description" label="The line under it" value={e.share_description} rows={3} hint="Empty falls back to the date and your opening line." />
      </>
    ),
  },
  {
    id: "invite",
    title: "The invite text",
    blurb: "What you send the first time. {name}, {title}, {date} and {link} are filled in per guest, so write it once.",
    fields: ["text_template"],
    render: (e) => <Field id="text_template" label="Invite text" value={e.text_template} rows={4} />,
  },
  {
    id: "reminder",
    title: "The reminder text",
    blurb: "What you send to someone who has not replied. Empty uses the default wording.",
    fields: ["reminder_template"],
    render: (e) => <Field id="reminder_template" label="Reminder text" value={e.reminder_template} rows={4} />,
  },
];

export const messageSectionById = (id: string) => MESSAGE_SECTIONS.find((s) => s.id === id);

// The event's own line, as a chat app will draw it, falling back the same way the page does.
export function previewTitle(e: EventRow): string {
  return e.share_title?.trim() || e.title;
}
