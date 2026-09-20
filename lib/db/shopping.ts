import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ShoppingItem } from "@/lib/shopping";

export type { ShoppingItem };

// The list, in the host's own order, still-to-buy first.
//
// Two sorts, not one. The order a host drags things into is the order they walk a shop in, so it
// has to survive; but an item already in the trolley is not part of that walk any more, and
// leaving it in place means reading past six ticked lines to find the next thing to pick up. So
// the ticked ones fall to the bottom and keep their order among themselves, which is also the
// order they were bought in.
//
// `server-only` at the top is not decoration. This module reaches next/headers through the
// Supabase client, and the one thing in it that the list screen also needs lives in lib/shopping.ts
// for exactly that reason.
export const loadShopping = cache(async (eventId: string): Promise<ShoppingItem[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shopping_items")
    .select("id, label, quantity, note, got, sort, buyer:profiles!shopping_items_got_by_fkey(name)")
    .eq("event_id", eventId)
    .order("got")
    .order("sort")
    .order("created_at");
  return (data ?? []).map((r) => {
    const b = r.buyer as { name: string | null } | { name: string | null }[] | null;
    const who = Array.isArray(b) ? b[0] : b;
    return {
      id: String(r.id),
      label: String(r.label),
      quantity: r.quantity ? String(r.quantity) : null,
      note: r.note ? String(r.note) : null,
      got: Boolean(r.got),
      gotBy: who?.name ? String(who.name).trim().split(/\s+/)[0] : null,
      sort: Number(r.sort ?? 0),
    };
  });
});
