import type { EventRow } from "@/lib/db/types";
import { Choice, Field, Switch } from "@/components/host/fields";

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
    blurb: "What a guest sees first, and everything they need to decide whether to come.",
    fields: ["title", "host_line", "intro", "date", "start_time", "end_time", "time_note", "venue"],
    render: (e) => (
      <>
        <Field id="title" label="Title" value={e.title} hint='For a birthday, keep the form "Name is turning N" and the age lands on the seal.' />
        <Field id="host_line" label="From" value={e.host_line} hint="Shown under the title, e.g. With love from Gabriel's mum and dad" />
        <Field id="intro" label="A line or two" value={e.intro} rows={3} />
        <div className="counts">
          <Field id="date" label="Date" value={e.date} type="date" />
          <Field id="start_time" label="Start" value={e.start_time} type="time" />
          <Field id="end_time" label="End" value={e.end_time} type="time" />
        </div>
        <Field id="time_note" label="Time, in your words (optional)" value={e.time_note} hint='Replaces the times, e.g. "From 2pm, come when you can"' />
        <Field id="venue" label="Where" value={e.venue} hint="e.g. Our place, or the park's name" />
      </>
    ),
  },
  {
    id: "details",
    title: "The details",
    blurb: "When and where, spelled out, and a link to the map.",
    show: { column: "show_details", label: "Show the details on the invite" },
    fields: ["venue", "address", "show_details"],
    render: (e) => (
      <>
        <Field id="venue" label="Venue" value={e.venue} />
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
    blurb: "What to bring, food, gifts, parents, photos. Each line only appears when you have said something about it.",
    show: { column: "show_good_to_know", label: "Show good to know" },
    fields: ["what_to_bring", "serve_text", "gift_stance", "gift_note", "parents_mode", "siblings_welcome", "photo_sharing", "good_to_know", "plate_host_note", "show_good_to_know"],
    render: (e) => (
      <>
        <Field id="what_to_bring" label="What to bring or wear" value={e.what_to_bring} hint='e.g. "Swimmers, a towel and a hat"' />
        <Field id="serve_text" label="What you'll serve" value={e.serve_text} />
        <Choice id="gift_stance" label="Gifts" value={e.gift_stance} options={[["none", "No gifts please"], ["optional", "Gifts optional"], ["books", "Books only"], ["wishlist", "Wish list link"]]} />
        <Field id="gift_note" label="Gift note (optional)" value={e.gift_note} />
        <Choice id="parents_mode" label="Parents" value={e.parents_mode} options={[["stay", "Parents and family welcome to stay"], ["drop_off", "Drop-off party"], ["either", "Either, say nothing"]]} />
        <Switch id="siblings_welcome" label="Little brothers and sisters welcome" value={e.siblings_welcome} />
        <Choice id="photo_sharing" label="Photos" value={e.photo_sharing} options={[["none", "Say nothing"], ["kids_off_social", "Please keep photos of the kids off social media"], ["ask", "Please ask before posting anyone's photos"], ["share", "Share away"]]} />
        <Field id="plate_host_note" label="Bring a plate wording" value={e.plate_host_note} hint="Only appears when bring a plate is switched on." />
        <Field id="good_to_know" label="Anything else" value={e.good_to_know} rows={2} />
      </>
    ),
  },
  {
    id: "after",
    title: "Updates and photos",
    blurb: "A short note telling guests you will post updates here and photos afterwards. Nothing to write.",
    show: { column: "show_after", label: "Show updates and photos" },
    fields: ["show_after"],
    render: () => null,
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
