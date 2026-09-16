"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalisePhone } from "@/lib/format";

async function hostClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) throw new Error("Not signed in");
  return { supabase, uid: String(data.claims.sub) };
}

export type AddGuestState = { error?: string; added?: string };

export async function addGuest(_prev: AddGuestState, fd: FormData): Promise<AddGuestState> {
  const eventId = String(fd.get("event_id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const contact = String(fd.get("contact_name") ?? "").trim();
  const phone = normalisePhone(String(fd.get("phone") ?? ""));
  if (!name) return { error: "A name is needed." };
  const { supabase, uid } = await hostClient();
  const { error } = await supabase.from("guests").insert({ event_id: eventId, name, contact_name: contact || null, phone: phone || null, added_by: uid });
  if (error) return { error: error.message };
  revalidatePath(`/app/events/${eventId}`);
  return { added: name };
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
