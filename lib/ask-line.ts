import { copy } from "./copy";
import { formatMobile, hostName, normalisePhone } from "./format";
import type { PublicEvent } from "./db/types";

// What the last line of the invite says: how to reach the host.
//
// The host's own words when they have written any, otherwise the one built from their sign-off.
// It lives here rather than in the card because the host side needs it too, to show what an empty
// box will fall back to, and importing the card would drag the whole invite into that bundle.
export function askLine(e: Pick<PublicEvent, "ask_note" | "ask_name" | "host_line">): string {
  return e.ask_note?.trim() || copy.sections.askBody(askName(e));
}

// Who to text. Their own box first, then the sign-off, which is where this used to come from and
// is right for most events: the people throwing the party are usually the people to ring about
// it. It stopped being right the moment the sign-off read "With love Gabe, Tommy and Ma" while
// the phone belongs to Marcia, and the invite told guests to text Gabe, Tommy and Ma.
export function askName(e: Pick<PublicEvent, "ask_name" | "host_line">): string {
  return e.ask_name?.trim() || hostName(e.host_line);
}

// The number that goes with that name. Its own box first, then the host's mobile from Details,
// which is where this used to come from and is the same number most of the time. A party thrown
// by three people has one of them fielding the questions, and it is not always whoever set the
// event up.
export function askPhone(e: Pick<PublicEvent, "ask_phone" | "host_phone">): string | null {
  const raw = e.ask_phone?.trim() || e.host_phone?.trim() || "";
  return raw ? raw : null;
}

// What a tap on the number opens: the messaging app, with the message already started.
//
// "?&body=" rather than "?body=" or "&body=", because iOS wants the ampersand and Android wants
// the question mark, and that form is the one both read. The opener names the event, so a host
// fielding questions about three things at once knows which one this is before they read a word.
export function askSms(e: Pick<PublicEvent, "ask_phone" | "host_phone" | "ask_name" | "host_line" | "title">): string | null {
  const phone = askPhone(e);
  if (!phone) return null;
  return `sms:${normalisePhone(phone)}?&body=${encodeURIComponent(copy.sections.askSmsBody(e.title))}`;
}

/** The number as it is written, in threes. */
export function askPhoneText(e: Pick<PublicEvent, "ask_phone" | "host_phone">): string {
  const phone = askPhone(e);
  return phone ? formatMobile(phone) : "";
}

// The four words beside Questions at the end: what a guest holding a camera needs reminding of.
//
// The full wording lives in Good to know, where it is read while deciding what the day will be
// like. This is the parting version, and four words is all a reminder is. Photo sharing set to
// none means nothing to remind anyone of, so the cell is not drawn at all.
const PHOTO_LINES: Record<string, string> = {
  kids_off_social: copy.sections.photosNoSocial,
  ask: copy.sections.photosAsk,
  share: copy.sections.photosShare,
};

export function photoLine(e: Pick<PublicEvent, "photo_sharing">): string | null {
  return PHOTO_LINES[e.photo_sharing ?? ""] ?? null;
}

// The sign-off's message. Same shape as the line above: the host's words when they have written
// any, otherwise the built-in one. The name under it is the event's own sign-off, so a host who
// has already written "With love Gabe, Tommy and Ma" does not type it twice.
export function signoffMessage(e: Pick<PublicEvent, "signoff_note">): string {
  return e.signoff_note?.trim() || copy.sections.signoffDefault;
}
