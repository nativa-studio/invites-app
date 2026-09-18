import React from "react";
import "@/app/invite.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";

import { paletteFor, paletteVars } from "@/components/art/palette";
import { mascotFor } from "@/lib/artwork";
import { orderedParts, type InvitePart } from "@/lib/invite-parts";
import { AskCard, CoverCard, DayCard, DetailsCard, KnowCard, UpdatesCard } from "./Cards";
import { Envelope } from "./Envelope";
import { LineupInvite } from "./LineupInvite";

// Every layout, in one place. The personal link, the group link and the host's own preview all
// come through here, so what a host picks in Settings is exactly what a guest opens.
// `layout` overrides the saved choice, which is how the picker shows each one.
// `addressee` is the name written on the envelope where a layout has one; the group link has
// none to borrow, so it is addressed to whoever opened it.
export function InviteBody({
  e, greeting, reply, layout, addressee, skipAnimation,
}: {
  e: PublicEvent;
  greeting: string;
  reply: React.ReactNode;
  layout?: PublicEvent["layout_id"];
  addressee?: string;
  skipAnimation?: boolean;
}) {
  const id = layout ?? e.layout_id;
  if (id === "lineup") {
    return (
      <LineupInvite
        event={e}
        greeting={greeting}
        reply={reply}
        addressee={addressee ?? copy.envelope.toYou}
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
    reply,
    day: e.show_runsheet ? <DayCard e={e} /> : null,
    know: e.show_good_to_know ? <KnowCard e={e} /> : null,
    after: e.show_after ? <AskCard e={e} /> : null,
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
          addressee={addressee ?? copy.envelope.toYou}
          cover={<CoverCard e={e} />}
          openLabel={copy.envelope.open}
          skipAnimation={skipAnimation}
          mascot={mascotFor(e.invite_image_path)}
        >
          {below}
        </Envelope>
      </div>
    </main>
  );
}

export const LAYOUTS = ["suite", "lineup"] as const;

export function asLayout(v: string | undefined): PublicEvent["layout_id"] | undefined {
  return (LAYOUTS as readonly string[]).includes(v ?? "") ? (v as PublicEvent["layout_id"]) : undefined;
}

export const previewGreeting = copy.greetingGroup;
