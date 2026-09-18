import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, GuestRow } from "./types";

// The event, loaded once per request however many times it is asked for. The chrome needs the
// title and the status, the panel under it needs the whole row, and without this those would be
// two round trips for the same thing.
export const loadEvent = cache(async (id: string): Promise<EventRow> => {
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return data as EventRow;
});

export const loadGuests = cache(async (id: string): Promise<GuestRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("guests").select("*").eq("event_id", id).order("created_at", { ascending: true });
  return (data ?? []) as GuestRow[];
});
