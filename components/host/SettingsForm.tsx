"use client";
import { useActionState } from "react";
import { saveEvent, type SaveState } from "@/app/app/events/[id]/settings/actions";
import type { EventRow } from "@/lib/db/types";

type E = EventRow & Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));
const t = (v: unknown) => s(v).slice(0, 5);

function Field({ id, label, value, hint, type = "text", rows }: { id: string; label: string; value: unknown; hint?: string; type?: string; rows?: number }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {rows ? <textarea id={id} name={id} defaultValue={s(value)} rows={rows} /> : <input id={id} name={id} type={type} defaultValue={type === "time" ? t(value) : s(value)} />}
      {hint && <span className="muted" style={{ fontSize: 13 }}>{hint}</span>}
    </div>
  );
}
function Choice({ id, label, value, options }: { id: string; label: string; value: unknown; options: [string, string][] }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} defaultValue={s(value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </div>
  );
}
function Switch({ id, label, value }: { id: string; label: string; value: unknown }) {
  return (
    <label style={{ display: "flex", gap: 10, alignItems: "center", minHeight: 44 }}>
      <input type="checkbox" name={id} defaultChecked={Boolean(value)} style={{ width: 22, height: 22 }} />
      <span>{label}</span>
    </label>
  );
}

export function SettingsForm({ e }: { e: E }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEvent, {});
  return (
    <form action={action} style={{ display: "grid", gap: 20 }}>
      <input type="hidden" name="event_id" value={e.id} />

      <section className="card">
        <h2 className="h2">Basics</h2>
        <Field id="title" label="Title" value={e.title} hint='For a birthday, keep the form "Name is turning N" and the age lands on the stamp.' />
        <Field id="host_line" label="From" value={e.host_line} hint="Shown under the title, e.g. With love from Gabriel's mum and dad" />
        <Field id="intro" label="Intro" value={e.intro} rows={3} />
        <div className="counts">
          <Field id="date" label="Date" value={e.date} type="date" />
          <Field id="start_time" label="Start" value={e.start_time} type="time" />
          <Field id="end_time" label="End (optional)" value={e.end_time} type="time" />
        </div>
        <Field id="time_note" label="Time, in your words (optional)" value={e.time_note} hint='Overrides the times on the invite, e.g. "From 2pm, come when you can"' />
        <Field id="rsvp_by" label="Reply by" value={e.rsvp_by} type="date" />
        <Choice id="status" label="Status" value={e.status} options={[["draft", "Draft (links show a holding page)"], ["live", "Live"], ["thanks", "Say thanks (after the party)"], ["archived", "Archived"]]} />
      </section>

      <section className="card">
        <h2 className="h2">The place</h2>
        <Field id="venue" label="Venue" value={e.venue} hint="e.g. Our place, or the park's name" />
        <Field id="address" label="Address" value={e.address} hint="Used for Open in Maps and the calendar" />
        <Field id="parking" label="Parking (optional)" value={e.parking} />
        <Field id="access_info" label="Getting in (yes guests only)" value={e.access_info} hint="Gate code, buzzer, which door. Shown only to people who said yes, in the see-you-soon message." />
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
        <Field id="gift_note" label="Gift note (optional)" value={e.gift_note} hint="e.g. If you'd like to, something small: he loves books and anything with wheels." />
        <Choice id="parents_mode" label="Parents" value={e.parents_mode} options={[["stay", "Parents and family welcome to stay"], ["drop_off", "Drop-off party"], ["either", "Either, say nothing"]]} />
        <Switch id="siblings_welcome" label="Little brothers and sisters welcome" value={e.siblings_welcome} />
        <Choice id="photo_sharing" label="Photos" value={e.photo_sharing} options={[["none", "Say nothing"], ["kids_off_social", "Please keep photos of the kids off social media"], ["ask", "Please ask before posting anyone's photos"], ["share", "Take all the photos you like and share them with us"]]} />
        <Field id="good_to_know" label="Anything else (optional)" value={e.good_to_know} rows={2} />
      </section>

      <section className="card">
        <h2 className="h2">Look</h2>
        <Choice id="layout_id" label="Layout" value={e.layout_id} options={[["suite", "Stationery suite, cards and an envelope"], ["lineup", "The lineup, one page with artwork along the bottom"], ["peek", "Peek, characters leaning in from the edges"], ["strip", "Illustrated strip"]]} />
        <Choice id="invite_image_path" label="Artwork" value={e.invite_image_path} options={[["", "None"], ["/artwork/gabriel-lineup.png", "Gabriel's lineup"]]} />
        <span className="muted" style={{ fontSize: 13 }}>Uploading your own artwork is coming. For now the lineup layout uses the picture above.</span>
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

      <section className="card">
        <h2 className="h2">Messages</h2>
        <Field id="text_template" label="Invite text" value={e.text_template} rows={3} hint="{name}, {title}, {date} and {link} are filled in per guest." />
        <Field id="reminder_template" label="Reminder text" value={e.reminder_template} rows={3} />
        <Field id="share_title" label="Link preview title (optional)" value={e.share_title} />
        <Field id="share_description" label="Link preview description (optional)" value={e.share_description} rows={2} />
      </section>

      {state.error && <p className="notice" role="alert">{state.error}</p>}
      {state.saved && <p className="muted" aria-live="polite">Saved.</p>}
      <div className="actions"><button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving" : "Save"}</button></div>
    </form>
  );
}
