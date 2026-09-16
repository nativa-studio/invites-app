import Link from "next/link";
import { notFound } from "next/navigation";
import EventCard from "@/components/EventCard";
import RsvpForm from "@/components/RsvpForm";
import { NotReady } from "@/components/Setup";
import { getEvent, getGuestByToken } from "@/lib/airtable";
import { firstName } from "@/lib/format";
import { googleCalendarLink } from "@/lib/messages";
import { getSiteUrl } from "@/lib/site-url";
import { accentStyle } from "@/lib/theme";
import { isValidToken } from "@/lib/tokens";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string }>;
};

// Personal invite: the token in the link identifies the guest, so the page
// greets them by name and they can answer with one tap.
export default async function PersonalInvitePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { done } = await searchParams;
  if (!isValidToken(token)) notFound();

  let event = null;
  let guest = null;
  try {
    [event, guest] = await Promise.all([getEvent(), getGuestByToken(token)]);
  } catch (e) {
    console.error("personal invite load failed", e);
    return <NotReady />;
  }
  if (!event) return <NotReady />;
  if (!guest) notFound();
  const siteUrl = await getSiteUrl();
  const calendarGoogle = googleCalendarLink(event, siteUrl);
  const calendarIcs = event.date ? "/invite.ics" : null;

  return (
    <main className="page" style={accentStyle(event.accentColour)}>
      <EventCard event={event} greeting={`Hi ${firstName(guest.name) || "there"}, you're invited`} />
      <RsvpForm
        mode="personal"
        token={token}
        hostName={event.hostName}
        allowPlusOnes={event.allowPlusOnes}
        maxPartySize={event.maxPartySize}
        calendarGoogle={calendarGoogle}
        calendarIcs={calendarIcs}
        initialStatus={guest.status}
        initialPartySize={guest.partySize}
        initialMessage={guest.message}
        justSubmitted={done === "1"}
      />
      <footer className="foot">
        <span>With love from {event.hostName || "the host"}</span>
        <span className="muted">
          Not {firstName(guest.name)}? <Link href="/">Reply here instead</Link>.
        </span>
      </footer>
    </main>
  );
}
