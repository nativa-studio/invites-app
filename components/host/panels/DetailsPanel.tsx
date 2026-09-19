"use client";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { formatLongDate, formatTimeRange } from "@/lib/format";
import { Choice, Field, Switch } from "@/components/host/fields";
import { EditCard, Sum } from "@/components/host/EditCard";

// Everything the invite says in words, in the order a guest meets it: what and when, then where,
// then the things they need to know if they come.
//
// Each card says what it currently reads and opens a sheet to change it. It used to be one form
// of thirty-odd fields with a single Save at the bottom, which on a phone meant scrolling past
// twenty things you were not changing to reach the button, and no way to see what anything said
// without reading it out of an input.
export const DETAILS_FIELDS = [
  "title", "host_line", "intro", "date", "start_time", "end_time", "time_note", "status",
  "venue", "address", "parking", "access_info", "accessibility_venue", "host_phone",
  "serve_text", "what_to_bring", "plate_enabled", "plate_host_note", "gift_stance", "gift_note",
  "photo_sharing", "good_to_know",
] as const;

const BASICS = ["title", "host_line", "intro", "date", "start_time", "end_time", "time_note", "status"] as const;
const PLACE = ["venue", "address", "parking", "access_info", "accessibility_venue", "host_phone"] as const;
const KNOW = ["serve_text", "what_to_bring", "plate_enabled", "plate_host_note", "gift_stance", "gift_note", "photo_sharing", "good_to_know"] as const;

const STATUS: [string, string][] = [["draft", "Draft (links show a holding page)"], ["live", "Live"], ["thanks", "Say thanks (after the party)"], ["archived", "Archived"]];
const GIFTS: [string, string][] = [["none", "No gifts please"], ["optional", "Gifts optional"], ["books", "Books only"], ["wishlist", "Wish list link"]];
const PHOTOS: [string, string][] = [["none", "Say nothing"], ["kids_off_social", "Please keep photos of the kids off social media"], ["ask", "Please ask before posting anyone's photos"], ["share", "Share away"]];

const label = (options: [string, string][], value: unknown) => options.find(([v]) => v === value)?.[1] ?? null;

export function DetailsPanel({ e }: { e: EventRow }) {
  const when = [formatLongDate(e.date), formatTimeRange(e.start_time, e.end_time, e.time_note)].filter(Boolean).join(", ");
  return (
    <>
      <EditCard
        eventId={e.id}
        title={copy.host.basicsHeading}
        blurb={copy.host.basicsBlurb}
        fields={BASICS}
        summary={
          <>
            <Sum label="Title" value={e.title} />
            <Sum label="From" value={e.host_line} />
            <Sum label="When" value={when} />
            <Sum label="Status" value={label(STATUS, e.status)} />
          </>
        }
      >
        <Field id="title" label="Title" value={e.title} hint='For a birthday, keep the form "Name is turning N" and the age lands on the seal.' />
        <Field id="host_line" label="From" value={e.host_line} hint="Shown under the title, e.g. With love from Gabriel's mum and dad" />
        <Field id="intro" label="Intro" value={e.intro} rows={3} />
        <div className="counts">
          <Field id="date" label="Date" value={e.date} type="date" />
          <Field id="start_time" label="Start" value={e.start_time} type="time" />
          <Field id="end_time" label="End (optional)" value={e.end_time} type="time" />
        </div>
        <Field id="time_note" label="Time, in your words (optional)" value={e.time_note} hint='Overrides the times, e.g. "From 2pm, come when you can"' />
        <Choice id="status" label="Status" value={e.status} options={STATUS} />
      </EditCard>

      <EditCard
        eventId={e.id}
        title={copy.host.placeHeading}
        blurb={copy.host.placeBlurb}
        fields={PLACE}
        summary={
          <>
            <Sum label="Venue" value={e.venue} />
            <Sum label="Address" value={e.address} />
            <Sum label="Parking" value={e.parking} />
            <Sum label="Getting in" value={e.access_info} />
            <Sum label="Your mobile" value={e.host_phone} />
          </>
        }
      >
        <Field id="venue" label="Venue" value={e.venue} hint="e.g. Our place, or the park's name" />
        <Field id="address" label="Address" value={e.address} hint="Used for Open in Maps and the calendar" />
        <Field id="parking" label="Parking (optional)" value={e.parking} />
        <Field id="access_info" label="Getting in (yes guests only)" value={e.access_info} hint="Gate code, buzzer, which door. Shown only to people who said yes." />
        <Field id="accessibility_venue" label="Accessibility at the venue (optional)" value={e.accessibility_venue} />
        <Field id="host_phone" label="Your mobile" value={e.host_phone} type="tel" hint='Powers the "Questions? Text" line on the invite' />
      </EditCard>

      <EditCard
        eventId={e.id}
        title={copy.host.knowHeading}
        blurb={copy.host.knowBlurb}
        fields={KNOW}
        summary={
          <>
            <Sum label="Food" value={e.serve_text} />
            <Sum label="Bring or wear" value={e.what_to_bring} />
            <Sum label="Bring a plate" value={e.plate_enabled ? "On" : null} />
            <Sum label="Gifts" value={label(GIFTS, e.gift_stance)} />
            <Sum label="Photos" value={label(PHOTOS, e.photo_sharing)} />
          </>
        }
      >
        <Field id="serve_text" label="What we'll serve" value={e.serve_text} />
        <Field id="what_to_bring" label="What to bring / wear" value={e.what_to_bring} />
        <Switch id="plate_enabled" label="Bring a plate" value={e.plate_enabled} />
        <Field id="plate_host_note" label="Bring a plate wording" value={e.plate_host_note} />
        <Choice id="gift_stance" label="Gifts" value={e.gift_stance} options={GIFTS} />
        <Field id="gift_note" label="Gift note (optional)" value={e.gift_note} />
        <Choice id="photo_sharing" label="Photos" value={e.photo_sharing} options={PHOTOS} />
        <Field id="good_to_know" label="Anything else (optional)" value={e.good_to_know} rows={2} />
      </EditCard>
    </>
  );
}
