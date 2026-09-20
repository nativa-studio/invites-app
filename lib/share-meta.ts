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
// Bump CARD_REV whenever the drawing itself changes, and every preview in every chat is fetched
// again. 5 is the one-ink envelope: a third stock, a stamp drawn in the event's own ink, and no
// borrowed characters on the design that has none.
const CARD_REV = 5;

/** Everything about an event that changes the picture. */
type CardLook = {
  date?: string | null;
  layout_id?: string | null;
  ink?: string | null;
  invite_image_path?: string | null;
  title?: string | null;
  share_title?: string | null;
};

// A short, stable hash of those, on the end of the URL.
//
// The version used to be CARD_REV and the date, and the date is the one thing on this list a host
// changes least often. Everything else moved the picture without moving the address: switch the
// design, pick a different ink, change the name on the front, and the chat app, and the Message
// tab, went on showing the old envelope. That became a real fault the moment a host could choose
// an ink, because the choice is invisible in the one place they look to check it.
//
// FNV-1a, because it has to give the same answer on the server and in the browser and be short
// enough to read in a URL. It is not a checksum of anything and nothing is verified against it.
function look(e: CardLook): string {
  let h = 2166136261;
  for (const part of [e.date, e.layout_id, e.ink, e.invite_image_path, e.share_title ?? e.title]) {
    const s = part ?? "";
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= 31; h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function cardUrl(path: string, e: CardLook): string {
  return `${path}?v=${CARD_REV}-${look(e)}`;
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
