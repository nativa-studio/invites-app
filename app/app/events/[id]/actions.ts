"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalisePhone } from "@/lib/format";
import { parseGuestList } from "@/lib/parse-guests";
import { orderedParts, PART_SWITCH } from "@/lib/invite-parts";

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

// Moving a guest into a group, or out of one.
//
// A group could only be set as a guest was added, so a list pasted in one go was stuck with
// whatever it was given, and anyone who arrived through the plain link was stuck with nothing.
// One group per guest, the same as adding, because that is what the rest of the app assumes.
export async function setGuestGroup(eventId: string, guestId: string, group: string) {
  const { supabase } = await hostClient();
  const name = group.trim().slice(0, 40);
  await supabase
    .from("guests")
    .update({ groups: name ? [name] : [] })
    .eq("id", guestId)
    .eq("event_id", eventId);
  revalidatePath(`/app/events/${eventId}`);
}

export type DeleteState = { error?: string };

// Deleting an event, and meaning it.
//
// This is the privacy promise from the brief: allergy notes, children's names and phone numbers
// are gone when the host says so. Every dependent row goes with the event by cascade, and the
// storage objects under the event's prefix are removed too, since a file outliving its row is
// exactly the leak the promise is about.
//
// Only an owner can do it, which row level security enforces rather than this function. A co-host
// gets the same refusal a stranger would.
export async function deleteEvent(_prev: DeleteState, fd: FormData): Promise<DeleteState> {
  const id = String(fd.get("event_id") ?? "");
  const typed = String(fd.get("confirm") ?? "").trim();
  const title = String(fd.get("title") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Something went wrong. Please try again." };
  // Typing the name is the whole safeguard, so it is checked before anything is touched.
  if (typed.toLowerCase() !== title.toLowerCase()) {
    return { error: `Type the event's name exactly, "${title}", and it will be deleted.` };
  }

  const { supabase } = await hostClient();

  // Files first. If the row went first there would be nothing left to tell us which files belonged
  // to it. A bucket that refuses is not allowed to stop the deletion: an orphaned file is bad, an
  // event the host cannot get rid of is worse.
  const leftBehind: string[] = [];
  for (const bucket of ["invites", "photos", "share"]) {
    try {
      const { data: files } = await supabase.storage.from(bucket).list(id);
      const paths = (files ?? []).map((f) => `${id}/${f.name}`);
      if (paths.length) {
        const { error } = await supabase.storage.from(bucket).remove(paths);
        if (error) leftBehind.push(bucket);
      }
    } catch {
      leftBehind.push(bucket);
    }
  }

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    return { error: "That did not delete. Only the owner of an event can delete it." };
  }
  if (leftBehind.length) {
    // Said out loud rather than swallowed, because the host was promised the files were gone.
    console.warn(`event ${id} deleted, but files remain in: ${leftBehind.join(", ")}`);
  }
  revalidatePath("/app");
  redirect("/app");
}

// The order the parts of the invite come in.
//
// The whole list is written at once rather than one part's position, because a list cannot end up
// with two things claiming the same place. Anything unknown is dropped here as well as on read:
// the column is the host's arrangement, not a dumping ground.
export async function setSectionOrder(eventId: string, order: string[]) {
  const { supabase } = await hostClient();
  const clean = orderedParts(order);
  await supabase.from("events").update({ section_order: clean }).eq("id", eventId);
  revalidatePath(`/app/events/${eventId}`);
}

// One part on or off, from the same list that reorders them, so a host is not sent to a tab of
// switches to hide something they are looking at.
export async function setSectionShown(eventId: string, column: string, shown: boolean) {
  const allowed = new Set(Object.values(PART_SWITCH));
  if (!allowed.has(column)) return;
  const { supabase } = await hostClient();
  await supabase.from("events").update({ [column]: shown }).eq("id", eventId);
  revalidatePath(`/app/events/${eventId}`);
}
