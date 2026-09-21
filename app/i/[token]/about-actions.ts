"use server";
import { leaveFeedback, setCurious } from "@/lib/guest/about";
import { isValidToken } from "@/lib/tokens";

export type CuriousState = { token: string; curious: boolean; error?: boolean };

// One action, both directions. A thumbs up somebody cannot take back is not a choice, and the
// button says which way it is about to go, so the answer has to come back from the server rather
// than be assumed by the page.
//
// The token rides in the form, not in the state. It used to ride in the state, on the reasoning
// that this is the one control on the invite with nothing else to submit, and that was true until
// the group link started supplying a token after the page had been drawn: useActionState keeps
// the initial state it was given on the first render, so the token that arrived when somebody
// replied never reached this, and the hand up failed silently on exactly the page it had just
// been added to. Whether they are currently curious still comes from the state, because that is
// this action's own answer coming back.
export async function curiousAction(prev: CuriousState, fd: FormData): Promise<CuriousState> {
  const token = String(fd.get("token") ?? "") || prev.token;
  if (!isValidToken(token)) return { ...prev, error: true };
  try {
    await setCurious(token, !prev.curious);
    return { token, curious: !prev.curious };
  } catch {
    return { ...prev, token, error: true };
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
