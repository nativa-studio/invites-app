import { isValidToken } from "@/lib/tokens";
import { callGuestRpc } from "./rpc";

// The wish list's crossings out, from the guest's side.
//
// The labels are on the invite already, inside the event's own payload. This is only the part
// that moves: which ideas have been taken, and which of those were taken by you. It is fetched
// beside the plate and the gift and carried the same way, on ReplyState, so the list and the
// answer come from one place.
export type WishState = {
  id: string;
  claimed: boolean;
  /** You crossed this one off, so you are the only person who can put it back. An idea a host
   *  crossed off belongs to nobody and is false here for everybody. */
  mine: boolean;
};

/** Null rather than an empty list when there is nothing to say, so a caller can tell "no list
 *  here" from "a list with nothing crossed off". */
export async function getWishes(token: string): Promise<WishState[] | null> {
  if (!isValidToken(token)) return null;
  try {
    return await callGuestRpc<WishState[] | null>("wish_state", { p_token: token });
  } catch {
    return null;
  }
}

/** The group link, which has no guest: crossed is still crossed, nothing is ever yours. */
export async function getWishesBySlug(slug: string): Promise<WishState[] | null> {
  try {
    return await callGuestRpc<WishState[] | null>("wish_state_slug", { p_slug: slug });
  } catch {
    return null;
  }
}

/** Crossing one off, or putting it back. What comes back is the state of the whole list, not of
 *  the tap: somebody else may have taken it while this page sat open, and the answer to that is
 *  to draw what is true rather than what was asked for. */
export const claimWish = (token: string, item: string, on: boolean) =>
  callGuestRpc<WishState[]>("wish_claim", { p_token: token, p_item: item, p_on: on });
