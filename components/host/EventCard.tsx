import Link from "next/link";
import { formatLongDate } from "@/lib/format";
import { InviteThumb } from "./InviteThumb";

export type EventSummary = {
  id: string;
  title: string;
  date: string | null;
  status: string | null;
  layout_id: string | null;
  invite_image_path: string | null;
  theme_id: string | null;
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
  return (
    <Link href={`/app/events/${e.id}`} className="evt-card">
      <span className="evt-art">
        <InviteThumb artwork={e.invite_image_path} title={e.title} themeId={e.theme_id} />
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
