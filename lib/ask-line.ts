import { copy } from "./copy";
import { hostName } from "./format";
import type { PublicEvent } from "./db/types";

// What the last line of the invite says: how to reach the host.
//
// The host's own words when they have written any, otherwise the one built from their sign-off.
// It lives here rather than in the card because the host side needs it too, to show what an empty
// box will fall back to, and importing the card would drag the whole invite into that bundle.
export function askLine(e: Pick<PublicEvent, "ask_note" | "host_line">): string {
  return e.ask_note?.trim() || copy.sections.askBody(hostName(e.host_line));
}

// The sign-off's message. Same shape as the line above: the host's words when they have written
// any, otherwise the built-in one. The name under it is the event's own sign-off, so a host who
// has already written "With love Gabe, Tommy and Ma" does not type it twice.
export function signoffMessage(e: Pick<PublicEvent, "signoff_note">): string {
  return e.signoff_note?.trim() || copy.sections.signoffDefault;
}
