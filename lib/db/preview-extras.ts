import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Gift } from "@/lib/guest/gift";
import type { Plate } from "@/lib/guest/plate";

// The plate board and the gift block, for the host's preview.
//
// These used to be built here, from the host's own rows, because a guest reads them through
// functions that take a token and a preview has neither guest nor token. That meant the rules
// deciding what is visible existed twice, in two languages, in two files, and both of the day's
// data faults lived in the gap: the block switches were honoured in the guest functions and not
// in the copy, and the copy carried on sending the names of whoever had claimed each dish after
// the guest side stopped. Neither is visible to a typecheck. The two files agreed on every type
// and disagreed about the product.
//
// So there is no copy any more. preview_plate and preview_gift take an event id instead of a
// token, check the caller is a member of that event, and call the very builders the guest
// functions call. One set of rules, written once, in the place that already owned them.
//
// They run as the signed-in host, not as anon, because that is what the membership check reads.
const previewRpc = async <T>(name: string, eventId: string): Promise<T | null> => {
  const supabase = await createClient();
  // A database without migration 0027 has no function to call, and an event the signed-in person
  // does not belong to gets nothing. Both mean the same thing here: no card on the preview.
  const { data, error } = await supabase.rpc(name, { p_event: eventId });
  if (error) return null;
  return (data ?? null) as T | null;
};

export const previewPlate = (eventId: string) => previewRpc<Plate>("preview_plate", eventId);
export const previewGift = (eventId: string) => previewRpc<Gift>("preview_gift", eventId);
