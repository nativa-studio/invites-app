import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type HostPlateItem = {
  id: string;
  label: string;
  tags: string[];
  /** Who is bringing it, in full, because this is the host's own screen. */
  bringing: string | null;
  /** True when a guest put it on the list themselves, rather than the host asking for it. */
  fromGuest: boolean;
};

// The board, for the host. Their own screen, so names are whole names: a host chasing the salad
// needs to know which Sam. The guest's board gets first names and the allergy line gets neither.
export const loadPlate = cache(async (eventId: string): Promise<HostPlateItem[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plate_items")
    .select("id, label, tags, added_by_guest_id, claimed:guests!plate_items_claimed_by_guest_id_fkey(name)")
    .eq("event_id", eventId)
    .order("created_at");
  return (data ?? []).map((r) => {
    const claimed = r.claimed as { name: string } | { name: string }[] | null;
    const who = Array.isArray(claimed) ? claimed[0] : claimed;
    return {
      id: String(r.id),
      label: String(r.label),
      tags: (r.tags ?? []) as string[],
      bringing: who?.name ?? null,
      fromGuest: r.added_by_guest_id != null,
    };
  });
});
