import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvite, getInviteCard } from "@/lib/guest/invite";
import { getPlate } from "@/lib/guest/plate";
import { getGift } from "@/lib/guest/gift";
import { isCurious } from "@/lib/guest/about";
import { getSiteUrl } from "@/lib/site-url";
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
  // Only fetched for a guest who is coming, since that is the only one who sees it. A host who
  // has never switched bring a plate on gets null back and no card.
  const [plate, gift, curious] = await Promise.all([
    invite.guest.status === "yes" ? getPlate(token) : null,
    invite.guest.status === "pending" ? null : getGift(token),
    isCurious(token),
  ]);
  // ?layout= lets a host hold their own phone and flick through the designs before choosing one
  // in Settings. It changes nothing: the saved layout is whatever Settings says.
  return <InvitePage invite={invite} token={token} plate={plate} gift={gift} curious={curious} layout={asLayout(layout)} skipAnimation={open === "1" ? true : envelope === "1" ? false : undefined} />;
}
