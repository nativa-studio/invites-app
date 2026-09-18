"use client";
import type { EventRow } from "@/lib/db/types";
import { Choice, Field, Switch } from "@/components/host/fields";
import { PanelForm } from "@/components/host/PanelForm";

// Everything the invite says in words, in the order a guest meets it: what and when, then where,
// then the things they need to know if they come, then what the reply asks them.
export const DETAILS_FIELDS = [
  "title", "host_line", "intro", "date", "start_time", "end_time", "time_note", "rsvp_by", "status",
  "venue", "address", "parking", "access_info", "accessibility_venue", "host_phone",
  "serve_text", "what_to_bring", "plate_enabled", "plate_host_note", "gift_stance", "gift_note",
  "parents_mode", "siblings_welcome", "photo_sharing", "good_to_know",
  "ask_party_mode", "ask_names", "ask_dietary", "ask_accessibility", "ask_emergency", "custom_question", "group_link_enabled",
] as const;

export function DetailsPanel({ e }: { e: EventRow }) {
  return (
    <PanelForm eventId={e.id} fields={DETAILS_FIELDS}>
      <section className="card">
        <h2 className="h2">The basics</h2>
        <Field id="title" label="Title" value={e.title} hint='For a birthday, keep the form "Name is turning N" and the age lands on the seal.' />
        <Field id="host_line" label="From" value={e.host_line} hint="Shown under the title, e.g. With love from Gabriel's mum and dad" />
        <Field id="intro" label="Intro" value={e.intro} rows={3} />
        <div className="counts">
          <Field id="date" label="Date" value={e.date} type="date" />
          <Field id="start_time" label="Start" value={e.start_time} type="time" />
          <Field id="end_time" label="End (optional)" value={e.end_time} type="time" />
        </div>
        <Field id="time_note" label="Time, in your words (optional)" value={e.time_note} hint='Overrides the times, e.g. "From 2pm, come when you can"' />
        <Field id="rsvp_by" label="Reply by" value={e.rsvp_by} type="date" />
        <Choice id="status" label="Status" value={e.status} options={[["draft", "Draft (links show a holding page)"], ["live", "Live"], ["thanks", "Say thanks (after the party)"], ["archived", "Archived"]]} />
      </section>

      <section className="card">
        <h2 className="h2">The place</h2>
        <Field id="venue" label="Venue" value={e.venue} hint="e.g. Our place, or the park's name" />
        <Field id="address" label="Address" value={e.address} hint="Used for Open in Maps and the calendar" />
        <Field id="parking" label="Parking (optional)" value={e.parking} />
        <Field id="access_info" label="Getting in (yes guests only)" value={e.access_info} hint="Gate code, buzzer, which door. Shown only to people who said yes." />
        <Field id="accessibility_venue" label="Accessibility at the venue (optional)" value={e.accessibility_venue} />
        <Field id="host_phone" label="Your mobile" value={e.host_phone} type="tel" hint='Powers the "Questions? Text" line on the invite' />
      </section>

      <section className="card">
        <h2 className="h2">Good to know</h2>
        <Field id="serve_text" label="What we'll serve" value={e.serve_text} />
        <Field id="what_to_bring" label="What to bring / wear" value={e.what_to_bring} />
        <Switch id="plate_enabled" label="Bring a plate" value={e.plate_enabled} />
        <Field id="plate_host_note" label="Bring a plate wording" value={e.plate_host_note} />
        <Choice id="gift_stance" label="Gifts" value={e.gift_stance} options={[["none", "No gifts please"], ["optional", "Gifts optional"], ["books", "Books only"], ["wishlist", "Wish list link"]]} />
        <Field id="gift_note" label="Gift note (optional)" value={e.gift_note} />
        <Choice id="parents_mode" label="Parents" value={e.parents_mode} options={[["stay", "Parents and family welcome to stay"], ["drop_off", "Drop-off party"], ["either", "Either, say nothing"]]} />
        <Switch id="siblings_welcome" label="Little brothers and sisters welcome" value={e.siblings_welcome} />
        <Choice id="photo_sharing" label="Photos" value={e.photo_sharing} options={[["none", "Say nothing"], ["kids_off_social", "Please keep photos of the kids off social media"], ["ask", "Please ask before posting anyone's photos"], ["share", "Share away"]]} />
        <Field id="good_to_know" label="Anything else (optional)" value={e.good_to_know} rows={2} />
      </section>

      <section className="card">
        <h2 className="h2">What the reply asks</h2>
        <Choice id="ask_party_mode" label="How many" value={e.ask_party_mode} options={[["split", "Children and adults separately"], ["single", "One number"]]} />
        <Switch id="ask_names" label="Names of everyone coming" value={e.ask_names} />
        <Switch id="ask_dietary" label="Food needs and allergies" value={e.ask_dietary} />
        <Switch id="ask_accessibility" label="Access needs (free text)" value={e.ask_accessibility} />
        <Switch id="ask_emergency" label="Emergency contact (drop-off parties)" value={e.ask_emergency} />
        <Field id="custom_question" label="One extra question (optional)" value={e.custom_question} />
        <Switch id="group_link_enabled" label="Group link open (for chats)" value={e.group_link_enabled} />
      </section>
    </PanelForm>
  );
}
