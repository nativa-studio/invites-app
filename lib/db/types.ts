// Shapes returned by the guest RPCs (event_public_json and guest_public_json in the migration)
// and the host tables. Kept by hand and small; regenerate from Supabase when the schema settles.
export type Palette = { sky: string; navy: string; yellow: string; cream: string; red: string; paper: string; forest: string };

export type RunsheetStop = { time: string | null; title: string; note: string | null; icon: string | null };
export type Update = { body: string; posted_at: string };

export type PublicEvent = {
  id: string;
  slug: string;
  type: string;
  title: string;
  host_line: string | null;
  intro: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  time_note: string | null;
  venue: string | null;
  address: string | null;
  parking: string | null;
  facilities: string[];
  facilities_note: string | null;
  public_transport: string | null;
  serve_preset: string | null;
  serve_text: string | null;
  good_to_know: string | null;
  what_to_bring: string | null;
  gift_stance: string;
  gift_note: string | null;
  gift_prefs_ok: string[];
  gift_prefs_avoid: string[];
  group_gift_enabled: boolean;
  accessibility_venue: string | null;
  parents_mode: "stay" | "drop_off" | "either";
  siblings_welcome: boolean;
  photo_sharing: "none" | "kids_off_social" | "ask" | "share";
  /** What the host wrote about photos. Replaced the preset list in migration 0021, which
   *  backfilled it from whichever preset each event had picked. Optional because a database
   *  without that migration has no column. */
  photos_note?: string | null;
  /** Free text, on the info booth. No default and no switch: the line exists when it is written. */
  drinks_note?: string | null;
  rsvp_by: string | null;
  save_the_date: boolean;
  group_link_enabled: boolean;
  look_mode: "artwork" | "upload";
  theme_id: string;
  /** The three after the first two are recovered and reachable by ?layout= only, for Marcia to
   *  look at. Nothing offers them to a host until she says which ones stay. */
  layout_id: "suite" | "lineup" | "peek" | "post" | "strip";
  ink: string;
  /** Which set of doodles the illustrated strip draws. Null falls back to the theme, which is
   *  every event made before the picker existed. Added in 0035, so an older database sends
   *  nothing and the strip falls back the same way. */
  strip_set?: string | null;
  palette: Palette | null;
  invite_image_path: string | null;
  details_strip: boolean;
  accent: string | null;
  share_title: string | null;
  share_description: string | null;
  yes_label: string | null;
  no_label: string | null;
  ask_party_mode: "single" | "split";
  ask_names: boolean;
  ask_dietary: boolean;
  dietary_chips: string[];
  /** Absent means on: a database without migration 0028 does not send the column, and an event
   *  that has never been thought about should ask about allergies rather than not. */
  ask_allergies?: boolean;
  ask_accessibility: boolean;
  ask_emergency: boolean;
  custom_question: string | null;
  custom_question_type: string | null;
  plate_enabled: boolean;
  /** Whether the plate draws its own block on the invite, or only its line in Good to know.
   *  Optional because a database without migration 0019 has no column; absent means on. */
  plate_block?: boolean;
  gift_block?: boolean;
  plate_mode: string;
  plate_host_note: string | null;
  host_phone: string | null;
  // The wording of the Questions block. Null falls back to the line built from host_line.
  // Optional because a database without migration 0007 does not send it.
  ask_note?: string | null;
  /** Who a guest texts, when that is not whoever signs the invite. Migration 0013. */
  ask_name?: string | null;
  /** The number that goes with that name. Null means the host's own mobile. Migration 0014. */
  ask_phone?: string | null;
  /** A second person to text about the event, with their own number. Migration 0025. One name
   *  and one number had hosts typing "Marcia or Tommy" into the name box against a single
   *  number, which is one phone for two people and a guest guessing whose it is. */
  ask_name_2?: string | null;
  ask_phone_2?: string | null;
  // The sign-off. Both optional because a database without migration 0008 does not send them,
  // and an absent show_signoff means on, the same way the other switches read.
  signoff_note?: string | null;
  show_signoff?: boolean | null;
  // The order the good to know lines are in. Optional: a database without migration 0009 does
  // not send it, and an empty list means the default order.
  know_order?: string[] | null;
  status: "draft" | "live" | "thanks" | "archived";
  /** Which parts of the invite the host wants shown. A section with nothing in it hides anyway. */
  show_details: boolean;
  show_runsheet: boolean;
  show_good_to_know: boolean;
  show_after: boolean;
  /** The order the parts below the cover appear in. Empty means the default. */
  section_order: string[];
  runsheet: RunsheetStop[];
  updates: Update[];
  /** The gifts block: the host's note, a wish list, and the group gift if there is one.
   *
   *  Optional and read as off when absent, the same way show_signoff is, so a database without
   *  migration 0041 draws an invite with no gifts block rather than a broken one. */
  show_gifts?: boolean | null;
  wishlist?: WishlistItem[] | null;
  /** What the group gift is, so the block can name it before anybody has replied. Where to send
   *  the money stays behind get_gift, which takes a token and answers only after a yes. */
  group_gift_what?: string | null;
};

/** One thing on the wish list. The host writes these; guests only read them. */
export type WishlistItem = { label: string; note?: string | null; url?: string | null };

export type GuestStatus = "pending" | "yes" | "no";

export type PublicGuest = {
  name: string;
  contact_name: string | null;
  status: GuestStatus;
  party_size: number | null;
  children: number | null;
  adults: number | null;
  expected_children: number | null;
  expected_adults: number | null;
  party_names: string[];
  dietary: string[];
  dietary_note: string | null;
  /** Free text, and never on the potluck board. Asked apart from the dietary chips because an
   *  allergy is a safety fact rather than a preference, and is not always about food. */
  allergies: string | null;
  /** First tap of Add to calendar, either button. The calendar file being taken, which is not
   *  quite the event being saved, so the host screen says "took the calendar file". */
  calendar_at?: string | null;
  accessibility_note: string | null;
  custom_answer: string | null;
  note: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  replied_at: string | null;
  dropped_out_at: string | null;
  see_you_soon_sent_at: string | null;
  thanks_sent_at: string | null;
  thanks_photo_path: string | null;
  source: "invited" | "group_link";
};

export type Invite = { event: PublicEvent; guest: PublicGuest; access_info: string | null };

// Host side rows (direct table reads under RLS).
export type GuestRow = {
  id: string;
  event_id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  /** A second person to text about the same guest, a mum and a dad. Optional on the type because
   *  a database without migration 0010 does not send them. */
  contact_name_2?: string | null;
  phone_2?: string | null;
  token: string;
  status: GuestStatus;
  /** How the host knows them: family, school, work. Never shown to a guest. */
  groups: string[];
  party_size: number | null;
  children: number | null;
  adults: number | null;
  expected_children: number | null;
  expected_adults: number | null;
  party_names: string[];
  dietary: string[];
  dietary_note: string | null;
  /** Free text, and never on the potluck board. Asked apart from the dietary chips because an
   *  allergy is a safety fact rather than a preference, and is not always about food. */
  allergies: string | null;
  /** First tap of Add to calendar, either button. The calendar file being taken, which is not
   *  quite the event being saved, so the host screen says "took the calendar file". */
  calendar_at?: string | null;
  accessibility_note: string | null;
  note: string | null;
  source: "invited" | "group_link";
  sent_at: string | null;
  opened_at: string | null;
  replied_at: string | null;
  /** The host answered for them, rather than the guest replying. Optional because a
   *  database without migration 0011 does not send it. */
  answered_by_host?: boolean | null;
  reminded_at: string | null;
  created_at: string;
};

export type EventRow = PublicEvent & {
  text_template: string | null;
  reminder_template: string | null;
  access_info: string | null;
  /** Joined from group_gift, not columns on events. They are here because the invite editor
   *  edits by pointing at a card, and the gift card on the invite is drawn from these two. The
   *  save action knows to send them back to the other table. Optional because most callers do
   *  not join it, and because a database without migration 0016 has no row to join. */
  gift_description?: string | null;
  gift_target?: number | null;
  /** The wish list with its ids and sort, for the editor. The guest's copy is on PublicEvent and
   *  has neither, because there is nothing for a guest to do to a row. */
  wishlist?: { id: string; label: string; note: string | null; url: string | null; sort: number }[] | null;
};
