import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/invite.css";
import { getEventBySlug } from "@/lib/guest/invite";
import { getSiteUrl } from "@/lib/site-url";
import { cardUrl, shareMetadata } from "@/lib/share-meta";
import { headers } from "next/headers";
import { copy } from "@/lib/copy";
import { groupLinkOpened, looksLikeAPerson } from "@/lib/guest/group-open";
import { GroupRsvp } from "@/components/invite/GroupRsvp";
import { InviteBody, asLayout } from "@/components/invite/InviteBody";
import { asArtwork } from "@/lib/artwork";
import { ReplyProvider } from "@/components/invite/ReplyState";
import { getWishesBySlug } from "@/lib/guest/wishes";

// The group link, drawn once. There are two ways to it now, the plain one and one per group, and
// they differ only in what the reply is labelled with, so they share everything else.
export async function groupLinkMetadata(slug: string): Promise<Metadata> {
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Invite" };
  const site = await getSiteUrl();
  const image = cardUrl(`${site}/s/${e.slug}/card.png`, e);
  return shareMetadata(e, image);
}

export async function renderGroupLink({ slug, group, layout, art }: { slug: string; group?: string; layout?: string; art?: string }) {
  const e = await getEventBySlug(slug);
  if (!e) notFound();
  // Somebody looked. Here rather than in generateMetadata, which is the half of this route that
  // chat apps call when they draw a preview card: stamping there would say every guest opened the
  // link the moment it was sent. looksLikeAPerson is the second guard, for the fetches that reach
  // the page itself, and it is the same one the calendar tap uses.
  //
  // Awaited, but it cannot throw and it cannot block: the function swallows its own failures.
  if (e.group_link_enabled && looksLikeAPerson(await headers())) await groupLinkOpened(slug, group);
  const reply = e.group_link_enabled
    ? <GroupRsvp slug={slug} group={group} event={e} />
    : <div className="pcard"><div className="label red">{copy.closed.title}</div><div className="para">{copy.closed.body}</div></div>;
  // Which ideas are already crossed off. Nobody here has a token, so none of them is theirs to
  // put back, but the list has to read the same through this door as through a personal link:
  // a guest who came by the group link and saw the scooter still going would buy it.
  const wishes = await getWishesBySlug(slug);
  // The group link wears the same layout the host picked for the invite.
  // Nobody has a token until they answer, and nobody has answered, so the provider starts empty.
  // The reply is the only thing that ever fills it, which is what makes the plate part appear.
  return (
    <ReplyProvider initial={{ token: "", status: "pending", plate: null, gift: null, wishes }}>
      <InviteBody
        e={e}
        greeting={copy.greetingGroup}
        reply={reply}
        layout={asLayout(layout)}
        artwork={asArtwork(art)}
        // Nobody's diary is anybody's row here, so these point at the slug rather than a token
        // and nothing is stamped. A group link belongs to no guest, which is the whole reason
        // the routes are separate.
        calendar={e.date ? { google: `/e/${slug}/calendar/google`, ics: `/e/${slug}/invite.ics` } : null}
      />
    </ReplyProvider>
  );
}
