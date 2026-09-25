import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { looksLikeAPerson } from "@/lib/guest/is-a-person";
import { getInvite, getInviteCard, markOpened } from "@/lib/guest/invite";
import { getPlate } from "@/lib/guest/plate";
import { getGift } from "@/lib/guest/gift";
import { getWishes } from "@/lib/guest/wishes";
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
  const image = cardUrl(personal ? `${site}/s/i/${token}/card.png` : `${site}/s/${e.slug}/card.png`, e);
  return shareMetadata(e, image);
}

export default async function Page({ params, searchParams }: Params) {
  const { token } = await params;
  const { open, envelope, layout } = await searchParams;
  const invite = await getInvite(token);
  if (!invite) notFound();
  // Marked here and nowhere else. generateMetadata above also reads the invite, and that is the
  // call a chat app makes when it fetches the link for its preview card, so marking in there
  // stamped every guest as having opened theirs while the share sheet was still open.
  //
  // Even here it is only a person: a preview fetcher that follows through to the page itself, or
  // anything calling itself a bot, is not somebody reading their invitation. Same test the
  // calendar tap uses. Not awaited: a guest is here for their invite, not for our bookkeeping.
  if (looksLikeAPerson(await headers())) void markOpened(token);
  // The plate is only for a guest who is coming, since that is the only one who sees it. A host
  // who has never switched bring a plate on gets null back and no card.
  //
  // The gift is for everybody holding their own link, answered or not. It used to wait for a
  // reply, back when chipping in was a card shoved under the RSVP and asking for money in the
  // middle of deciding whether to come was the wrong question. It is a quiet line inside the
  // gifts block now, behind a button.
  //
  // Migration 0044 opened get_gift to a guest who has not answered. This line did not move with
  // it, so the database was handing out the block and the page was throwing it away: a pending
  // guest opened Group gift and read "How to chip in comes with your reply", which is the
  // sentence that shows when there is no gift here, and their tap on Chip in could not happen
  // because there was no button to tap. The gate moved and its twin stayed put, which is the
  // fault CLAUDE.md opens with.
  //
  // The wish list's crossings out come the same way. The labels are already on the invite, inside
  // the event's own payload; this is only which ideas have been taken and which of them by this
  // guest, which is the part that can change while they are looking at it.
  const [plate, gift, wishes, curious] = await Promise.all([
    invite.guest.status === "yes" ? getPlate(token) : null,
    getGift(token),
    getWishes(token),
    isCurious(token),
  ]);
  // ?layout= lets a host hold their own phone and flick through the designs before choosing one
  // in Settings. It changes nothing: the saved layout is whatever Settings says.
  return <InvitePage invite={invite} token={token} plate={plate} gift={gift} wishes={wishes} curious={curious} layout={asLayout(layout)} skipAnimation={open === "1" ? true : envelope === "1" ? false : undefined} />;
}
