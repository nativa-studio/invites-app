import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";

const TZ = "Australia/Brisbane";

function stamp(date: string, time: string | null, fallbackHour: number): string {
  const t = time ?? `${String(fallbackHour).padStart(2, "0")}:00`;
  return `${date.replace(/-/g, "")}T${t.replace(/:/g, "").slice(0, 4)}00`;
}

export function calendarWindow(e: PublicEvent): { start: string; end: string } | null {
  if (!e.date) return null;
  const start = stamp(e.date, e.start_time, 10);
  const endTime = e.end_time ?? (e.start_time ? addHours(e.start_time, 3) : null);
  const end = stamp(e.date, endTime, 13);
  return { start, end };
}

function addHours(t: string, h: number): string {
  const [hh, mm] = t.split(":").map(Number);
  return `${String(Math.min(23, hh + h)).padStart(2, "0")}:${String(mm || 0).padStart(2, "0")}`;
}

// The words in the calendar entry itself, built once for both formats. Apple and Outlook take
// the .ics file and Google takes the URL, so these are two different serialisations of one
// description and there is no version of this where they should differ.
//
// The link is last but one, with the reason to tap it under it. A calendar entry is where a
// guest goes when a plan wobbles, months after the text message has scrolled away, and until
// now it told them where the party was without telling them they could still change their
// answer. The empty-link case is the host's preview, which has no guest and so no link.
function description(e: PublicEvent, link: string): string {
  return [e.intro, link && `Invite: ${link}`, link && copy.thanks.calendarNote]
    .filter(Boolean)
    .join("\n\n");
}

export function googleCalendarLink(e: PublicEvent, link: string): string | null {
  const w = calendarWindow(e);
  if (!w) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${w.start}/${w.end}`,
    ctz: TZ,
    details: description(e, link),
    location: [e.venue, e.address].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// The Google button's address on a guest's own invite: our redirect rather than Google itself,
// so a tap can be counted. Null when the event has no date, exactly like the link it forwards to,
// so a caller cannot end up drawing a button that leads to a 404.
//
// The host's preview does not use this. Its buttons carry a real guest's token, borrowed for the
// greeting, so a host trying their own invite would otherwise stamp that guest as having added
// the party to their calendar.
export function googleCalendarPath(e: PublicEvent, token: string): string | null {
  return calendarWindow(e) ? `/i/${token}/calendar/google` : null;
}

export function icsFile(e: PublicEvent, link: string): string | null {
  const w = calendarWindow(e);
  if (!w) return null;
  // Line breaks first, and both kinds of them. A stray carriage return was surviving into the
  // middle of a DESCRIPTION value, because the escaper only knew about \n: Marcia's intro is typed
  // in a textarea, which sends CRLF, so "A Pokemon pool party!\r\n" came out as a real CR byte
  // inside the line. CRLF is what ends a line in an ics file, so that is a parser being asked to
  // read the rest of the description as a new property.
  const esc = (s: string) =>
    s.replace(/\r\n?/g, "\n")
      .replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bunting//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@bunting`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=${TZ}:${w.start}`,
    `DTEND;TZID=${TZ}:${w.end}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(description(e, link))}`,
    `LOCATION:${esc([e.venue, e.address].filter(Boolean).join(", "))}`,
    `URL:${link}`,
    "END:VEVENT", "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
