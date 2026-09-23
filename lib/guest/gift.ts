import { isValidToken } from "@/lib/tokens";
import { callGuestRpc } from "./rpc";

// The group gift, from the guest's side and the organiser's. Same rule as the plate: the token is
// the whole of what a guest can reach, and every call returns the block so the screen after a tap
// is what the database holds rather than what the tap hoped for.
//
// No money moves. The organiser types where to send it, guests read that and pay each other
// however they already do, and the app keeps the one thing a group chat never does: who has
// chipped in, so nobody is asked twice and nobody is quietly left out.
export type Gift = {
  enabled: boolean;
  description: string | null;
  /** The organiser's first name, the one the invite says is running it. */
  organiser: string | null;
  message: string | null;
  suggested_amount: number | null;
  chip_in_by: string | null;
  pay_details: string | null;
  pay_reference: string | null;
  latest_update: string | null;
  /** False until the organiser has said where the money goes. Nothing to ask anybody to do yet. */
  ready: boolean;
  chipped_in: boolean;
  my_amount: number | null;
  /** How many have chipped in. A count, never who, and never how much. */
  chipped_count: number;
  is_organiser: boolean;
};

/** What the organiser sees on top: the money, the names, and who still needs asking. */
export type GiftBoard = Gift & {
  target: number | null;
  surprise: boolean;
  total: number;
  contributors: { name: string; amount: number | null; at: string }[];
  waiting: { id: string; name: string; phone: string | null }[];
};

export async function getGift(token: string): Promise<Gift | null> {
  if (!isValidToken(token)) return null;
  // A database without migration 0016 has no function to call, and an event whose host has not
  // switched the gift on has no block. Both mean the same thing here: no card on the invite.
  try {
    return await callGuestRpc<Gift | null>("get_gift", { p_token: token });
  } catch {
    return null;
  }
}

/** Null for anyone but the organiser, so a guest changing the address bar learns nothing. */
export async function getGiftBoard(token: string): Promise<GiftBoard | null> {
  if (!isValidToken(token)) return null;
  try {
    return await callGuestRpc<GiftBoard | null>("get_gift_board", { p_token: token });
  } catch {
    return null;
  }
}

export const chipIn = (token: string, amount: number | null) =>
  callGuestRpc<Gift>("gift_chip_in", { p_token: token, p_amount: amount });

export const unchip = (token: string) =>
  callGuestRpc<Gift>("gift_unchip", { p_token: token });

export const saveGift = (token: string, v: {
  pay_details: string | null;
  pay_reference: string | null;
  message: string | null;
  suggested: number | null;
  chip_in_by: string | null;
  surprise: boolean;
}) =>
  callGuestRpc<GiftBoard>("gift_save", {
    p_token: token,
    p_pay_details: v.pay_details,
    p_pay_reference: v.pay_reference,
    p_message: v.message,
    p_suggested: v.suggested,
    p_chip_in_by: v.chip_in_by,
    p_surprise: v.surprise,
  });

export const postGiftUpdate = (token: string, text: string) =>
  callGuestRpc<GiftBoard>("gift_post_update", { p_token: token, p_text: text });

/** A guest opened one of the parts of the gifts block. Measuring only: it never throws and never
 *  blocks the page, the same rule the calendar tap and the group link open follow. */
export async function noteGiftTap(token: string, what: "ideas" | "group" | "chip"): Promise<void> {
  if (!isValidToken(token)) return;
  try {
    await callGuestRpc<null>("note_gift_tap", { p_token: token, p_what: what });
  } catch {
    // Measuring is not worth failing for.
  }
}
