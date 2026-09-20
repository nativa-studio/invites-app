import { isValidToken } from "@/lib/tokens";
import { callGuestRpc } from "./rpc";

// Bring a plate, from the guest's side. Four calls, each taking the token and nothing else that
// could be swapped for somebody else's: no guest id, no event id, so a link is the whole of what
// a guest can reach. The board comes back from every one of them, so the page after a tap is the
// board as it actually is rather than the board as the tap hoped it would be. Two guests claiming
// the same dish at the same moment is the case this exists for.
export type PlateItem = {
  id: string;
  label: string;
  quantity: number | null;
  tags: string[];
  /** Whether somebody has it, never who. The name is not sent at all: see migration 0018. */
  claimed: boolean;
  mine: boolean;
  added_by_me: boolean;
};

export type Plate = {
  enabled: boolean;
  mode: string;
  host_note: string | null;
  items: PlateItem[];
};

export async function getPlate(token: string): Promise<Plate | null> {
  if (!isValidToken(token)) return null;
  // A database without migration 0015 has no function to call, and an invite whose host has not
  // switched the plate on has no board. Both mean the same thing here: no card on the invite.
  try {
    return await callGuestRpc<Plate | null>("get_plate", { p_token: token });
  } catch {
    return null;
  }
}

export const claimPlateItem = (token: string, item: string) =>
  callGuestRpc<Plate>("plate_claim", { p_token: token, p_item: item });

export const unclaimPlateItem = (token: string, item: string) =>
  callGuestRpc<Plate>("plate_unclaim", { p_token: token, p_item: item });

export const addPlateItem = (token: string, label: string, tags: string[]) =>
  callGuestRpc<Plate>("plate_add", { p_token: token, p_label: label, p_tags: tags });
