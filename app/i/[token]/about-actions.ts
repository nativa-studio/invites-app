"use server";
import { setCurious } from "@/lib/guest/about";
import { isValidToken } from "@/lib/tokens";

export type CuriousState = { token: string; curious: boolean; error?: boolean };

// One action, both directions. A thumbs up somebody cannot take back is not a choice, and the
// button says which way it is about to go, so the answer has to come back from the server rather
// than be assumed by the page.
//
// The token rides in the state rather than the form, because this is the one control on the
// invite with nothing else to submit.
export async function curiousAction(prev: CuriousState): Promise<CuriousState> {
  if (!isValidToken(prev.token)) return { ...prev, error: true };
  try {
    await setCurious(prev.token, !prev.curious);
    return { token: prev.token, curious: !prev.curious };
  } catch {
    return { ...prev, error: true };
  }
}
