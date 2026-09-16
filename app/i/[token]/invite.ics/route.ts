import { icsFile } from "@/lib/calendar";
import { getInvite } from "@/lib/guest/invite";
import { getSiteUrl, inviteLink } from "@/lib/site-url";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) return new Response("Not found", { status: 404 });
  const ics = icsFile(invite.event, inviteLink(await getSiteUrl(), token));
  if (!ics) return new Response("No date yet", { status: 404 });
  return new Response(ics, {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${invite.event.slug}.ics"` },
  });
}
