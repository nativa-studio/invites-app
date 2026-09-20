import type { Invite } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { firstName } from "@/lib/format";
import { googleCalendarPath } from "@/lib/calendar";
import { InviteBody } from "./InviteBody";
import { ReplyProvider } from "./ReplyState";
import { Rsvp } from "./Rsvp";
import type { Plate } from "@/lib/guest/plate";
import type { Gift } from "@/lib/guest/gift";

// A personal link. The layout itself lives in InviteBody, which the group link and the host's
// preview use too, so the three can never drift apart. All this adds is who the guest is: their
// name on the envelope, their greeting, and their own reply form.
export function InvitePage({ invite, token, plate, gift, curious, skipAnimation, layout }: { invite: Invite; token: string; plate?: Plate | null; gift?: Gift | null; curious?: boolean; skipAnimation?: boolean; layout?: Invite["event"]["layout_id"] }) {
  const { event: e, guest } = invite;
  // The envelope plays every time, replied or not.
  //
  // It used to be skipped for anybody who had already answered, on the reasoning that changing
  // an answer should not mean sitting through the post again. In practice the opening is the
  // part people like: guests asked for it back, and the children want it over and over. Nobody
  // is held up by it either, since the envelope opens the moment it is tapped and does not wait
  // for its own timer.
  //
  // This replaced an Open it again line under the greeting, which did the same job from an
  // awkward place.
  const answered = guest.status !== "pending";
  return (
    // The answer, in one place, so the reply card and the plate part further down the page agree
    // about it without either owning the other.
    <ReplyProvider initial={{ token, status: guest.status, plate: plate ?? null, gift: gift ?? null }}>
    <InviteBody
      e={e}
      greeting={copy.greeting(firstName(guest.name))}
      skipAnimation={skipAnimation}
      layout={layout}
      token={token}
      answered={answered}
      curious={curious}
      // The board goes to the reply rather than to the layout. Where it belongs depends on the
      // answer, and the answer changes in the browser after this has rendered, so the reply is
      // the only thing that knows.
      reply={<Rsvp token={token} event={e} guest={guest} googleLink={googleCalendarPath(e, token)} icsLink={`/i/${token}/invite.ics`} plate={plate} gift={gift} />}
    />
    </ReplyProvider>
  );
}
