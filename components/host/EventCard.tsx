import Link from "next/link";
import { formatLongDate } from "@/lib/format";
import { copy } from "@/lib/copy";
import { InviteThumb } from "./InviteThumb";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { stockFor } from "@/lib/layouts";
import { inkFor, paperFor } from "@/lib/strip-set";

export type EventSummary = {
  id: string;
  title: string;
  date: string | null;
  status: string | null;
  layout_id: string | null;
  invite_image_path: string | null;
  theme_id: string | null;
  ink: string | null;
  palette: import("@/lib/db/types").Palette | null;
  intro: string | null;
  yes: number;
  pending: number;
  people: number;
  /** Zero on an event that asks for one number rather than a split, where there is no such thing
   *  as a kid or an adult, only people. */
  kids: number;
  adults: number;
};

const STATUS: Record<string, string> = {
  draft: "Draft",
  live: "Live",
  thanks: "Thank yous",
  archived: "Archived",
};

// One event, as a card you can recognise at a glance: the invite itself, drawn the way an invite
// looks in the hand, then the words underneath.
export function EventCard({ e }: { e: EventSummary }) {
  const status = STATUS[e.status ?? "draft"] ?? "Draft";
  const p = paletteFor(e.palette, e.theme_id ?? "");
  // The panel behind the thumbnail is the paper the invite is printed on, so an event is
  // recognised in a list by its own stock. The strip has no fixed paper: it is mixed from the
  // event's ink, so its panel takes the same two variables the envelope inside it takes.
  const stock = stockFor(e.layout_id ?? undefined);
  return (
    <Link href={`/app/events/${e.id}`} className="evt-card">
      {/* The invite's own ground, on the tile rather than only inside the thumbnail. It was a grey
          box with the picture floating in it and a rule under it, which framed the invite twice:
          once with the app's furniture and again with its own. The paper an event is printed on
          is the fastest way to recognise it in a list, so it gets the whole area. */}
      <span
        className={`evt-art${stock === "beige" ? " beige" : ""}${stock === "ink" ? " ink" : ""}`}
        style={stock === "ink"
          ? ({ "--ink": inkFor(e.ink), "--paper": paperFor(e.ink) } as React.CSSProperties)
          : paletteVars(p)}
      >
        <InviteThumb title={e.title} intro={e.intro} themeId={e.theme_id} palette={e.palette} layout={e.layout_id ?? undefined} ink={e.ink} />
      </span>
      <span className="evt-body">
        <span className="evt-title">{e.title}</span>
        <span className="evt-when">{e.date ? formatLongDate(e.date) : "Date to come"}</span>
        <span className="evt-foot">
          <span className={`tag ${e.status === "live" ? "on" : ""}`}>{status}</span>
          <span className="evt-count">{countLine(e)}</span>
        </span>
        {/* The split, under the headline rather than crammed into it. A card is read at a glance
            and "10 kids, 16 adults, 26 coming, 23 to reply" is not a glance. */}
        {e.people > 0 && copy.host.split(e.kids, e.adults) && (
          <span className="evt-split">{copy.host.split(e.kids, e.adults)}</span>
        )}
      </span>
    </Link>
  );
}

// The one number a host looks for, and only when there is one. An event with nobody on it yet
// says so plainly instead of showing three zeroes.
function countLine(e: EventSummary): string {
  if (e.yes === 0 && e.pending === 0) return "No guests yet";
  if (e.yes === 0) return `${e.pending} to reply`;
  if (e.pending === 0) return `${e.people} coming`;
  return `${e.people} coming, ${e.pending} to reply`;
}
