import { googleCalendarLink } from "@/lib/calendar";
import { getInvite } from "@/lib/guest/invite";
import { calendarTapped, looksLikeAPerson } from "@/lib/guest/calendar-tap";
import { getSiteUrl, inviteLink } from "@/lib/site-url";

// Google Calendar, by way of our own address.
//
// The button used to point straight at calendar.google.com, so a tap on it was invisible: the
// host could see that a guest had opened their invite and replied, and then nothing, at exactly
// the moment a guest does the thing that most predicts turning up.
//
// So it comes through here first, gets stamped, and is forwarded in the same breath. The guest
// notices nothing, and it works with JavaScript off, which an onClick handler would not.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) return new Response("Not found", { status: 404 });
  const link = googleCalendarLink(invite.event, inviteLink(await getSiteUrl(), token));
  if (!link) return new Response("No date yet", { status: 404 });
  if (looksLikeAPerson(request.headers)) await calendarTapped(token);
  // 302, not 308. The forwarding address is built from the event, so a host who moves the party
  // must not have last week's Google link cached in a guest's browser for ever.
  return Response.redirect(link, 302);
}
