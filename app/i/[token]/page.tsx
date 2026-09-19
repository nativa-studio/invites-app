import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvite, getInviteCard } from "@/lib/guest/invite";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { cardUrl, shareMetadata } from "@/lib/share-meta";
import { InvitePage } from "@/components/invite/InvitePage";
import { asLayout } from "@/components/invite/InviteBody";

type Params = { params: Promise<{ token: string }>; searchParams: Promise<{ open?: string; envelope?: string; layout?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) return { title: "Invite" };
  const e = invite.event;
  const site = await getSiteUrl();
  // The personal card reads through a function that arrived in migration 0003. Until a database
  // carries it, the preview falls back to the event's own card rather than showing nothing.
  const personal = await getInviteCard(token).then((c) => c !== null).catch(() => false);
  const image = cardUrl(personal ? `${site}/s/i/${token}/card.png` : `${site}/s/${e.slug}/card.png`, e.date);
  return shareMetadata(e, image);
}

export default async function Page({ params, searchParams }: Params) {
  const { token } = await params;
  const { open, envelope, layout } = await searchParams;
  const invite = await getInvite(token);
  if (!invite) notFound();
  const link = inviteLink(await getSiteUrl(), token);
  // ?layout= lets a host hold their own phone and flick through the designs before choosing one
  // in Settings. It changes nothing: the saved layout is whatever Settings says.
  return <InvitePage invite={invite} token={token} link={link} layout={asLayout(layout)} skipAnimation={open === "1" ? true : envelope === "1" ? false : undefined} />;
}
