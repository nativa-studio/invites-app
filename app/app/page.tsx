import Link from "next/link";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { EventCard, type EventSummary } from "@/components/host/EventCard";

export default async function EventList() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, status, layout_id, invite_image_path, theme_id, palette")
    .order("date", { ascending: true });

  // One query for every guest across the host's events, rather than one per card. A host has a
  // handful of events, so the rows are few and the round trips matter more than the bytes.
  const ids = (events ?? []).map((e) => e.id);
  const { data: guests } = ids.length
    ? await supabase.from("guests").select("event_id, status, party_size").in("event_id", ids)
    : { data: [] };

  const cards: EventSummary[] = (events ?? []).map((e) => {
    const mine = (guests ?? []).filter((g) => g.event_id === e.id);
    const yes = mine.filter((g) => g.status === "yes");
    return {
      ...e,
      yes: yes.length,
      pending: mine.filter((g) => g.status === "pending").length,
      people: yes.reduce((n, g) => n + (g.party_size ?? 1), 0),
    };
  });

  return (
    <main className="host">
      <header className="top">
        <Link href="/app" className="brand">{copy.brand}</Link>
        <form action={signOut}><button className="btn small" type="submit">{copy.app.signOut}</button></form>
      </header>
      <h1 className="h1">{copy.app.yourEvents}</h1>
      <div className="actions"><Link href="/app/events/new" className="btn primary">{copy.app.newEvent}</Link></div>
      {!cards.length && <p className="muted">{copy.app.noEvents}</p>}
      <div className="evt-grid">
        {cards.map((e) => <EventCard key={e.id} e={e} />)}
      </div>
    </main>
  );
}
