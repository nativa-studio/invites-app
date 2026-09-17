import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvite, getInviteCard } from "@/lib/guest/invite";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { InvitePage } from "@/components/invite/InvitePage";
import { formatInviteDate } from "@/lib/format";

type Params = { params: Promise<{ token: string }>; searchParams: Promise<{ open?: string; envelope?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) return { title: "Invite" };
  const e = invite.event;
  const title = e.share_title ?? e.title;
  const description = e.share_description ?? [formatInviteDate(e.date), e.intro].filter(Boolean).join(". ");
  const site = await getSiteUrl();
  // The personal card reads through a function that arrived in migration 0003. Until a database
  // carries it, the preview falls back to the event's own card rather than showing nothing.
  const personal = await getInviteCard(token).then((c) => c !== null).catch(() => false);
  const v = encodeURIComponent(e.date ?? "");
  const image = personal ? `${site}/s/i/${token}/card.png?v=${v}` : `${site}/s/${e.slug}/card.png?v=${v}`;
  return { title, description, openGraph: { title, description, type: "website", images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default async function Page({ params, searchParams }: Params) {
  const { token } = await params;
  const { open, envelope } = await searchParams;
  const invite = await getInvite(token);
  if (!invite) notFound();
  const link = inviteLink(await getSiteUrl(), token);
  return <InvitePage invite={invite} token={token} link={link} skipAnimation={open === "1" ? true : envelope === "1" ? false : undefined} />;
}
