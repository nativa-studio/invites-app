import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/invite.css";
import { getEventBySlug } from "@/lib/guest/invite";
import { getSiteUrl } from "@/lib/site-url";
import { copy } from "@/lib/copy";
import { formatInviteDate } from "@/lib/format";
import { GroupRsvp } from "@/components/invite/GroupRsvp";
import { InviteBody, asLayout } from "@/components/invite/InviteBody";

// The group link, drawn once. There are two ways to it now, the plain one and one per group, and
// they differ only in what the reply is labelled with, so they share everything else.
export async function groupLinkMetadata(slug: string): Promise<Metadata> {
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Invite" };
  const title = e.share_title ?? e.title;
  const description = e.share_description ?? [formatInviteDate(e.date), e.intro].filter(Boolean).join(". ");
  const site = await getSiteUrl();
  const image = `${site}/s/${e.slug}/card.png?v=${encodeURIComponent(e.date ?? "")}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export async function renderGroupLink({ slug, group, layout }: { slug: string; group?: string; layout?: string }) {
  const e = await getEventBySlug(slug);
  if (!e) notFound();
  const reply = e.group_link_enabled
    ? <GroupRsvp slug={slug} group={group} event={e} />
    : <div className="pcard"><div className="label red">{copy.closed.title}</div><div className="para">{copy.closed.body}</div></div>;
  // The group link wears the same layout the host picked for the invite.
  return <InviteBody e={e} greeting={copy.greetingGroup} reply={reply} layout={asLayout(layout)} />;
}
