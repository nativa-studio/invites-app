"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalisePhone } from "@/lib/format";
import { copy } from "@/lib/copy";

export type SaveState = { saved?: boolean; error?: string; note?: string };

// Artwork is stored as a path, and an empty choice clears it.
const TEXT = ["invite_image_path", "title", "host_line", "intro", "time_note", "venue", "address", "access_info", "parking", "host_phone", "serve_text", "what_to_bring", "gift_note", "good_to_know", "plate_host_note", "text_template", "reminder_template", "share_title", "share_description", "custom_question", "accessibility_venue", "yes_label", "no_label"] as const;
const DATES = ["date", "rsvp_by"] as const;
const TIMES = ["start_time", "end_time"] as const;
const CHOICES = { layout_id: ["suite", "lineup"], parents_mode: ["stay", "drop_off", "either"], photo_sharing: ["none", "kids_off_social", "ask", "share"], gift_stance: ["none", "optional", "wishlist", "books"], ask_party_mode: ["single", "split"], status: ["draft", "live", "thanks", "archived"] } as const;
const SWITCHES = ["siblings_welcome", "ask_names", "ask_dietary", "ask_accessibility", "ask_emergency", "plate_enabled", "group_link_enabled", "save_the_date", "group_gift_enabled", "show_details", "show_runsheet", "show_good_to_know", "show_after"] as const;

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
  if (Object.keys(patch).length === 0) return { error: "Nothing to save." };

  let note: string | undefined;
  let { error } = await supabase.from("events").update(patch).eq("id", id);
  // The section switches are columns from migration 0004. A database without them yet should
  // still take every other change, and say plainly which part it could not.
  if (error && /column "show_\w+" .*does not exist/i.test(error.message)) {
    for (const k of Object.keys(patch)) if (k.startsWith("show_")) delete patch[k];
    if (Object.keys(patch).length === 0) return { error: copy.host.savedWithoutSections };
    ({ error } = await supabase.from("events").update(patch).eq("id", id));
    note = copy.host.savedWithoutSections;
  }
  if (error) return { error: error.message };
  for (const p of ["", "/look", "/details", "/guests", "/rsvp", "/invite"]) revalidatePath(`/app/events/${id}${p}`);
  return { saved: true, note };
}
