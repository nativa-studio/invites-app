import type { EventRow } from "@/lib/db/types";
import { Choice, Field, Switch } from "@/components/host/fields";
import { copy } from "@/lib/copy";
import { askLine, signoffMessage } from "@/lib/ask-line";
import { hostName } from "@/lib/format";
import { KnowEditor, KNOW_FIELDS } from "@/components/host/KnowEditor";
import { WishlistEditor } from "@/components/host/WishlistEditor";
import { GroupGiftFields } from "@/components/host/GroupGiftFields";
import { PLATE_MODES } from "@/lib/good-to-know";

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
    fields: ["date", "start_time", "end_time", "time_note", "venue", "address", "parking", "accessibility_venue", "access_info", "host_phone", "show_details"],
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
        <Field id="parking" label="Parking" value={e.parking} hint="e.g. Street parking, or the car park off Ashford Road" />
        <Field id="accessibility_venue" label="Getting around the place" value={e.accessibility_venue} hint="Steps, ramps, whether a pram fits" />
        {/* Only the guests who have said yes see this, so it holds the gate code rather than the
            street. It lives with the address because that is the question it answers. */}
        <Field id="access_info" label="How to get in (yes guests only)" value={e.access_info} rows={2} hint="Gate codes, which door, where the key is. Nobody sees this until they have said yes." />
        <Field id="host_phone" label="Your mobile" value={e.host_phone} type="tel" hint="The number the Questions block falls back to when you have not given it one of its own." />
      </>
    ),
  },
  {
    // The reply was a tab of its own. It is a part of the invite like any other, and it was the
    // one part you could tap on the preview and have nothing happen, because the list of parts
    // knew about it and this list did not.
    id: "reply",
    title: "The reply",
    blurb: "What a guest is asked when they say yes, and what the two buttons say. Changing a question after somebody has answered it cannot be undone for that guest, so it is worth settling before the links go out.",
    fields: ["rsvp_by", "ask_party_mode", "ask_names", "ask_allergies", "ask_dietary", "ask_accessibility", "ask_emergency", "custom_question", "yes_label", "no_label"],
    render: (e) => (
      <>
        <Field id="rsvp_by" label="Reply by" value={e.rsvp_by} type="date" />
        <Choice id="ask_party_mode" label="How many" value={e.ask_party_mode} options={[["split", "Children and adults separately"], ["single", "One number"]]} />
        <Switch id="ask_names" label="Names of everyone coming" value={e.ask_names} />
        {/* Two switches where there was one. Allergies are asked on their own because they are a
            safety answer rather than a preference, and because they are not always about food. */}
        <Switch id="ask_allergies" label="Allergies, food or contact" value={e.ask_allergies !== false} />
        <Switch id="ask_dietary" label="Other food needs" value={e.ask_dietary} />
        <Switch id="ask_accessibility" label="Access needs (free text)" value={e.ask_accessibility} />
        <Switch id="ask_emergency" label="Emergency contact (drop-off parties)" value={e.ask_emergency} />
        <Field id="custom_question" label="One extra question (optional)" value={e.custom_question} />
        <Field id="yes_label" label="The yes button" value={e.yes_label} hint={`Leave it empty for \u201c${copy.rsvp.yes}\u201d`} />
        <Field id="no_label" label="The no button" value={e.no_label} hint={`Leave it empty for \u201c${copy.rsvp.no}\u201d`} />
      </>
    ),
  },
  {
    id: "plate",
    title: "Bring a plate",
    blurb: "Whether you are asking guests to bring something, and what the invite says about it. The list of dishes itself is on the Potluck tab, because that is a job rather than wording.",
    show: { column: "plate_enabled", label: copy.host.potluckSwitch },
    fields: ["plate_block", "plate_mode", "plate_host_note"],
    render: (e) => (
      <>
        {/* Whether it gets a card at all, before what the card says. Off leaves the line in Good
            to know, which is the announcement, and takes away the panel, which is where a guest
            acts: a host collecting dishes by text wants the first and not the second. */}
        <Switch id="plate_block" label={copy.host.plateBlock} value={e.plate_block !== false} hint={copy.host.plateBlockHint} />
        <Choice id="plate_mode" label={copy.host.potluckMode} value={e.plate_mode} options={PLATE_MODES} hint={copy.host.potluckModeHint} />
        <Field id="plate_host_note" label={copy.host.potluckNote} value={e.plate_host_note} rows={2} hint={copy.host.potluckNoteHint} />
      </>
    ),
  },
  {
    id: "gifts",
    title: "Gifts",
    blurb: "A block of its own for gifts: what you want to say, a wish list, and the group gift if one is running. The wish list is a list of ideas, not a registry, so nothing is claimed and two people can still buy the same thing.",
    show: { column: "show_gifts", label: copy.host.giftsBlock },
    fields: ["gift_note", "group_gift_enabled", "gift_description", "group_gift_note", "gift_target"],
    render: (e) => (
      <>
        <Field id="gift_note" label={copy.sections.gifts} value={e.gift_note} rows={3} hint={copy.host.giftNoteFree} />
        {/* The wish list is rows in a table rather than a field on the event, so it saves itself
            as it is edited and does not ride in this panel's manifest. It is here rather than on
            a tab of its own because it is wording: a host writing what they want to say about
            gifts is in the same sitting as a host listing the things. */}
        <WishlistEditor eventId={e.id} items={e.wishlist ?? []} />
        {/* The group gift, switch and all. It had a drawer of its own, reached by tapping a card
            that only exists once the gift is on, with the switch on that same card: a setting a
            host could only change from a place they could only reach by having already changed
            it. Every field of it is here now, and both gift cards open this drawer. */}
        <GroupGiftFields e={e} />
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
    title: "Info booth",
    blurb: "What to bring, food, gifts, photos. Each line only appears when you have said something about it, and they come in the order you put them in.",
    show: { column: "show_good_to_know", label: "Show the info booth" },
    fields: [...KNOW_FIELDS, "show_good_to_know"],
    render: (e) => <KnowEditor e={e} />,
  },
  {
    id: "after",
    title: "Questions",
    blurb: "The last block on the invite: who a guest texts when they have a question. The name and the number are printed together, and tapping the number opens their messages with the party already named.",
    show: { column: "show_after", label: "Show the questions block" },
    fields: ["ask_note", "ask_name", "ask_phone", "ask_name_2", "ask_phone_2", "show_after"],
    render: (e) => (
      <>
        {/* Two boxes, because they were one and it was wrong. Who answers the phone is not always
            who signs the invite: a sign-off of "With love Gabe, Tommy and Ma" made the last line
            read "Text Gabe, Tommy and Ma" when the number belongs to one person. */}
        <Field
          id="ask_name"
          label="Who to text"
          value={e.ask_name}
          hint={`Empty means \u201c${hostName(e.host_line)}\u201d, the name from your sign-off.`}
        />
        <Field
          id="ask_phone"
          label="Their number"
          value={e.ask_phone}
          type="tel"
          hint={e.host_phone ? `Empty means ${e.host_phone}, your mobile from Details.` : "Empty means your mobile from Details, which you have not set yet."}
        />
        {/* A second person, optional, with their own number so a guest taps the one they want.
            One name and one number had hosts writing "Marcia or Tommy" against a single phone,
            which is two people and one number and a guest guessing whose it is. */}
        <Field
          id="ask_name_2"
          label="Somebody else to text (optional)"
          value={e.ask_name_2 ?? null}
          hint="A second person who can answer questions. They get their own line on the invite."
        />
        <Field
          id="ask_phone_2"
          label="Their number"
          value={e.ask_phone_2 ?? null}
          type="tel"
          hint="Needed for the second person to appear at all: a name with no number is not a way to reach anybody."
        />
        <Field
          id="ask_note"
          label="What the line says"
          value={e.ask_note}
          hint={`Empty means \u201c${askLine({ ask_note: null, ask_name: e.ask_name, host_line: e.host_line })}\u201d. Write your own and it replaces the whole line, so put the name in it yourself.`}
        />
      </>
    ),
  },
  {
    id: "signoff",
    title: "The sign-off",
    blurb: "The last thing on the invite: you, saying you are looking forward to it. Signed is who the invite is from. Who a guest rings about it is set under Questions, because those are two different people often enough to be worth asking twice.",
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
