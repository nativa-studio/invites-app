"use server";
import { leaveFeedback, setCurious } from "@/lib/guest/about";
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

export type FeedbackState = { sent?: boolean; error?: boolean };

// The feedback box. One field, one button, and the message is gone from the page once it has
// landed, because a box still holding what you wrote looks like it did not send.
//
// An empty box is not an error, it is somebody who changed their mind, so it closes quietly.
export async function feedbackAction(_prev: FeedbackState, fd: FormData): Promise<FeedbackState> {
  const token = String(fd.get("token") ?? "");
  const body = String(fd.get("body") ?? "").trim();
  if (!isValidToken(token)) return { error: true };
  if (!body) return {};
  try {
    await leaveFeedback(token, body);
    return { sent: true };
  } catch {
    return { error: true };
  }
}
