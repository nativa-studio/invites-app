import type { EventRow } from "@/lib/db/types";
import { Field, Switch } from "@/components/host/fields";
import { askLine, signoffMessage } from "@/lib/ask-line";
import { KnowEditor, KNOW_FIELDS } from "@/components/host/KnowEditor";

// What each part of the invite is, and what a host can change about it. The ids match the
// data-section names the invite carries, so tapping a card on the preview finds its entry here.
//
// `show` is the column that decides whether the part appears at all, where the part is optional.
// The cover and the reply are not optional, so they have none.
//
// Each entry declares its own fields, and only those are ever written: the panel's manifest
// travels with the form and the action honours it, so editing one part of the invite cannot
// touch another.
export type Section = {
  id: string;
  title: string;
  blurb?: string;
  show?: { column: string; label: string };
  fields: readonly string[];
  render: (e: EventRow) => React.ReactNode;
};

export const SECTIONS: Section[] = [
  {
    id: "cover",
    title: "The cover",
    blurb: "The title and the line under it. When and where live on the details card below, and who it is from is signed at the end, so none of it is said twice.",
    fields: ["title", "intro"],
    render: (e) => (
      <>
        <Field id="title" label="Title" value={e.title} hint='For a birthday, keep the form "Name is turning N" and the age lands on the seal.' />
        <Field id="intro" label="A line or two" value={e.intro} rows={3} />
      </>
    ),
  },
  {
    id: "details",
    title: "The details",
    blurb: "When and where, and a link to the map. Switch this off and the cover carries the date and place instead, so they are never lost.",
    show: { column: "show_details", label: "Show the details on the invite" },
    fields: ["date", "start_time", "end_time", "time_note", "venue", "address", "show_details"],
    render: (e) => (
      <>
        <div className="counts">
          <Field id="date" label="Date" value={e.date} type="date" />
          <Field id="start_time" label="Start" value={e.start_time} type="time" />
          <Field id="end_time" label="End" value={e.end_time} type="time" />
        </div>
        <Field id="time_note" label="Time, in your words (optional)" value={e.time_note} hint='Replaces the times, e.g. "From 2pm, come when you can"' />
        <Field id="venue" label="Venue" value={e.venue} hint="e.g. Our place, or the park's name" />
        <Field id="address" label="Address" value={e.address} hint="Used for Open in Maps and the calendar file" />
      </>
    ),
  },
  {
    id: "day",
    title: "The order of the afternoon",
    blurb: "Built from the runsheet stops you have marked as visible to guests. Empty means this part does not appear, whatever the switch says.",
    show: { column: "show_runsheet", label: "Show the order of the afternoon" },
    fields: ["show_runsheet"],
    render: () => null,
  },
  {
    id: "know",
    title: "Good to know",
    blurb: "What to bring, food, gifts, photos. Each line only appears when you have said something about it, and they come in the order you put them in.",
    show: { column: "show_good_to_know", label: "Show good to know" },
    fields: [...KNOW_FIELDS, "show_good_to_know"],
    render: (e) => <KnowEditor e={e} />,
  },
  {
    id: "after",
    title: "Questions",
    blurb: "The last block on the invite: how to reach you. Leave it empty and it reads \u201cText\u201d and your name from the sign-off. The line is tappable when you have put your mobile in the details.",
    show: { column: "show_after", label: "Show the questions block" },
    fields: ["ask_note", "show_after"],
    render: (e) => (
      <Field
        id="ask_note"
        label="What the last line says"
        value={e.ask_note}
        hint={`Empty means \u201c${askLine({ ask_note: null, host_line: e.host_line })}\u201d`}
      />
    ),
  },
  {
    id: "signoff",
    title: "The sign-off",
    blurb: "The last thing on the invite: you, saying you are looking forward to it. The name under it is the From line from Details, so you do not type it twice.",
    show: { column: "show_signoff", label: "Show the sign-off" },
    fields: ["signoff_note", "host_line", "show_signoff"],
    render: (e) => (
      <>
        <Field
          id="signoff_note"
          label="The message"
          value={e.signoff_note}
          rows={2}
          hint={`Empty means \u201c${signoffMessage({ signoff_note: null })}\u201d`}
        />
        <Field id="host_line" label="Signed" value={e.host_line} hint="e.g. With love Gabe, Tommy and Ma" />
      </>
    ),
  },
  {
    id: "updates",
    title: "Updates",
    blurb: "Whatever you have posted to guests. Post and remove them on the Updates screen; this part appears on its own once there is one.",
    fields: [],
    render: () => null,
  },
];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);


// The show switch is a field like any other, so it saves through the same manifest. It is drawn
// apart from the section's own wording because it answers a different question: not what this
// part says, but whether it is there at all.
export function ShowSwitch({ section, e }: { section: Section; e: EventRow }) {
  if (!section.show) return null;
  const value = (e as unknown as Record<string, unknown>)[section.show.column];
  return <Switch id={section.show.column} label={section.show.label} value={value !== false} />;
}
