import type { EventInfo } from "./airtable";
import { firstName, formatShortDate, normalisePhone } from "./format";

const DEFAULT_TEMPLATE =
  "Hi {name}! You're invited to {title}{date}. All the details are here, and you can RSVP with one tap: {link}";

export function textMessageFor(event: EventInfo, guestName: string, link: string): string {
  const template = event.textMessage.trim() || DEFAULT_TEMPLATE;
  const date = event.date ? ` on ${formatShortDate(event.date)}` : "";
  return template
    .replaceAll("{name}", firstName(guestName) || "there")
    .replaceAll("{title}", event.title)
    .replaceAll("{date}", date)
    .replaceAll("{link}", link);
}

// "sms:" links: iOS wants "&body=", Android wants "?body=". The "?&body="
// form is understood by both.
export function smsLink(phone: string, body: string): string {
  const number = normalisePhone(phone);
  return `sms:${number}?&body=${encodeURIComponent(body)}`;
}

export function googleCalendarLink(event: EventInfo, siteUrl: string): string | null {
  if (!event.date) return null;
  const start = event.date.replace(/-/g, "");
  const end = nextDayCompact(event.date);
  const details = [event.time, event.intro, event.details, `Invite: ${siteUrl}`].filter(Boolean).join("\n\n");
  const location = [event.venue, event.address].filter(Boolean).join(", ");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function nextDayCompact(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}
