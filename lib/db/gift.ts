import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type HostGift = {
  description: string | null;
  target: number | null;
  organiserGuestId: string | null;
  organiserProfileId: string | null;
  payDetails: string | null;
  payReference: string | null;
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
  count: number;
  total: number;
  /** True when the row policy is withholding the contributions from this host, because the gift
   *  is a surprise somebody else is running.
   *
   *  It is worked out from the gift row rather than from an empty result, which is the mistake
   *  this replaces: row level security filters rows, it does not raise, so a withheld board and
   *  a board nobody has chipped into both come back as an empty list and both counted as zero.
   *  The host can read the gift row itself, so surprise and who is organising are both knowable,
   *  and the screen can say which of the two it is looking at. */
  hidden: boolean;
};

// The gift, from the host's side. The host owns what it is, what it is worth aiming for and who
// is running it. Everything after that (where the money goes, the note, the updates) belongs to
// the organiser, who is usually not the host, and is edited on their own page.
export const loadGift = cache(async (eventId: string): Promise<HostGift | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("group_gift")
    .select("description, target, organiser_guest_id, organiser_profile_id, pay_details, pay_reference, message, suggested_amount, chip_in_by, latest_update, surprise, organiser:guests!group_gift_organiser_guest_id_fkey(name, token, phone)")
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
    payReference: data.pay_reference,
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
  const { data: claims } = await (await createClient()).auth.getClaims();
  const uid = claims?.claims?.sub ? String(claims.claims.sub) : null;
  const [{ data }, { data: gift }] = await Promise.all([
    supabase.from("gift_contributions").select("amount").eq("event_id", eventId),
    supabase.from("group_gift").select("surprise, organiser_profile_id").eq("event_id", eventId).maybeSingle(),
  ]);
  const hidden = Boolean(gift?.surprise) && gift?.organiser_profile_id !== uid;
  return {
    count: data?.length ?? 0,
    total: (data ?? []).reduce((n, r) => n + (Number(r.amount) || 0), 0),
    hidden,
  };
});

export type GiftWho = {
  contributors: { name: string; amount: number | null }[];
  /** Everyone who said yes and has not chipped in. The chase list, for a host running the gift. */
  waiting: { id: string; name: string; phone: string | null }[];
};

// Who has chipped in and who has not, for a host who is organising the gift themselves.
//
// The guest organiser gets this from gift_board, which runs as definer. A host reads the rows
// directly, which means row level security decides: on a surprise somebody else is running, the
// contributions come back empty. That is why the caller checks `hidden` from the tally first,
// rather than reading an empty list as nobody.
export const loadGiftWho = cache(async (eventId: string): Promise<GiftWho> => {
  const supabase = await createClient();
  const [{ data: given }, { data: guests }] = await Promise.all([
    supabase.from("gift_contributions").select("amount, guest:guests(name)").eq("event_id", eventId),
    supabase.from("guests").select("id, name, phone, status").eq("event_id", eventId).eq("status", "yes").order("name"),
  ]);
  const paid = new Set<string>();
  const contributors = (given ?? []).map((r) => {
    const g = r.guest as { name: string } | { name: string }[] | null;
    const who = Array.isArray(g) ? g[0] : g;
    if (who?.name) paid.add(who.name);
    return { name: who?.name ?? "Someone", amount: r.amount == null ? null : Number(r.amount) };
  });
  return {
    contributors,
    waiting: (guests ?? []).filter((g) => !paid.has(String(g.name)))
      .map((g) => ({ id: String(g.id), name: String(g.name), phone: g.phone as string | null })),
  };
});
