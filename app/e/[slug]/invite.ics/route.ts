import { icsFile } from "@/lib/calendar";
import { getEventBySlug } from "@/lib/guest/invite";
import { getSiteUrl } from "@/lib/site-url";

// The calendar file for the group link.
//
// No tap to record and nothing to stamp: a group link belongs to nobody, so there is no guest row
// to write an Add to calendar against. That is the whole difference between this and the personal
// one, and it is why this route is four lines shorter rather than a copy with a flag on it.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return new Response("Not found", { status: 404 });
  const ics = icsFile(e, `${await getSiteUrl()}/e/${slug}`);
  if (!ics) return new Response("No date yet", { status: 404 });
  return new Response(ics, {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${e.slug}.ics"` },
  });
}
