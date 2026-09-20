import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type HostGift = {
  description: string | null;
  target: number | null;
  organiserGuestId: string | null;
  organiserProfileId: string | null;
  payDetails: string | null;
  message: string | null;
  suggestedAmount: number | null;
  chipInBy: string | null;
  latestUpdate: string | null;
  surprise: boolean;
  /** The organiser's whole name, for the host's own screen. Null until one is picked. */
  organiserName: string | null;
  organiserToken: string | null;
  organiserPhone: string | null;
};

export type GiftTally = {
  /** Null when the gift is a surprise the host is not running: the row policy withholds it, and
   *  the screen says so rather than showing a zero that would read as "nobody has chipped in". */
  count: number | null;
  total: number | null;
};

// The gift, from the host's side. The host owns what it is, what it is worth aiming for and who
// is running it. Everything after that (where the money goes, the note, the updates) belongs to
// the organiser, who is usually not the host, and is edited on their own page.
export const loadGift = cache(async (eventId: string): Promise<HostGift | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("group_gift")
    .select("description, target, organiser_guest_id, organiser_profile_id, pay_details, message, suggested_amount, chip_in_by, latest_update, surprise, organiser:guests!group_gift_organiser_guest_id_fkey(name, token, phone)")
    .eq("event_id", eventId)
    .maybeSingle();
  if (!data) return null;
  const o = data.organiser as { name: string; token: string; phone: string | null } | { name: string; token: string; phone: string | null }[] | null;
  const who = Array.isArray(o) ? o[0] : o;
  return {
    description: data.description,
    target: data.target,
    organiserGuestId: data.organiser_guest_id,
    organiserProfileId: data.organiser_profile_id,
    payDetails: data.pay_details,
    message: data.message,
    suggestedAmount: data.suggested_amount,
    chipInBy: data.chip_in_by,
    latestUpdate: data.latest_update,
    surprise: data.surprise,
    organiserName: who?.name ?? null,
    organiserToken: who?.token ?? null,
    organiserPhone: who?.phone ?? null,
  };
});

// How it is going, if the host is allowed to know.
//
// A surprise gift is usually a gift for one of the hosts, and the row policy from migration 0016
// withholds the contributions from every host who is not running it themselves. So an empty
// result here means one of two very different things, and the caller has to be able to tell them
// apart: the surprise flag says which, and a null count means withheld rather than zero.
export const loadGiftTally = cache(async (eventId: string): Promise<GiftTally> => {
  const supabase = await createClient();
  const { data } = await supabase.from("gift_contributions").select("amount").eq("event_id", eventId);
  if (!data) return { count: null, total: null };
  return {
    count: data.length,
    total: data.reduce((n, r) => n + (Number(r.amount) || 0), 0),
  };
});
