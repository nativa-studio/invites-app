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
import { GiftsCard } from "./GiftsCard";
import { UntilAnswered } from "./UntilAnswered";
import { HoldTheDate } from "./CalendarButtons";
import { PlateSlot } from "./PlateSlot";
import { LineupInvite } from "./LineupInvite";
import { StripInvite } from "./StripInvite";
// Recovered for Marcia to look at and point. Nothing is offered to a host until she does: these
// are reachable by ?layout= only, which is what the design picker already uses to flick through.
import { PeekInvite } from "./PeekInvite";
import { PostInvite } from "./PostInvite";

// Every layout, in one place. The personal link, the group link and the host's own preview all
// come through here, so what a host picks in Settings is exactly what a guest opens.
// `layout` overrides the saved choice, which is how the picker shows each one.
export function InviteBody({
  e: chosen, greeting, reply, layout, skipAnimation, token, curious, answered, pretend, plateCard, giftsCard, calendar,
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
  /** The host trying their own invite. Everything works and nothing is written, the same rule the
   *  reply and the plate board already follow there. */
  pretend?: boolean;
  /** The editor's own drawing of the plate card, which is not a guest's and answers to no reply.
   *  Left out everywhere else, where the card comes from the guest's answer. */
  plateCard?: React.ReactNode;
  /** The editor's own gifts card, which draws faded when the block is off so a host can tap it
   *  and find the switch. Left out everywhere else, where the block draws from the event. */
  giftsCard?: React.ReactNode;
  layout?: PublicEvent["layout_id"];
  skipAnimation?: boolean;
  /** Add to calendar, under the reply, for a guest who has not answered yet. Each caller builds
   *  its own pair because each has a different thing to point at: a guest's own token, a group
   *  slug, or the host's preview, which must not stamp anybody. */
  calendar?: { google: string | null; ics: string | null } | null;
}) {
  const id = layout ?? chosen.layout_id;
  const e = chosen;
  // Every layout draws a gifts block. It was three of five for a while, and that mattered a great
  // deal: the group gift's own card stands down because the block will say it, and so, since the
  // info booth stopped carrying a gifts line, does everything else. A layout with no block would
  // have had gifts vanish from the invite altogether rather than move.
  // The two announcements sit immediately before the reply: the last thing a guest reads before
  // deciding, which is where news about what the day will involve belongs. Computed once, because
  // the lineup layout takes its own reply and would otherwise quietly not have them.
  const announced = (
    <>
      {/* Wrapped, because `answered` is what the server knew when it drew the page and a guest
          answers after that. See UntilAnswered. */}
      <UntilAnswered>
        <AnnouncePlate e={e} answered={answered} />
        <AnnounceGift e={e} answered={answered} />
      </UntilAnswered>
      {reply}
      {/* Under the reply, never over it.
      
          The first attempt put these on the details card, which sits above the RSVP. Two large
          buttons between the date and Yes or No read as the thing to press: a guest taps Google
          Calendar, gets a calendar entry, and leaves believing they have answered. The host sees
          no reply and chases somebody who thinks they are coming.
          
          So it is after the decision, and it is worded as the thing to do when you cannot make
          one yet. It disappears the moment they answer, because the thank-you card carries the
          same buttons and says the settled version of it. */}
      <UntilAnswered>
        <HoldTheDate calendar={calendar} />
      </UntilAnswered>
    </>
  );
  // Drawn once and handed to whichever layout runs, so neither can quietly not have it.
  const about = <AboutApp token={token ?? null} curious={curious ?? false} pretend={pretend} />;
  if (id === "peek") return <PeekInvite event={e} greeting={greeting} reply={announced} gifts={giftsCard} />;
  if (id === "post") return <PostInvite event={e} greeting={greeting} addressee={greeting} reply={announced} gifts={giftsCard} skipAnimation={skipAnimation} />;
  if (id === "strip") {
    return (
      <StripInvite
        event={e}
        greeting={greeting}
        reply={announced}
        after={about}
        plate={plateCard ?? <PlateSlot />}
        gifts={giftsCard}
        skipAnimation={skipAnimation}
      />
    );
  }
  if (id === "lineup") {
    return (
      <LineupInvite
        event={e}
        greeting={greeting}
        reply={announced}
        after={about}
        plate={plateCard ?? <PlateSlot />}
        gifts={giftsCard}
        skipAnimation={skipAnimation}
      />
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
    // Bring a plate, on its own rather than under the reply. It draws nothing until the guest
    // reading it has said yes, and nothing at all outside a reply provider, which is the editor
    // drawing the invite with nobody answering. There the editor passes its own card instead.
    plate: plateCard ?? <PlateSlot />,
    gifts: giftsCard ?? (e.show_gifts ? <GiftsCard e={e} /> : null),
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
          {/* Inside the envelope, and last of everything in it. Outside, it sat under a sealed
              invite: a guest who had not opened their invitation yet was being told about the
              software that made it, which is the wrong thing at the wrong moment and gives away
              that there is a thing to scroll past before there is anything to scroll to. It is
              the very end, after the host's sign-off, because it is about the app and not the
              party and it should be the last thing anybody meets. */}
          {about}
        </Envelope>
      </div>
    </main>
  );
}

export const LAYOUTS = ["suite", "lineup", "peek", "post", "strip"] as const;

export function asLayout(v: string | undefined): PublicEvent["layout_id"] | undefined {
  return (LAYOUTS as readonly string[]).includes(v ?? "") ? (v as PublicEvent["layout_id"]) : undefined;
}

export const previewGreeting = copy.greetingGroup;
