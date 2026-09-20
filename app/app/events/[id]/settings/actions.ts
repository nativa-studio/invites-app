"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidateEvent } from "@/lib/revalidate-event";
import { normalisePhone } from "@/lib/format";
import { copy } from "@/lib/copy";
import { GIFT_OPTIONS, PHOTO_OPTIONS, PLATE_MODES, optionValues } from "@/lib/good-to-know";

export type SaveState = { saved?: boolean; error?: string; note?: string };

// Artwork is stored as a path, and an empty choice clears it.
const TEXT = ["invite_image_path", "title", "host_line", "intro", "time_note", "venue", "address", "access_info", "parking", "host_phone", "serve_text", "what_to_bring", "drinks_note", "gift_note", "photos_note", "good_to_know", "plate_host_note", "text_template", "reminder_template", "share_title", "share_description", "custom_question", "accessibility_venue", "yes_label", "no_label", "ask_note", "ask_name", "ask_phone", "ask_name_2", "ask_phone_2", "signoff_note"] as const;
const DATES = ["date", "rsvp_by"] as const;
const TIMES = ["start_time", "end_time"] as const;
// Gifts and photos take their allowed values from the list the editor offers, rather than from a
// second copy written out here. The copies had already drifted once: Say nothing was added to the
// editor and not to this line, so choosing it saved nothing at all and said it had saved.
const CHOICES: Record<string, readonly string[]> = {
  type: ["kids_party", "birthday", "gathering", "baby_shower", "memorial"],
  layout_id: ["suite", "lineup", "strip"],
  parents_mode: ["stay", "drop_off", "either"],
  photo_sharing: optionValues(PHOTO_OPTIONS),
  gift_stance: optionValues(GIFT_OPTIONS),
  plate_mode: optionValues(PLATE_MODES),
  ask_party_mode: ["single", "split"],
  status: ["draft", "live", "thanks", "archived"],
};
const SWITCHES = ["siblings_welcome", "ask_names", "ask_allergies", "ask_dietary", "ask_accessibility", "ask_emergency", "plate_enabled", "plate_block", "gift_block", "group_link_enabled", "save_the_date", "group_gift_enabled", "show_details", "show_runsheet", "show_good_to_know", "show_after", "show_signoff"] as const;

// Every form says which fields it owns, in a hidden `_fields` input, and only those are written.
//
// This is not tidiness. A text field the browser did not send is indistinguishable from one the
// host cleared, and an unticked switch sends nothing at all. So a form showing one panel of a
// split settings screen would quietly save empty over every field it does not display. Reading
// the manifest instead means a panel can only ever touch its own fields, and a form that forgets
// to declare them saves nothing rather than the wrong thing.
function declared(fd: FormData): Set<string> {
  return new Set(String(fd.get("_fields") ?? "").split(",").map((s) => s.trim()).filter(Boolean));
}

// Postgres and PostgREST each have their own way of saying they do not know a column. Both name
// it, which is all we need.
function unknownColumn(message: string): string | null {
  return message.match(/column "([a-z_]+)".*does not exist/i)?.[1]
    ?? message.match(/could not find the '([a-z_]+)' column/i)?.[1]
    ?? null;
}

export async function saveEvent(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = String(fd.get("event_id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Something went wrong." };
  const own = declared(fd);
  if (own.size === 0) return { error: "Something went wrong." };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { error: "Please sign in again." };

  const patch: Record<string, unknown> = {};
  for (const k of TEXT) if (own.has(k)) patch[k] = String(fd.get(k) ?? "").trim() || null;
  for (const k of DATES) if (own.has(k)) { const v = String(fd.get(k) ?? "").trim(); patch[k] = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null; }
  for (const k of TIMES) if (own.has(k)) { const v = String(fd.get(k) ?? "").trim(); patch[k] = /^\d{2}:\d{2}/.test(v) ? v : null; }
  for (const [k, allowed] of Object.entries(CHOICES)) if (own.has(k)) { const v = String(fd.get(k) ?? ""); if ((allowed as readonly string[]).includes(v)) patch[k] = v; }
  for (const k of SWITCHES) if (own.has(k)) patch[k] = fd.get(k) === "on";
  if (own.has("title") && !patch.title) return { error: "The event needs a title." };
  if (own.has("host_phone")) patch.host_phone = patch.host_phone ? normalisePhone(String(patch.host_phone)) : null;
  if (own.has("ask_phone")) patch.ask_phone = patch.ask_phone ? normalisePhone(String(patch.ask_phone)) : null;
  if (own.has("ask_phone_2")) patch.ask_phone_2 = patch.ask_phone_2 ? normalisePhone(String(patch.ask_phone_2)) : null;
  // The gift's description and target are drawn on the invite and edited from the same drawer as
  // everything else, but they live on group_gift. They are pulled out of the patch here rather
  // than given a second save path, so the invite editor stays one form with one button and a host
  // never has to know which table a field sleeps in.
  const giftPatch: Record<string, unknown> = {};
  if (own.has("gift_description")) giftPatch.description = String(fd.get("gift_description") ?? "").trim() || null;
  if (own.has("gift_target")) {
    const raw = String(fd.get("gift_target") ?? "").replace(/[^0-9.]/g, "");
    giftPatch.target = raw === "" || Number.isNaN(Number(raw)) ? null : Number(raw);
  }
  if (Object.keys(patch).length === 0 && Object.keys(giftPatch).length === 0) return { error: "Nothing to save." };

  // A database that has not had the latest migration run against it is missing the newest columns.
  // Everything else in the same save should still go through, and the host should be told which
  // one thing did not and why, rather than losing the lot to one unknown name.
  //
  // This used to name the section switches specifically. Generalised after the second column
  // landed in the same position: the error already says which column it does not know, so read it
  // and drop that one. The loop is bounded by the size of the patch, and every pass either drops
  // a column or stops.
  const missed: string[] = [];
  let error: { message: string } | null = null;
  // Nothing for this table when the drawer only owns gift fields.
  for (; Object.keys(patch).length > 0;) {
    ({ error } = await supabase.from("events").update(patch).eq("id", id));
    if (!error) break;
    const unknown = unknownColumn(error.message);
    if (!unknown || !(unknown in patch)) break;
    delete patch[unknown];
    missed.push(unknown);
    if (Object.keys(patch).length === 0) return { error: copy.host.savedWithout(missed) };
  }
  if (error) return { error: error.message };

  // Upsert rather than update: switching the gift on from this drawer is the first moment a row
  // exists, and a host who typed what the present is should not have to type it again on the Gift
  // tab. Only the declared columns are sent, so the organiser's bank details, note and surprise
  // are left exactly as they were.
  if (Object.keys(giftPatch).length > 0) {
    const { error: giftError } = await supabase
      .from("group_gift")
      .upsert({ event_id: id, ...giftPatch }, { onConflict: "event_id" });
    // A database without migration 0016 has no table to write to. The rest of the save already
    // went through, so say which part did not rather than losing the lot.
    if (giftError) missed.push("gift_description");
  }

  const note = missed.length ? copy.host.savedWithout(missed) : undefined;
  revalidateEvent(id);
  return { saved: true, note };
}
