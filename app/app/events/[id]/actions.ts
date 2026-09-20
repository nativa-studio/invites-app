"use server";
import { revalidatePath } from "next/cache";
import { revalidateEvent } from "@/lib/revalidate-event";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalisePhone } from "@/lib/format";
import { parseGuestList } from "@/lib/parse-guests";
import { orderedParts, PART_SWITCH } from "@/lib/invite-parts";
import { NOTE_KINDS } from "@/lib/good-to-know";

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
  revalidateEvent(eventId);
  return { added: name };
}

// Setting a guest's answer for them, or putting them back to the start.
//
// People say yes in the playground, by text, or at the school gate. The host is the only one who
// will ever put that in, and before this the only way was to open the guest's own link and answer
// as them, which stamps it as their reply.
//
// So it is stamped as the host's. The trail is the one part of this a host has to be able to
// trust, and a list that says "replied at 11:37" about a reply nobody made is worse than a list
// that says nothing.
export type GuestAnswer = "yes" | "no" | "sent" | "pending" | "unsent";

export async function setGuestAnswer(eventId: string, guestId: string, next: GuestAnswer) {
  const { supabase, uid } = await hostClient();
  const now = new Date().toISOString();
  // Sent by hand. The app marks a guest as sent when its own Text button is tapped, which misses
  // every guest texted from the host's own Messages, told at the school gate, or handed the link
  // on a bit of paper. Those guests read "Not sent" for ever, which is wrong on the row and wrong
  // in the count of who is still to be sent to.
  //
  // An existing stamp is kept rather than replaced, so tapping this on a guest who was already
  // sent to does not rewrite when it happened.
  let sent: Record<string, unknown> = {};
  if (next === "sent") {
    const { data } = await supabase.from("guests").select("sent_at").eq("id", guestId).eq("event_id", eventId).maybeSingle();
    sent = data?.sent_at ? {} : { sent_at: now, sent_by: uid };
  }

  const patch: Record<string, unknown> =
    next === "yes" || next === "no"
      ? { status: next, replied_at: now, answered_by_host: true }
      // Back to waiting keeps the record of sending. Back to not sent clears the lot, so the guest
      // reads exactly as they did the moment they were added.
      : next === "pending" || next === "sent"
        ? { status: "pending", replied_at: null, answered_by_host: false, ...sent }
        : { status: "pending", replied_at: null, answered_by_host: false, sent_at: null, sent_by: null, reminded_at: null, opened_at: null };

  let { error } = await supabase.from("guests").update(patch).eq("id", guestId).eq("event_id", eventId);
  // A database without migration 0011 has no column to stamp. Everything else still lands; the
  // trail just cannot say who answered.
  if (error && /answered_by_host/.test(error.message)) {
    delete patch.answered_by_host;
    ({ error } = await supabase.from("guests").update(patch).eq("id", guestId).eq("event_id", eventId));
  }
  if (error) throw new Error(error.message);
  revalidateEvent(eventId);
}

export type EditGuestState = { error?: string; saved?: boolean };

// Everything about a guest a host can change after adding them.
//
// A guest could not be edited at all before: a mistyped number meant removing them and starting
// again, which threw away their link, and anything they had already replied.
//
// The second contact is written only when the database has the columns. A host on a database
// without migration 0010 keeps every other change and is told which one did not land, rather than
// losing the lot to one unknown name.
export async function editGuest(_prev: EditGuestState, fd: FormData): Promise<EditGuestState> {
  const eventId = String(fd.get("event_id") ?? "");
  const guestId = String(fd.get("guest_id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { error: "A name is needed." };
  const { supabase } = await hostClient();

  const patch: Record<string, unknown> = {
    name,
    contact_name: String(fd.get("contact_name") ?? "").trim() || null,
    phone: normalisePhone(String(fd.get("phone") ?? "")) || null,
    contact_name_2: String(fd.get("contact_name_2") ?? "").trim() || null,
    phone_2: normalisePhone(String(fd.get("phone_2") ?? "")) || null,
    expected_children: count(fd, "expected_children"),
    expected_adults: count(fd, "expected_adults"),
    groups: groups(fd),
  };

  let { error } = await supabase.from("guests").update(patch).eq("id", guestId).eq("event_id", eventId);
  if (error && /contact_name_2|phone_2/.test(error.message)) {
    delete patch.contact_name_2;
    delete patch.phone_2;
    ({ error } = await supabase.from("guests").update(patch).eq("id", guestId).eq("event_id", eventId));
    if (!error) {
      revalidateEvent(eventId);
      return { error: "Saved, except the second person to text: the database needs migration 0010 first." };
    }
  }
  if (error) return { error: error.message };
  revalidateEvent(eventId);
  return { saved: true };
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
  revalidateEvent(eventId);
  return { added: rows.length, skipped: skipped > 0 ? skipped : undefined };
}

export async function markSent(eventId: string, guestId: string, kind: "sent" | "reminded") {
  const { supabase, uid } = await hostClient();
  const patch = kind === "sent" ? { sent_at: new Date().toISOString(), sent_by: uid } : { reminded_at: new Date().toISOString() };
  await supabase.from("guests").update(patch).eq("id", guestId).eq("event_id", eventId);
  revalidateEvent(eventId);
}

export async function removeGuest(eventId: string, guestId: string) {
  const { supabase } = await hostClient();
  await supabase.from("guests").delete().eq("id", guestId).eq("event_id", eventId);
  revalidateEvent(eventId);
}

export async function newLink(eventId: string, guestId: string) {
  const { supabase } = await hostClient();
  await supabase.rpc("regenerate_token", { p_guest: guestId });
  revalidateEvent(eventId);
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
  revalidateEvent(eventId);
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
  revalidateEvent(eventId);
}

// The order of the good to know lines. Same shape as the one above, and cleaned the same way.
//
// Only the kinds the event has anything to say about are ever sent, so an unknown one is a stale
// tab or a renamed kind rather than anything a host chose. Dropping it is right either way: the
// reader puts a missing kind back at its default position.
export async function setKnowOrder(eventId: string, order: string[]) {
  const { supabase } = await hostClient();
  const known = new Set<string>(NOTE_KINDS);
  const clean = [...new Set(order.filter((k) => known.has(k)))];
  const { error } = await supabase.from("events").update({ know_order: clean }).eq("id", eventId);
  // A database without migration 0009 has no column to write to. The order is the one thing lost,
  // and the invite still reads in its default order, so this is not worth throwing over.
  if (error && !/know_order/.test(error.message)) throw new Error(error.message);
  revalidateEvent(eventId);
}

// The group link, open or closed. It is a fact about the event rather than about any one guest,
// so it lives with the status behind the badge in the header.
export async function setGroupLink(eventId: string, open: boolean) {
  const { supabase } = await hostClient();
  await supabase.from("events").update({ group_link_enabled: open }).eq("id", eventId);
  revalidateEvent(eventId);
}

// Bring a plate, from the host's side.
//
// A host adds an item to ask for it, so it goes on unclaimed: "somebody bring a salad" is the
// point of putting it there. A guest adds one already carrying it. Removing is the host's for any
// item, and releasing hands a dish back to the list when the guest who had it drops out.
//
// These go through the host's own session, so row level security is the whole check: the policy
// on plate_items is the same members test every host table has.
export async function addPlateItem(eventId: string, label: string, tags: string[]) {
  const clean = label.trim().slice(0, 80);
  if (!clean) return;
  const { supabase, uid } = await hostClient();
  await supabase.from("plate_items").insert({ event_id: eventId, label: clean, tags, added_by_profile_id: uid });
  revalidateEvent(eventId);
}

// Renaming. A host who asked for "salad" and then learns somebody is bringing a whole spread
// should be able to say so without taking the item off a guest who has claimed it, which is what
// remove and re-ask would do.
export async function renamePlateItem(eventId: string, itemId: string, label: string) {
  const clean = label.trim().slice(0, 80);
  if (!clean) return;
  const { supabase } = await hostClient();
  await supabase.from("plate_items").update({ label: clean }).eq("id", itemId).eq("event_id", eventId);
  revalidateEvent(eventId);
}

export async function removePlateItem(eventId: string, itemId: string) {
  const { supabase } = await hostClient();
  await supabase.from("plate_items").delete().eq("id", itemId).eq("event_id", eventId);
  revalidateEvent(eventId);
}

export async function releasePlateItem(eventId: string, itemId: string) {
  const { supabase } = await hostClient();
  await supabase.from("plate_items").update({ claimed_by_guest_id: null }).eq("id", itemId).eq("event_id", eventId);
  revalidateEvent(eventId);
}

// Draft, live, saying thanks, put away. One tap from the badge in the header, which is where a
// host reads the state, so the place that tells you is the place that changes it.
const STATUSES = ["draft", "live", "thanks", "archived"];

export async function setEventStatus(eventId: string, status: string) {
  if (!STATUSES.includes(status)) return;
  const { supabase } = await hostClient();
  await supabase.from("events").update({ status }).eq("id", eventId);
  revalidateEvent(eventId);
  revalidatePath("/app");
}

// One part on or off, from the same list that reorders them, so a host is not sent to a tab of
// switches to hide something they are looking at.
export async function setSectionShown(eventId: string, column: string, shown: boolean) {
  const allowed = new Set(Object.values(PART_SWITCH));
  if (!allowed.has(column)) return;
  const { supabase } = await hostClient();
  await supabase.from("events").update({ [column]: shown }).eq("id", eventId);
  revalidateEvent(eventId);
}

// The group gift, from the host's side.
//
// The host owns three things about it: what it is, what it might come to, and who is running it.
// Everything else (where the money goes, the note to contributors, the updates) belongs to the
// organiser and is edited on their own page, because the organiser is usually not the host and
// the whole point of the feature is that the host does not have to run it.
//
// The row is created the moment the switch goes on, rather than the first time somebody saves
// something into it. A switch that is on with no row behind it leaves every guest looking at an
// empty block, which is the worst of both: the invite says there is a group gift and then has
// nothing to say about it.
export async function saveGift(eventId: string, v: {
  enabled: boolean;
  description: string | null;
  target: number | null;
  /** A guest's id, the string "me" for the host themselves, or null for nobody yet. */
  organiser: string | null;
}) {
  const { supabase, uid } = await hostClient();
  await supabase.from("events").update({ group_gift_enabled: v.enabled }).eq("id", eventId);
  if (v.enabled) {
    const me = v.organiser === "me";
    // Surprise is deliberately not listed. On an insert the column default decides (false, since
    // migration 0017), and on an update a column that is not listed is left alone, so saving the
    // description never quietly reverses somebody's surprise.
    await supabase.from("group_gift").upsert({
      event_id: eventId,
      description: v.description,
      target: v.target,
      organiser_guest_id: me ? null : v.organiser,
      organiser_profile_id: me ? uid : null,
    }, { onConflict: "event_id" });
  }
  revalidateEvent(eventId);
}

// The organiser's own side of it, when the organiser is the host.
//
// A guest organiser edits these on their token page, through the security definer functions. A
// host is already signed in and already owns the row, so they edit it here, and the two paths
// write the same columns. Guarded by the same rule either way: only the organiser may.
export async function saveGiftDetails(eventId: string, v: {
  payDetails: string | null;
  payReference: string | null;
  message: string | null;
  suggested: number | null;
  chipInBy: string | null;
  surprise: boolean;
}) {
  const { supabase, uid } = await hostClient();
  await supabase.from("group_gift").update({
    pay_details: v.payDetails,
    pay_reference: v.payReference,
    message: v.message,
    suggested_amount: v.suggested,
    chip_in_by: v.chipInBy,
    surprise: v.surprise,
  }).eq("event_id", eventId).eq("organiser_profile_id", uid);
  revalidateEvent(eventId);
}

// One line to everybody, replacing the last one. A status rather than a feed, same as the guest
// organiser's version: somebody opening their invite wants the state of the thing, not its history.
export async function postGiftUpdate(eventId: string, text: string) {
  const { supabase, uid } = await hostClient();
  await supabase.from("group_gift")
    .update({ latest_update: text.trim() || null })
    .eq("event_id", eventId).eq("organiser_profile_id", uid);
  revalidateEvent(eventId);
}
