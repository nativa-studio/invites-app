import Link from "next/link";
import { formatLongDate, formatTimeRange } from "@/lib/format";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { EventNav } from "@/components/host/EventNav";
import { EventStatus } from "@/components/host/EventStatus";

// One event, three headers. The title, the date and the status stay put; the row underneath
// changes what you are working on. The status is a button: it is the one thing on this screen
// that is about the event as a whole rather than about the part you are looking at, and so is
// deleting it, so both live behind it.
export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const when = [formatLongDate(e.date), e.start_time ? formatTimeRange(e.start_time, e.end_time, e.time_note).toLowerCase() : ""].filter(Boolean).join(", ");
  return (
    <main className="host">
      <header className="top">
        <Link href="/app" className="brand">&lsaquo; Events</Link>
        <EventStatus
          id={id}
          title={e.title}
          status={e.status}
          groupLinkOpen={e.group_link_enabled !== false}
          counts={{ guests: guests.length, replies: guests.filter((g) => g.status !== "pending").length }}
        />
      </header>
      <div>
        <h1 className="h1">{e.title}</h1>
        {when && <p className="muted">{when}</p>}
      </div>
      <EventNav id={id} waiting={guests.filter((g) => g.status === "pending").length} />
      {children}
    </main>
  );
}
