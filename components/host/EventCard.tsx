import Link from "next/link";
import { formatLongDate } from "@/lib/format";
import { InviteThumb } from "./InviteThumb";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { stockFor } from "@/lib/layouts";

export type EventSummary = {
  id: string;
  title: string;
  date: string | null;
  status: string | null;
  layout_id: string | null;
  invite_image_path: string | null;
  theme_id: string | null;
  palette: import("@/lib/db/types").Palette | null;
  intro: string | null;
  yes: number;
  pending: number;
  people: number;
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
  const beige = stockFor(e.layout_id ?? undefined) === "beige";
  return (
    <Link href={`/app/events/${e.id}`} className="evt-card">
      {/* The invite's own ground, on the tile rather than only inside the thumbnail. It was a grey
          box with the picture floating in it and a rule under it, which framed the invite twice:
          once with the app's furniture and again with its own. The paper an event is printed on
          is the fastest way to recognise it in a list, so it gets the whole area. */}
      <span className={`evt-art${beige ? " beige" : ""}`} style={paletteVars(p)}>
        <InviteThumb artwork={e.invite_image_path} title={e.title} intro={e.intro} themeId={e.theme_id} palette={e.palette} layout={e.layout_id ?? undefined} />
      </span>
      <span className="evt-body">
        <span className="evt-title">{e.title}</span>
        <span className="evt-when">{e.date ? formatLongDate(e.date) : "Date to come"}</span>
        <span className="evt-foot">
          <span className={`tag ${e.status === "live" ? "on" : ""}`}>{status}</span>
          <span className="evt-count">{countLine(e)}</span>
        </span>
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
