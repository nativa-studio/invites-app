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
  // The gift's description and target ride along, because the invite editor edits by pointing at
  // a card and the gift card is drawn from them. They live on group_gift rather than here, so the
  // join is left outer: an event with no gift row is the normal case, not an error.
  const { data } = await supabase
    .from("events")
    // The wish list rides along too, with its ids, because the invite editor edits by pointing at
    // a card and the gifts card is drawn from these rows. The guest's copy comes through
    // event_public_json instead and carries no ids: there is nothing for a guest to do to a row.
    .select("*, gift:group_gift(description, target), wishlist:wishlist_items(id, label, note, url, sort)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const g = (data as { gift?: { description: string | null; target: number | null } | { description: string | null; target: number | null }[] | null }).gift;
  const gift = Array.isArray(g) ? g[0] : g;
  const wl = (data as { wishlist?: { sort: number }[] | null }).wishlist ?? [];
  return {
    ...data,
    gift_description: gift?.description ?? null,
    gift_target: gift?.target ?? null,
    // PostgREST does not order an embedded table, so it is sorted here rather than trusted.
    wishlist: [...wl].sort((a, b) => a.sort - b.sort),
  } as EventRow;
});

export const loadGuests = cache(async (id: string): Promise<GuestRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("guests").select("*").eq("event_id", id).order("created_at", { ascending: true });
  return (data ?? []) as GuestRow[];
});
