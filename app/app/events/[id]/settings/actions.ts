"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalisePhone } from "@/lib/format";

export type SaveState = { saved?: boolean; error?: string };

const TEXT = ["title", "host_line", "intro", "time_note", "venue", "address", "access_info", "parking", "host_phone", "serve_text", "what_to_bring", "gift_note", "good_to_know", "plate_host_note", "text_template", "reminder_template", "share_title", "share_description", "custom_question", "accessibility_venue"] as const;
const DATES = ["date", "rsvp_by"] as const;
const TIMES = ["start_time", "end_time"] as const;
const CHOICES = { parents_mode: ["stay", "drop_off", "either"], photo_sharing: ["none", "kids_off_social", "ask", "share"], gift_stance: ["none", "optional", "wishlist", "books"], ask_party_mode: ["single", "split"], status: ["draft", "live", "thanks", "archived"] } as const;
const SWITCHES = ["siblings_welcome", "ask_names", "ask_dietary", "ask_accessibility", "ask_emergency", "plate_enabled", "group_link_enabled", "save_the_date", "group_gift_enabled"] as const;

export async function saveEvent(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = String(fd.get("event_id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Something went wrong." };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { error: "Please sign in again." };

  const patch: Record<string, unknown> = {};
  for (const k of TEXT) patch[k] = String(fd.get(k) ?? "").trim() || null;
  for (const k of DATES) { const v = String(fd.get(k) ?? "").trim(); patch[k] = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null; }
  for (const k of TIMES) { const v = String(fd.get(k) ?? "").trim(); patch[k] = /^\d{2}:\d{2}/.test(v) ? v : null; }
  for (const [k, allowed] of Object.entries(CHOICES)) { const v = String(fd.get(k) ?? ""); if ((allowed as readonly string[]).includes(v)) patch[k] = v; }
  for (const k of SWITCHES) patch[k] = fd.get(k) === "on";
  if (!patch.title) return { error: "The event needs a title." };
  patch.host_phone = patch.host_phone ? normalisePhone(String(patch.host_phone)) : null;

  const { error } = await supabase.from("events").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/app/events/${id}`);
  revalidatePath(`/app/events/${id}/settings`);
  return { saved: true };
}
