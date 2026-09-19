import type { Metadata } from "next";

// The link preview: what a chat app draws above a message when it is handed one of these links.
//
// One place, because there were three. The personal link, the group link and the host's own
// preview of it each built the same two strings their own way, and they had already drifted: an
// empty description fell back to the date and the opening line on the host's preview and to
// nothing at all on the page a guest would actually open. The app showed a host a preview their
// guests would never see.
type ShareFields = { title: string; share_title: string | null; share_description: string | null };

export function shareTitle(e: ShareFields): string {
  return e.share_title?.trim() || e.title;
}

// Blank means blank. The box is the truth: whatever is in it is what lands, and an empty one puts
// no line under the title rather than a line the host never wrote.
export function shareDescription(e: ShareFields): string {
  return (e.share_description ?? "").trim();
}

// The version on the card's own URL. A chat app caches the picture against that URL, so the only
// way to replace a preview it has already drawn is to ask for a different one.
//
// It used to be the event date on its own, which changes when the party moves and never when the
// drawing does. So when the stamp and the postmark came off the envelope, every chat that had
// already shown somebody the stamped one went on showing it. Bump CARD_REV whenever the card is
// redrawn, and every preview in every chat is fetched again.
const CARD_REV = 2;

export function cardUrl(path: string, date: string | null | undefined): string {
  return `${path}?v=${CARD_REV}-${encodeURIComponent(date ?? "")}`;
}

export function shareMetadata(e: ShareFields, image: string): Metadata {
  const title = shareTitle(e);
  const description = shareDescription(e);
  const og = { title, type: "website" as const, images: [{ url: image, width: 1200, height: 630 }] };
  const tw = { card: "summary_large_image" as const, title, images: [image] };
  // Left out of the tags altogether when it is empty, rather than sent as an empty string: a chat
  // app given description="" can draw a blank line where the text would have been.
  return description
    ? { title, description, openGraph: { ...og, description }, twitter: { ...tw, description } }
    : { title, openGraph: og, twitter: tw };
}
