import { getEvent } from "@/lib/airtable";
import { nextDay } from "@/lib/format";
import { getSiteUrl } from "@/lib/site-url";

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

// All-day calendar entry for Apple Calendar and Outlook. The start time lives
// in the free-text "Time" field, so it goes in the description.
export async function GET() {
  const event = await getEvent().catch(() => null);
  if (!event?.date) return new Response("No event date", { status: 404 });
  const siteUrl = await getSiteUrl();

  const description = [event.time, event.intro, event.details, `Invite: ${siteUrl}`].filter(Boolean).join("\n\n");
  const location = [event.venue, event.address].filter(Boolean).join(", ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Birthday Invite//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@birthday-invite`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${event.date.replace(/-/g, "")}`,
    `DTEND;VALUE=DATE:${nextDay(event.date).replace(/-/g, "")}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(description)}`,
    location ? `LOCATION:${esc(location)}` : "",
    `URL:${siteUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="invite.ics"',
      "Cache-Control": "public, max-age=300",
    },
  });
}
