import { ImageResponse } from "next/og";
import { getInviteCard } from "@/lib/guest/invite";
import { paletteFor } from "@/components/art/palette";
import { mascotFor, portraitFor } from "@/lib/artwork";
import { CARD_SIZE, envelopeCard, type CardVariant } from "@/components/share/envelope-card";
import { cardFonts } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/site-url";
import { artworkFor, asLayoutId, stockFor, type Stock } from "@/lib/layouts";

// The picture under a personal link: the same envelope, addressed to the guest it belongs to.
// Reads through a function that leaves no trace, because chat apps fetch this themselves and
// must never make a guest look as though they opened their invite.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const card = await getInviteCard(token);
  if (!card) return new Response("Not found", { status: 404 });
  const site = await getSiteUrl();
  const q = new URL(request.url).searchParams;
  const asked = q.get("style");
  const variant = (["front", "back", "posted", "opening", "sealed"] as const).find((v) => v === asked) as CardVariant | undefined;
  // ?layout= draws the card for a design the event is not saved on. The invite page has taken
  // that parameter since the design picker was built, and it flicks through the designs by
  // asking for each in turn; a card that ignored it would show the saved design beside a preview
  // of a different one.
  const layout = q.get("layout") ? asLayoutId(q.get("layout")) : card.layout_id;
  const stock = stockFor(layout);
  // The characters are the design's, the same one place the page reads them from, so a card
  // cannot go out carrying a different set from the invite it is a picture of.
  const art = artworkFor(layout);
  return new ImageResponse(
    envelopeCard({
      palette: paletteFor(card.palette, card.theme_id),
      addressee: card.addressee,
      title: card.share_title ?? card.title,
      artwork: cardArtwork(site, art, stock),
      // The square photograph, for the design that clips a polaroid to the card.
      portrait: cardPortrait(site, art),
      age: card.title.match(/turning (\d+)/i)?.[1] ?? null,
      stock,
      ink: card.ink,
      set: card.strip_set,
      themeId: card.theme_id,
      variant,
    }),
    { ...CARD_SIZE, fonts: cardFonts(), headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } },
  );
}

// The band of characters for the corner of the card. The same fallback the app uses, so an event
// that has not named its own artwork still gets the bundled set rather than an empty corner.
//
// Except on a design that has no characters in it. The illustrated strip is the one in the range
// with no photograph and no cast, which is the whole point of it, and the fallback was putting
// somebody else's cartoon characters on the corner of its envelope.
function cardArtwork(site: string, path: string | null | undefined, stock: Stock): string | null {
  if (stock === "ink") return null;
  const band = mascotFor(path);
  return band ? `${site}${band.src}` : null;
}

// One character, square, for the polaroid on the manila card. Null for a set that has no single
// character in it, and the card is built to draw without one.
function cardPortrait(site: string, path: string | null | undefined): string | null {
  const face = portraitFor(path);
  return face ? `${site}${face.src}` : null;
}
