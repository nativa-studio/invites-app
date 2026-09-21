import Link from "next/link";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { EventNav } from "@/components/host/EventNav";
import { EventStatus } from "@/components/host/EventStatus";

// One event, under a bar that does not move.
//
// The header is sticky and it carries two things: where you are (Events / this event) and what
// state the event is in. Both are true on every tab, and the status is the one control on the
// screen that is about the event as a whole rather than about the part you are looking at, so it
// sits up here rather than being repeated on the screens that happen to care about it.
//
// The date came off. It was a line of its own under a 26px title, which is a third of a phone
// screen spent restating the one thing a host already knows, on every tab, above the thing they
// came for. It is on the invite, on the Overview and in the guest's own calendar, and this bar is
// for finding your way rather than for reading.
export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests] = await Promise.all([loadEvent(id), loadGuests(id)]);
  return (
    <div className="host-shell">
      <header className="host-bar">
        <div className="host-bar-in">
          <nav className="crumbs" aria-label="Where you are">
            <Link href="/app">Events</Link>
            <span aria-hidden="true">/</span>
            <b>{e.title}</b>
          </nav>
          <EventStatus
            id={id}
            title={e.title}
            status={e.status}
            groupLinkOpen={e.group_link_enabled !== false}
            counts={{ guests: guests.length, replies: guests.filter((g) => g.status !== "pending").length }}
          />
        </div>
        <EventNav id={id} waiting={guests.filter((g) => g.status === "pending").length} />
      </header>
      <main className="host">{children}</main>
    </div>
  );
}
