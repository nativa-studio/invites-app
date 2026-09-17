import Link from "next/link";
import { notFound } from "next/navigation";
import { copy } from "@/lib/copy";
import { formatLongDate, formatTimeRange } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import type { EventRow, GuestRow } from "@/lib/db/types";
import { GuestList } from "@/components/host/GuestList";
import { AddGuest } from "@/components/host/AddGuest";
import { CopyButton } from "@/components/host/CopyButton";

export default async function Dashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: event }, { data: guests }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("guests").select("*").eq("event_id", id).order("created_at", { ascending: true }),
  ]);
  if (!event) notFound();
  const e = event as EventRow;
  const list = (guests ?? []) as GuestRow[];
  const site = await getSiteUrl();

  const yes = list.filter((g) => g.status === "yes");
  const no = list.filter((g) => g.status === "no");
  const pending = list.filter((g) => g.status === "pending");
  const opened = pending.filter((g) => g.opened_at);
  const people = yes.reduce((n, g) => n + (g.party_size ?? 1), 0);
  const children = yes.reduce((n, g) => n + (g.children ?? 0), 0);
  const adults = yes.reduce((n, g) => n + (g.adults ?? 0), 0);
  const dietary = yes.flatMap((g) => g.dietary);
  const dietaryCounts = Object.entries(dietary.reduce<Record<string, number>>((m, d) => ({ ...m, [d]: (m[d] ?? 0) + 1 }), {}));
  const groupLink = `${site}/e/${e.slug}`;

  return (
    <main className="host">
      <header className="top">
        <Link href="/app" className="brand">{copy.brand}</Link>
        <div className="actions">
          <Link href={`/app/events/${e.id}/settings`} className="btn small">Settings</Link>
          {list[0] && <Link href={`/i/${list[0].token}?open=1`} className="btn small" target="_blank">Preview</Link>}
        </div>
      </header>
      <div>
        <h1 className="h1">{e.title}</h1>
        <p className="muted">{formatLongDate(e.date)}{e.start_time ? `, ${formatTimeRange(e.start_time, e.end_time, e.time_note).toLowerCase()}` : ""}</p>
      </div>

      <div className="counts">
        <div className="count"><b>{people}</b><span>{copy.host.coming}{e.ask_party_mode === "split" && people ? ` (${children} kids, ${adults} adults)` : ""}</span></div>
        <div className="count"><b>{yes.length}</b><span>{copy.host.saidYes}</span></div>
        <div className="count"><b>{no.length}</b><span>{copy.host.saidNo}</span></div>
        <div className="count"><b>{pending.length}</b><span>{copy.host.noReply}{opened.length ? `, ${opened.length} ${copy.host.opened}` : ""}</span></div>
      </div>
      {dietaryCounts.length > 0 && (
        <p className="notice">Food: {dietaryCounts.map(([k, n]) => `${n} ${k.toLowerCase()}`).join(", ")}.{yes.some((g) => g.dietary_note) ? " Some notes too, see the guest list." : ""}</p>
      )}

      <section className="card">
        <h2 className="h2">{copy.host.groupLink}</h2>
        <p className="muted" style={{ fontSize: 14 }}>{copy.host.groupLinkHint}</p>
        <code>{groupLink}</code>
        <div className="actions"><CopyButton text={groupLink} label={copy.host.copy} /></div>
      </section>

      <AddGuest eventId={e.id} />

      <GuestList eventId={e.id} guests={list} event={{ title: e.title, date: e.date, text_template: e.text_template, reminder_template: e.reminder_template }} site={site} />
    </main>
  );
}
