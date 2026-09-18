import { ImageResponse } from "next/og";
import { getInviteCard } from "@/lib/guest/invite";
import { paletteFor } from "@/components/art/palette";
import { mascotFor } from "@/lib/artwork";
import { CARD_SIZE, envelopeCard, type CardVariant } from "@/components/share/envelope-card";
import { cardFonts } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/site-url";

// The picture under a personal link: the same envelope, addressed to the guest it belongs to.
// Reads through a function that leaves no trace, because chat apps fetch this themselves and
// must never make a guest look as though they opened their invite.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const card = await getInviteCard(token);
  if (!card) return new Response("Not found", { status: 404 });
  const site = await getSiteUrl();
  const asked = new URL(request.url).searchParams.get("style");
  const variant = (["posted", "opening", "sealed"] as const).find((v) => v === asked) as CardVariant | undefined;
  return new ImageResponse(
    envelopeCard({
      palette: paletteFor(card.palette, card.theme_id),
      addressee: card.addressee,
      title: card.share_title ?? card.title,
      artwork: cardArtwork(site, card.invite_image_path),
      age: card.title.match(/turning (\d+)/i)?.[1] ?? null,
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
