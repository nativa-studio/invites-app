import Link from "next/link";
import { copy } from "@/lib/copy";
import { formatLongDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function EventList() {
  const supabase = await createClient();
  const { data: events } = await supabase.from("events").select("id, title, date, status").order("date", { ascending: true });
  return (
    <main className="host">
      <header className="top">
        <Link href="/app" className="brand">{copy.brand}</Link>
        <form action={signOut}><button className="btn small" type="submit">{copy.app.signOut}</button></form>
      </header>
      <h1 className="h1">{copy.app.yourEvents}</h1>
      <div className="actions"><Link href="/app/events/new" className="btn primary">{copy.app.newEvent}</Link></div>
      {!events?.length && <p className="muted">{copy.app.noEvents}</p>}
      <div className="guest-list">
        {events?.map((e) => (
          <Link key={e.id} href={`/app/events/${e.id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{e.title}</span>
            <span className="muted">{e.date ? formatLongDate(e.date) : "Date to come"}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
