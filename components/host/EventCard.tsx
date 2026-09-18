import Link from "next/link";
import Image from "next/image";
import { formatLongDate } from "@/lib/format";
import { coverFor } from "@/lib/artwork";
import { LayoutThumb } from "./LayoutThumb";

export type EventSummary = {
  id: string;
  title: string;
  date: string | null;
  status: string | null;
  layout_id: string | null;
  invite_image_path: string | null;
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

// One event, as a card you can recognise at a glance. The picture is the event's own artwork when
// it has some; without it, the layout's drawing, so the tile still says which invite this is
// rather than sitting empty. A tile is taller than it is wide because an invite is.
export function EventCard({ e }: { e: EventSummary }) {
  const cover = coverFor(e.invite_image_path);
  const status = STATUS[e.status ?? "draft"] ?? "Draft";
  return (
    <Link href={`/app/events/${e.id}`} className="evt-card">
      <span className="evt-art">
        {cover ? (
          <Image src={cover.src} alt="" width={cover.w} height={cover.h} sizes="200px" />
        ) : (
          <LayoutThumb id={e.layout_id ?? "suite"} />
        )}
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
