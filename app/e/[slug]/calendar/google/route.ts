import { googleCalendarLink } from "@/lib/calendar";
import { getEventBySlug } from "@/lib/guest/invite";
import { getSiteUrl } from "@/lib/site-url";

// Google Calendar for the group link. Through our own address rather than straight to Google, so
// the invite link inside the calendar entry is built here from the event, the same way the
// personal one is, and a host who moves the party does not leave last week's details in somebody
// else's diary with our name on it.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return new Response("Not found", { status: 404 });
  const link = googleCalendarLink(e, `${await getSiteUrl()}/e/${slug}`);
  if (!link) return new Response("No date yet", { status: 404 });
  // 302, not 308: the forwarding address is built from the event and the event can change.
  return Response.redirect(link, 302);
}
