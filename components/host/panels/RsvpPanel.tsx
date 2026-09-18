"use client";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { formatLongDate } from "@/lib/format";
import { Choice, Field, Switch } from "@/components/host/fields";
import { EditCard, Sum } from "@/components/host/EditCard";

// What the reply asks, and what the two buttons say. Everything here is a setting a host changes
// once, before the links go out, which is why each card shows what it says now and the changing
// happens in a sheet.
export const RSVP_FIELDS = [
  "rsvp_by", "ask_party_mode", "ask_names", "ask_dietary", "ask_accessibility", "ask_emergency",
  "custom_question", "yes_label", "no_label",
] as const;

export function RsvpPanel({ e }: { e: EventRow }) {
  const asked = [
    e.ask_party_mode === "split" ? "children and adults separately" : "how many are coming",
    e.ask_names ? "names" : null,
    e.ask_dietary ? "food needs" : null,
    e.ask_accessibility ? "access needs" : null,
    e.ask_emergency ? "an emergency contact" : null,
    e.custom_question ? "your own question" : null,
  ].filter(Boolean);

  return (
    <>
      <EditCard
        eventId={e.id}
        title={copy.host.rsvpByHeading}
        blurb={copy.host.rsvpByBlurb}
        fields={["rsvp_by"]}
        summary={<Sum label="Reply by" value={e.rsvp_by ? formatLongDate(e.rsvp_by) : null} />}
      >
        <Field id="rsvp_by" label="Reply by" value={e.rsvp_by} type="date" />
      </EditCard>

      <EditCard
        eventId={e.id}
        title={copy.host.asksHeading}
        blurb={copy.host.asksBlurb}
        fields={["ask_party_mode", "ask_names", "ask_dietary", "ask_accessibility", "ask_emergency", "custom_question"]}
        summary={
          <>
            <Sum label="It asks" value={asked.join(", ")} />
            {e.custom_question ? <Sum label="Your question" value={e.custom_question} /> : null}
          </>
        }
      >
        <Choice id="ask_party_mode" label="How many" value={e.ask_party_mode} options={[["split", "Children and adults separately"], ["single", "One number"]]} />
        <Switch id="ask_names" label="Names of everyone coming" value={e.ask_names} />
        <Switch id="ask_dietary" label="Food needs and allergies" value={e.ask_dietary} />
        <Switch id="ask_accessibility" label="Access needs (free text)" value={e.ask_accessibility} />
        <Switch id="ask_emergency" label="Emergency contact (drop-off parties)" value={e.ask_emergency} />
        <Field id="custom_question" label="One extra question (optional)" value={e.custom_question} />
      </EditCard>

      <EditCard
        eventId={e.id}
        title={copy.host.buttonsHeading}
        blurb={copy.host.buttonsBlurb}
        fields={["yes_label", "no_label"]}
        summary={
          <>
            <Sum label="Yes says" value={e.yes_label || copy.rsvp.yes} />
            <Sum label="No says" value={e.no_label || copy.rsvp.no} />
          </>
        }
      >
        <Field id="yes_label" label="The yes button" value={e.yes_label} hint={`Leave it empty for "${copy.rsvp.yes}"`} />
        <Field id="no_label" label="The no button" value={e.no_label} hint={`Leave it empty for "${copy.rsvp.no}"`} />
      </EditCard>
    </>
  );
}
