import { isValidToken } from "@/lib/tokens";
import { callGuestRpc } from "./rpc";

// The About this app line at the foot of every invite, and the thumbs up behind it.
//
// Nothing here is about the party. It is the one place Bunting speaks for itself, to people who
// are meeting it because somebody they know used it, which is the only way anybody meets it yet.
export async function isCurious(token: string): Promise<boolean> {
  if (!isValidToken(token)) return false;
  // A database without migration 0023 has no function to call, which is the same as nobody
  // having pressed it.
  try {
    return await callGuestRpc<boolean>("is_app_curious", { p_token: token });
  } catch {
    return false;
  }
}

export const setCurious = (token: string, yes: boolean) =>
  callGuestRpc<boolean>(yes ? "app_curious" : "app_not_curious", { p_token: token });
