"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { defaultsFor, EVENT_TYPES } from "@/lib/event-types";

export type NewEventState = { error?: string };

export async function createEvent(_prev: NewEventState, fd: FormData): Promise<NewEventState> {
  const title = String(fd.get("title") ?? "").trim();
  const type = String(fd.get("type") ?? "");
  if (!title) return { error: "Your event needs a title." };
  if (!EVENT_TYPES.some((t) => t.id === type)) return { error: "Please pick a kind of event." };

  const date = String(fd.get("date") ?? "").trim();
  const start = String(fd.get("start_time") ?? "").trim();
  const end = String(fd.get("end_time") ?? "").trim();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { error: "Please sign in again." };

  // One call creates the event and makes the signed-in host its owner.
  const { data: id, error } = await supabase.rpc("create_event_with_owner", {
    p: {
      title,
      type,
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      start_time: /^\d{2}:\d{2}/.test(start) ? start : null,
      end_time: /^\d{2}:\d{2}/.test(end) ? end : null,
      venue: String(fd.get("venue") ?? "").trim() || null,
      address: String(fd.get("address") ?? "").trim() || null,
      host_line: String(fd.get("host_line") ?? "").trim() || null,
      intro: String(fd.get("intro") ?? "").trim() || null,
    },
  });
  if (error || !id) return { error: error?.message ?? "That did not save. Please try again." };

  // The type's starting settings, applied once. The host owns them from here.
  const { error: settingsError } = await supabase.from("events").update(defaultsFor(type)).eq("id", id as string);
  if (settingsError) return { error: settingsError.message };

  revalidatePath("/app");
  redirect(`/app/events/${id as string}/settings?new=1`);
}
