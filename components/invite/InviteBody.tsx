import React from "react";
import "@/app/invite.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";

import { paletteFor, paletteVars } from "@/components/art/palette";
import { mascotFor } from "@/lib/artwork";
import { orderedParts, type InvitePart } from "@/lib/invite-parts";
import { AskCard, CoverCard, DayCard, DetailsCard, KnowCard, SignoffCard, UpdatesCard } from "./Cards";
import { Envelope } from "./Envelope";
import { AboutApp } from "./AboutApp";
import { AnnounceGift, AnnouncePlate } from "./Announce";
import { LineupInvite } from "./LineupInvite";

// Every layout, in one place. The personal link, the group link and the host's own preview all
// come through here, so what a host picks in Settings is exactly what a guest opens.
// `layout` overrides the saved choice, which is how the picker shows each one.
export function InviteBody({
  e, greeting, reply, layout, skipAnimation, token, curious, answered,
}: {
  e: PublicEvent;
  greeting: string;
  reply: React.ReactNode;
  /** For the About this app line at the foot. Null on the group link before anybody has replied,
   *  where there is no guest row yet to record a thumbs up against. */
  token?: string | null;
  /** Whether this guest has replied. The announcements come off once they have. */
  answered?: boolean;
  curious?: boolean;
  layout?: PublicEvent["layout_id"];
  skipAnimation?: boolean;
}) {
  // The two announcements sit immediately before the reply: the last thing a guest reads before
  // deciding, which is where news about what the day will involve belongs. Computed once, because
  // the lineup layout takes its own reply and would otherwise quietly not have them.
  const announced = (
    <>
      <AnnouncePlate e={e} answered={answered} />
      <AnnounceGift e={e} answered={answered} />
      {reply}
    </>
  );
  const id = layout ?? e.layout_id;
  if (id === "lineup") {
    return (
      <>
        <LineupInvite
          event={e}
          greeting={greeting}
          reply={reply}
          skipAnimation={skipAnimation}
        />
        <AboutApp token={token ?? null} curious={curious ?? false} />
      </>
    );
  }

  const p = paletteFor(e.palette, e.theme_id);
  // Everything below the cover, in whatever order the host has put it in. The default is the one
  // the self-check asks for, each thing at the moment it is needed: what changed, then everything
  // needed to decide, then the reply while the deciding is still in hand, then the things that
  // only matter to someone who has already said yes.
  //
  // A part that is switched off draws nothing wherever it sits, so the order and the switches
  // stay independent of each other.
  const draw: Record<InvitePart, React.ReactNode> = {
    updates: <UpdatesCard e={e} />,
    details: e.show_details ? <DetailsCard e={e} /> : null,
    // The two announcements sit immediately before the reply, not in the reorderable list. They
    // are the last thing a guest reads before deciding, which is where news about what the day
    // will involve belongs, and they are not parts a host arranges: each is tied to a feature
    // switch rather than to a place on the page. Both draw nothing unless the host asked for one.
    reply: announced,
    day: e.show_runsheet ? <DayCard e={e} /> : null,
    know: e.show_good_to_know ? <KnowCard e={e} /> : null,
    after: e.show_after ? <AskCard e={e} /> : null,
    // Absent means on: a database without migration 0008 does not send the column, and the
    // sign-off is a part every event gets rather than one to opt into.
    signoff: e.show_signoff !== false ? <SignoffCard e={e} /> : null,
  };
  const below = (
    <>
      {orderedParts(e.section_order).map((part) => (
        <React.Fragment key={part}>{draw[part]}</React.Fragment>
      ))}
    </>
  );

  // The stationery suite: the cover arrives in an envelope that opens.
  //
  // Everything that is not the lineup is this, rather than only a row that says "suite". An event
  // saved under a layout that has since been deleted still opens, on the nearest thing to what it
  // showed, which is why there is no migration to go with the deletion.
  return (
    <main className="invite" style={paletteVars(p)}>
      <div className="wrap">
        <div className="greet">{greeting}</div>
        <Envelope
            cover={<CoverCard e={e} />}
          openLabel={copy.envelope.open}
          skipAnimation={skipAnimation}
          mascot={mascotFor(e.invite_image_path)}
        >
          {below}
        </Envelope>
        {/* Outside the envelope and last on the page. It is about the app, not the party, so it
            goes after everything the host wrote and nowhere near it. */}
        <AboutApp token={token ?? null} curious={curious ?? false} />
      </div>
    </main>
  );
}

export const LAYOUTS = ["suite", "lineup"] as const;

export function asLayout(v: string | undefined): PublicEvent["layout_id"] | undefined {
  return (LAYOUTS as readonly string[]).includes(v ?? "") ? (v as PublicEvent["layout_id"]) : undefined;
}

export const previewGreeting = copy.greetingGroup;
