import { ImageResponse } from "next/og";
import { getEventBySlug } from "@/lib/guest/invite";
import { paletteFor } from "@/components/art/palette";
import { CARD_SIZE, envelopeCard } from "@/components/share/envelope-card";
import { shortWhen } from "@/lib/format";
import { getSiteUrl } from "@/lib/site-url";

// The picture a chat app shows under the group link: a sealed envelope, addressed to nobody
// in particular because anyone may open this one.
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return new Response("Not found", { status: 404 });
  const site = await getSiteUrl();
  return new ImageResponse(
    envelopeCard({
      palette: paletteFor(e.palette, e.theme_id),
      title: e.share_title ?? e.title,
      when: shortWhen(e.date, e.start_time),
      artwork: e.invite_image_path ? `${site}${e.invite_image_path}` : null,
    }),
    { ...CARD_SIZE, headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } },
  );
}
