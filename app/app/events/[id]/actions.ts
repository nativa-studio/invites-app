"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalisePhone } from "@/lib/format";
import { parseGuestList } from "@/lib/parse-guests";

async function hostClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) throw new Error("Not signed in");
  return { supabase, uid: String(data.claims.sub) };
}

export type AddGuestState = { error?: string; added?: string };

// A guest's groups are how a host sorts a long list: family, school, work. One per add is enough,
// since a host adds a group at a time. Empty means no group rather than a group with no name.
function groups(fd: FormData): string[] {
  const g = String(fd.get("group") ?? "").trim();
  return g ? [g] : [];
}

// A count the host typed, or nothing. Zero is a real answer, an empty box is not.
function count(fd: FormData, key: string): number | null {
  const raw = String(fd.get(key) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= 50 ? n : null;
}

export async function addGuest(_prev: AddGuestState, fd: FormData): Promise<AddGuestState> {
  const eventId = String(fd.get("event_id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const contact = String(fd.get("contact_name") ?? "").trim();
  const phone = normalisePhone(String(fd.get("phone") ?? ""));
  if (!name) return { error: "A name is needed." };
  const { supabase, uid } = await hostClient();
  const { error } = await supabase.from("guests").insert({
    event_id: eventId, name, contact_name: contact || null, phone: phone || null, added_by: uid,
    expected_children: count(fd, "expected_children"), expected_adults: count(fd, "expected_adults"),
    groups: groups(fd),
  });
  if (error) return { error: error.message };
  revalidatePath(`/app/events/${eventId}`);
  return { added: name };
}

export type AddManyState = { error?: string; added?: number; skipped?: number };

export async function addGuests(_prev: AddManyState, fd: FormData): Promise<AddManyState> {
  const eventId = String(fd.get("event_id") ?? "");
  const raw = String(fd.get("list") ?? "");
  const list = parseGuestList(raw);
  if (!list.length) return { error: "No names found. One guest per line." };
  // Say so when lines were dropped as repeats, rather than quietly adding fewer than were pasted.
  const skipped = raw.split(/\r?\n/).filter((l) => l.trim()).length - list.length;
  const { supabase, uid } = await hostClient();
  const shared = groups(fd);
  const rows = list.map((g) => ({
    event_id: eventId, name: g.name, phone: normalisePhone(g.phone) || null, added_by: uid,
    expected_children: g.children, expected_adults: g.adults, groups: shared,
  }));
  const { error } = await supabase.from("guests").insert(rows);
  if (error) return { error: error.message };
  revalidatePath(`/app/events/${eventId}`);
  return { added: rows.length, skipped: skipped > 0 ? skipped : undefined };
}

export async function markSent(eventId: string, guestId: string, kind: "sent" | "reminded") {
  const { supabase, uid } = await hostClient();
  const patch = kind === "sent" ? { sent_at: new Date().toISOString(), sent_by: uid } : { reminded_at: new Date().toISOString() };
  await supabase.from("guests").update(patch).eq("id", guestId).eq("event_id", eventId);
  revalidatePath(`/app/events/${eventId}`);
}

export async function removeGuest(eventId: string, guestId: string) {
  const { supabase } = await hostClient();
  await supabase.from("guests").delete().eq("id", guestId).eq("event_id", eventId);
  revalidatePath(`/app/events/${eventId}`);
}

export async function newLink(eventId: string, guestId: string) {
  const { supabase } = await hostClient();
  await supabase.rpc("regenerate_token", { p_guest: guestId });
  revalidatePath(`/app/events/${eventId}`);
}
