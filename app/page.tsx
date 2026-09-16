import EventCard from "@/components/EventCard";
import RsvpForm from "@/components/RsvpForm";
import { NotReady } from "@/components/Setup";
import { getEvent } from "@/lib/airtable";
import { googleCalendarLink } from "@/lib/messages";
import { getSiteUrl } from "@/lib/site-url";
import { accentStyle } from "@/lib/theme";

export const dynamic = "force-dynamic";

// The open invite: anyone with this link can reply, they just have to tell
// us who they are. Personal links (/i/<token>) skip that step.
export default async function OpenInvitePage() {
  let event = null;
  try {
    event = await getEvent();
  } catch (e) {
    console.error("getEvent failed", e);
    return <NotReady />;
  }
  if (!event) return <NotReady />;
  const siteUrl = await getSiteUrl();
  const calendarGoogle = googleCalendarLink(event, siteUrl);
  const calendarIcs = event.date ? "/invite.ics" : null;

  return (
    <main className="page" style={accentStyle(event.accentColour)}>
      <EventCard event={event} />
      <RsvpForm
        mode="open"
        hostName={event.hostName}
        allowPlusOnes={event.allowPlusOnes}
        maxPartySize={event.maxPartySize}
        calendarGoogle={calendarGoogle}
        calendarIcs={calendarIcs}
      />
      <footer className="foot">
        <span>With love from {event.hostName || "the host"}</span>
      </footer>
    </main>
  );
}
