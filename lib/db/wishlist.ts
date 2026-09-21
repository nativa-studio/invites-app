import "server-only";
import { createClient } from "@/lib/supabase/server";

// The wish list, as the host sees it: with ids, so a row can be edited or moved.
//
// Guests get theirs inside event_public_json, which carries the label, note and link and no id,
// because there is nothing for a guest to do to a row.
export type HostWishlistItem = { id: string; label: string; note: string | null; url: string | null; sort: number };

export async function loadWishlist(eventId: string): Promise<HostWishlistItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("id, label, note, url, sort")
    .eq("event_id", eventId)
    .order("sort")
    .order("created_at");
  return (data ?? []) as HostWishlistItem[];
}
