import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvite } from "@/lib/guest/invite";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { InvitePage } from "@/components/invite/InvitePage";
import { formatInviteDate } from "@/lib/format";

type Params = { params: Promise<{ token: string }>; searchParams: Promise<{ open?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) return { title: "Invite" };
  const e = invite.event;
  const title = e.share_title ?? e.title;
  const description = e.share_description ?? [formatInviteDate(e.date), e.intro].filter(Boolean).join(". ");
  return { title, description, openGraph: { title, description, type: "website" } };
}

export default async function Page({ params, searchParams }: Params) {
  const { token } = await params;
  const { open } = await searchParams;
  const invite = await getInvite(token);
  if (!invite) notFound();
  const link = inviteLink(await getSiteUrl(), token);
  return <InvitePage invite={invite} token={token} link={link} skipAnimation={open === "1"} />;
}
