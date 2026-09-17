import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { CoverCard, DetailsCard, DayCard, KnowCard } from "./Cards";
import { LineupInvite } from "./LineupInvite";
import { PeekInvite } from "./PeekInvite";

// The whole invite below the cover, in whichever layout the host picked. The group link and the
// host's own preview both come through here, so what a host previews is what a guest opens.
// `layout` overrides the saved choice, which is how the picker in settings shows each one.
export function InviteBody({
  e, greeting, reply, layout,
}: { e: PublicEvent; greeting: string; reply: React.ReactNode; layout?: PublicEvent["layout_id"] }) {
  const id = layout ?? e.layout_id;
  if (id === "lineup") return <LineupInvite event={e} greeting={greeting} reply={reply} />;
  if (id === "peek") return <PeekInvite event={e} greeting={greeting} reply={reply} />;
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

export const LAYOUTS = ["suite", "lineup", "peek", "strip"] as const;

export function asLayout(v: string | undefined): PublicEvent["layout_id"] | undefined {
  return (LAYOUTS as readonly string[]).includes(v ?? "") ? (v as PublicEvent["layout_id"]) : undefined;
}

export const previewGreeting = copy.greetingGroup;
