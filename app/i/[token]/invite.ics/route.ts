import { icsFile } from "@/lib/calendar";
import { getInvite } from "@/lib/guest/invite";
import { calendarTapped, looksLikeAPerson } from "@/lib/guest/calendar-tap";
import { getSiteUrl, inviteLink } from "@/lib/site-url";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) return new Response("Not found", { status: 404 });
  const ics = icsFile(invite.event, inviteLink(await getSiteUrl(), token));
  if (!ics) return new Response("No date yet", { status: 404 });
  // Apple and Outlook take the file itself, so this route is the tap. Stamped after the file is
  // known to exist and never in a way that could stop it being served.
  //
  // Except from the host's preview, which says so with preview=1. Its buttons carry a real
  // guest's token, borrowed for the greeting, so a host trying their own invite would otherwise
  // stamp somebody else's row. A guest never sees that address, and a guest who somehow added it
  // would only be undercounted, which is the safe way round.
  const preview = new URL(request.url).searchParams.get("preview") === "1";
  if (!preview && looksLikeAPerson(request.headers)) await calendarTapped(token);
  return new Response(ics, {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${invite.event.slug}.ics"` },
  });
}
