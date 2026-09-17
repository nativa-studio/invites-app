import { ImageResponse } from "next/og";
import { getInviteCard } from "@/lib/guest/invite";
import { paletteFor } from "@/components/art/palette";
import { CARD_SIZE, envelopeCard } from "@/components/share/envelope-card";
import { shortWhen } from "@/lib/format";
import { getSiteUrl } from "@/lib/site-url";

// The picture under a personal link: the same envelope, addressed to the guest it belongs to.
// Reads through a function that leaves no trace, because chat apps fetch this themselves and
// must never make a guest look as though they opened their invite.
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const card = await getInviteCard(token);
  if (!card) return new Response("Not found", { status: 404 });
  const site = await getSiteUrl();
  return new ImageResponse(
    envelopeCard({
      palette: paletteFor(card.palette, card.theme_id),
      addressee: card.addressee,
      title: card.share_title ?? card.title,
      when: shortWhen(card.date, card.start_time),
      artwork: card.invite_image_path ? `${site}${card.invite_image_path}` : null,
    }),
    { ...CARD_SIZE, headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } },
  );
}
