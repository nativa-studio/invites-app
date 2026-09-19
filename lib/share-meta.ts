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
