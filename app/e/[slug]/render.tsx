import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/invite.css";
import { getEventBySlug } from "@/lib/guest/invite";
import { getSiteUrl } from "@/lib/site-url";
import { cardUrl, shareMetadata } from "@/lib/share-meta";
import { copy } from "@/lib/copy";
import { GroupRsvp } from "@/components/invite/GroupRsvp";
import { InviteBody, asLayout } from "@/components/invite/InviteBody";

// The group link, drawn once. There are two ways to it now, the plain one and one per group, and
// they differ only in what the reply is labelled with, so they share everything else.
export async function groupLinkMetadata(slug: string): Promise<Metadata> {
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Invite" };
  const site = await getSiteUrl();
  const image = cardUrl(`${site}/s/${e.slug}/card.png`, e.date);
  return shareMetadata(e, image);
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
