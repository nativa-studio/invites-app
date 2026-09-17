import { copy } from "@/lib/copy";

// Picking a type sets every switch to something sensible for that kind of event. The host owns
// them from then on: these are a starting point, not a rule.
export type EventTypeId = "kids_party" | "birthday" | "gathering" | "baby_shower" | "memorial";

export type EventDefaults = {
  id: EventTypeId;
  label: string;
  blurb: string;
  defaults: Record<string, unknown>;
};

export const EVENT_TYPES: EventDefaults[] = [
  {
    id: "kids_party",
    label: "Kids' party",
    blurb: "Children and adults counted separately, food needs on, parents and siblings settled up front.",
    defaults: {
      ask_party_mode: "split", ask_names: true, ask_dietary: true, ask_accessibility: false, ask_emergency: false,
      parents_mode: "either", siblings_welcome: false, gift_stance: "optional", photo_sharing: "kids_off_social",
      plate_enabled: false, theme_id: "birthday", ink: "terracotta",
    },
  },
  {
    id: "birthday",
    label: "Birthday, grown ups",
    blurb: "One number of people, no gifts by default, food needs on.",
    defaults: {
      ask_party_mode: "single", ask_names: true, ask_dietary: true, ask_accessibility: false, ask_emergency: false,
      parents_mode: "either", siblings_welcome: false, gift_stance: "none", photo_sharing: "none",
      plate_enabled: false, theme_id: "birthday", ink: "burgundy",
    },
  },
  {
    id: "gathering",
    label: "Get together",
    blurb: "A long lunch, a housewarming, a farewell. Bring a plate is on.",
    defaults: {
      ask_party_mode: "single", ask_names: true, ask_dietary: true, ask_accessibility: false, ask_emergency: false,
      parents_mode: "either", siblings_welcome: true, gift_stance: "none", photo_sharing: "none",
      plate_enabled: true, plate_host_note: copy.lines.plateFree, theme_id: "summer", ink: "olive",
    },
  },
  {
    id: "baby_shower",
    label: "Baby shower",
    blurb: "Bring a plate and a group gift on, one number of people.",
    defaults: {
      ask_party_mode: "single", ask_names: true, ask_dietary: true, ask_accessibility: false, ask_emergency: false,
      parents_mode: "either", siblings_welcome: true, gift_stance: "optional", photo_sharing: "ask",
      plate_enabled: true, plate_host_note: copy.lines.plateFree, group_gift_enabled: true, theme_id: "baby", ink: "sage",
    },
  },
  {
    id: "memorial",
    label: "Memorial",
    blurb: "Quiet wording, gentler reply buttons, no gifts, nothing asked that does not need asking.",
    defaults: {
      ask_party_mode: "single", ask_names: false, ask_dietary: false, ask_accessibility: true, ask_emergency: false,
      parents_mode: "either", siblings_welcome: true, gift_stance: "none", photo_sharing: "ask",
      plate_enabled: false, group_link_enabled: false, theme_id: "quiet", ink: "charcoal",
      yes_label: copy.rsvp.yesQuiet, no_label: copy.rsvp.noQuiet,
    },
  },
];

export function defaultsFor(id: string): Record<string, unknown> {
  return EVENT_TYPES.find((t) => t.id === id)?.defaults ?? {};
}
