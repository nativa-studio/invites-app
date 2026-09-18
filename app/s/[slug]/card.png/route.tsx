import { ImageResponse } from "next/og";
import { getEventBySlug } from "@/lib/guest/invite";
import { paletteFor } from "@/components/art/palette";
import { mascotFor } from "@/lib/artwork";
import { CARD_SIZE, envelopeCard, type CardVariant } from "@/components/share/envelope-card";
import { cardFonts } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/site-url";

// The picture a chat app shows under the group link: a sealed envelope, addressed to nobody
// in particular because anyone may open this one.
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return new Response("Not found", { status: 404 });
  const site = await getSiteUrl();
  const asked = new URL(request.url).searchParams.get("style");
  const variant = (["posted", "opening", "sealed"] as const).find((v) => v === asked) as CardVariant | undefined;
  return new ImageResponse(
    envelopeCard({
      palette: paletteFor(e.palette, e.theme_id),
      title: e.share_title ?? e.title,
      artwork: cardArtwork(site, e.invite_image_path),
      age: e.title.match(/turning (\d+)/i)?.[1] ?? null,
      variant,
    }),
    { ...CARD_SIZE, fonts: cardFonts(), headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } },
  );
}

// The band of characters for the corner of the card. The same fallback the app uses, so an event
// that has not named its own artwork still gets the bundled set rather than an empty corner.
function cardArtwork(site: string, path: string | null | undefined): string | null {
  const band = mascotFor(path);
  return band ? `${site}${band.src}` : null;
}
