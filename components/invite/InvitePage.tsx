import type { Invite } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { firstName } from "@/lib/format";
import { googleCalendarLink } from "@/lib/calendar";
import { InviteBody } from "./InviteBody";
import { Rsvp } from "./Rsvp";

// A personal link. The layout itself lives in InviteBody, which the group link and the host's
// preview use too, so the three can never drift apart. All this adds is who the guest is: their
// name on the envelope, their greeting, and their own reply form.
export function InvitePage({ invite, token, link, skipAnimation, layout }: { invite: Invite; token: string; link: string; skipAnimation?: boolean; layout?: Invite["event"]["layout_id"] }) {
  const { event: e, guest } = invite;
  // Someone who has already replied lands on the invite open, so changing an answer does not
  // mean sitting through the post again.
  const answered = guest.status !== "pending";
  return (
    <InviteBody
      e={e}
      greeting={copy.greeting(firstName(guest.name))}
      skipAnimation={skipAnimation ?? answered}
      layout={layout}
      reply={<Rsvp token={token} event={e} guest={guest} googleLink={googleCalendarLink(e, link)} icsLink={`/i/${token}/invite.ics`} />}
    />
  );
}
