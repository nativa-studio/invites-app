import Link from "next/link";
import { notFound } from "next/navigation";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/db/types";
import { SettingsForm } from "@/components/host/SettingsForm";

export default async function Settings({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!event) notFound();
  const e = event as EventRow & Record<string, unknown>;
  return (
    <main className="host">
      <header className="top">
        <Link href="/app" className="brand">{copy.brand}</Link>
        <Link href={`/app/events/${id}`} className="btn small">Back to the party</Link>
      </header>
      <h1 className="h1">{isNew === "1" ? "Nearly there" : "Event settings"}</h1>
      {isNew === "1"
        ? <p className="notice">Your invite exists. Worth filling in before you send it: the address, your mobile for the &quot;Questions? Text&quot; line, and what to bring. Then go back to the party to add guests.</p>
        : <p className="muted">Everything on the invite comes from here. Changes show on the guests&apos; links straight away.</p>}
      <SettingsForm e={e} />
    </main>
  );
}
