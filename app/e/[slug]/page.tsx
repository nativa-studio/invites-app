import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/invite.css";
import { getEventBySlug } from "@/lib/guest/invite";
import { getSiteUrl } from "@/lib/site-url";
import { copy } from "@/lib/copy";
import { formatInviteDate } from "@/lib/format";
import { ClaimForm } from "@/components/invite/ClaimForm";
import { InviteBody, asLayout } from "@/components/invite/InviteBody";

type Params = { params: Promise<{ slug: string }> };
type PageParams = Params & { searchParams: Promise<{ layout?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Invite" };
  const title = e.share_title ?? e.title;
  const description = e.share_description ?? [formatInviteDate(e.date), e.intro].filter(Boolean).join(". ");
  const site = await getSiteUrl();
  const image = `${site}/s/${e.slug}/card.png?v=${encodeURIComponent(e.date ?? "")}`;
  return { title, description, openGraph: { title, description, type: "website", images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default async function GroupLink({ params, searchParams }: PageParams) {
  const { slug } = await params;
  const { layout } = await searchParams;
  const e = await getEventBySlug(slug);
  if (!e) notFound();
  const reply = e.group_link_enabled
    ? <ClaimForm slug={slug} />
    : <div className="pcard"><div className="label red">{copy.closed.title}</div><div className="para">{copy.closed.body}</div></div>;
  // The group link wears the same layout the host picked for the invite.
  return <InviteBody e={e} greeting={copy.greetingGroup} reply={reply} layout={asLayout(layout)} />;
}
