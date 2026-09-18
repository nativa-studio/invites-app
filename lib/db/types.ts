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
  rsvp_by: string | null;
  save_the_date: boolean;
  group_link_enabled: boolean;
  look_mode: "artwork" | "upload";
  theme_id: string;
  layout_id: "suite" | "lineup";
  ink: string;
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
  ask_accessibility: boolean;
  ask_emergency: boolean;
  custom_question: string | null;
  custom_question_type: string | null;
  plate_enabled: boolean;
  plate_mode: string;
  plate_host_note: string | null;
  host_phone: string | null;
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
};

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
  accessibility_note: string | null;
  note: string | null;
  source: "invited" | "group_link";
  sent_at: string | null;
  opened_at: string | null;
  replied_at: string | null;
  reminded_at: string | null;
  created_at: string;
};

export type EventRow = PublicEvent & { text_template: string | null; reminder_template: string | null; access_info: string | null };
