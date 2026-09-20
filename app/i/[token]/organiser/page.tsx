import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/invite.css";
import { getGiftBoard } from "@/lib/guest/gift";
import { getInvite } from "@/lib/guest/invite";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { OrganiserBoard } from "@/components/invite/OrganiserBoard";

// The organiser's page. Their own token and nobody else's: get_gift_board hands back nothing for
// any other guest, so a link passed around or an address bar poked at looks exactly like a page
// that is not there. That is deliberate. A "you are not the organiser" message tells whoever is
// reading it that they found something real.
export const metadata: Metadata = { title: "Group gift", robots: { index: false, follow: false } };

export default async function Organiser({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [board, invite, site] = await Promise.all([getGiftBoard(token), getInvite(token), getSiteUrl()]);
  if (!board || !invite) notFound();

  const p = paletteFor(invite.event.palette, invite.event.theme_id);
  return (
    <main className="invite organiser" style={{ ...paletteVars(p), background: "var(--sky)" }}>
      <OrganiserBoard token={token} board={board} link={inviteLink(site, token)} eventTitle={invite.event.title} />
    </main>
  );
}
