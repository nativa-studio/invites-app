import "@/app/invite.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { hostName } from "@/lib/format";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { mascotFor } from "@/lib/artwork";
import { AfterCard, CoverCard, DayCard, DetailsCard, KnowCard, UpdatesCard } from "./Cards";
import { Envelope } from "./Envelope";
import { LineupInvite } from "./LineupInvite";
import { PeekInvite } from "./PeekInvite";
import { PostInvite } from "./PostInvite";

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
  if (id === "lineup") return <LineupInvite event={e} greeting={greeting} reply={reply} />;
  if (id === "peek") return <PeekInvite event={e} greeting={greeting} reply={reply} />;
  if (id === "post") {
    return <PostInvite event={e} greeting={greeting} addressee={addressee ?? copy.envelope.toYou} reply={reply} skipAnimation={skipAnimation} />;
  }

  const p = paletteFor(e.palette, e.theme_id);
  const host = hostName(e.host_line);
  const hostMobile = e.host_phone ? `sms:${e.host_phone.replace(/[^\d+]/g, "")}` : null;
  // Everything below the cover, in the order the moment asks for it. What changed, then the
  // details, which is everything needed to decide. Then the reply, while the deciding is still
  // in hand. Everything after it is for someone who has already said yes: the order of the day,
  // what to bring, what happens afterwards.
  const below = (
    <>
      <UpdatesCard e={e} />
      {e.show_details && <DetailsCard e={e} />}
      {reply}
      {e.show_runsheet && <DayCard e={e} />}
      {e.show_good_to_know && <KnowCard e={e} />}
      {e.show_after && <AfterCard />}
      <div className="foot">{hostMobile ? <a href={hostMobile}>{copy.sections.questions(host)}</a> : copy.sections.questions(host)}</div>
    </>
  );

  // The stationery suite: the cover arrives in an envelope that opens.
  if (id === "suite") {
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

  // The illustrated strip: the same cards, no envelope, straight down the page.
  return (
    <main className="invite no-envelope" style={paletteVars(p)}>
      <div className="wrap">
        <div className="greet">{greeting}</div>
        <div className="suite">
          <CoverCard e={e} />
          {below}
        </div>
      </div>
    </main>
  );
}

export const LAYOUTS = ["suite", "lineup", "peek", "post", "strip"] as const;

export function asLayout(v: string | undefined): PublicEvent["layout_id"] | undefined {
  return (LAYOUTS as readonly string[]).includes(v ?? "") ? (v as PublicEvent["layout_id"]) : undefined;
}

export const previewGreeting = copy.greetingGroup;
