import Link from "next/link";
import { formatLongDate, formatTimeRange } from "@/lib/format";
import { loadEvent } from "@/lib/db/host";
import { EventNav } from "@/components/host/EventNav";

const STATUS: Record<string, string> = { draft: "Draft", live: "Live", thanks: "Saying thanks", archived: "Archived" };

// One event, five headers. The title, the date and the status stay put; the row underneath
// changes what you are working on.
export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await loadEvent(id);
  const when = [formatLongDate(e.date), e.start_time ? formatTimeRange(e.start_time, e.end_time, e.time_note).toLowerCase() : ""].filter(Boolean).join(", ");
  return (
    <main className="host">
      <header className="top">
        <Link href="/app" className="brand">&lsaquo; Events</Link>
        <span className="tag">{STATUS[e.status] ?? e.status}</span>
      </header>
      <div>
        <h1 className="h1">{e.title}</h1>
        {when && <p className="muted">{when}</p>}
      </div>
      <EventNav id={id} />
      {children}
    </main>
  );
}
