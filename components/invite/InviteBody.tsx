import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { CoverCard, DetailsCard, DayCard, KnowCard } from "./Cards";
import { LineupInvite } from "./LineupInvite";
import { PeekInvite } from "./PeekInvite";
import { PostInvite } from "./PostInvite";

// The whole invite below the cover, in whichever layout the host picked. The group link and the
// host's own preview both come through here, so what a host previews is what a guest opens.
// `layout` overrides the saved choice, which is how the picker in settings shows each one.
// `addressee` is the name written on the envelope where a layout has one; the host's preview
// borrows a guest's, and the group link has none to borrow.
export function InviteBody({
  e, greeting, reply, layout, addressee,
}: { e: PublicEvent; greeting: string; reply: React.ReactNode; layout?: PublicEvent["layout_id"]; addressee?: string }) {
  const id = layout ?? e.layout_id;
  if (id === "lineup") return <LineupInvite event={e} greeting={greeting} reply={reply} />;
  if (id === "peek") return <PeekInvite event={e} greeting={greeting} reply={reply} />;
  if (id === "post") return <PostInvite event={e} greeting={greeting} addressee={addressee ?? copy.envelope.toYou} reply={reply} />;
  const p = paletteFor(e.palette, e.theme_id);
  return (
    <main className="invite no-envelope" style={paletteVars(p)}>
      <div className="wrap">
        <div className="greet">{greeting}</div>
        <div className="suite">
          <CoverCard e={e} />
          {e.show_details && <DetailsCard e={e} />}
          {e.show_runsheet && <DayCard e={e} />}
          {e.show_good_to_know && <KnowCard e={e} />}
          {reply}
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
