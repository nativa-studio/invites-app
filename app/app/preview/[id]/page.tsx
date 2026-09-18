import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/invite.css";
import { copy } from "@/lib/copy";
import { firstName } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, RunsheetStop, Update } from "@/lib/db/types";
import { InviteBody, asLayout } from "@/components/invite/InviteBody";
import { eventForRender } from "@/lib/db/events";

// The host's own look at their invite. Reads the event row straight from the table, so it works
// on a draft and before a single guest exists, and it never touches a guest's opened flag the
// way opening a real link would. Row level security does the guarding: the query returns nothing
// unless the person signed in owns the event.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Preview({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ layout?: string }> }) {
  const { id } = await params;
  const { layout } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!event) notFound();
  // The runsheet and the updates are not columns on this row. A guest reads them through the
  // RPC, which builds them from these two tables, so the preview has to fetch them itself or a
  // layout that shows the order of the afternoon has nothing to count.
  const [{ data: stops }, { data: updates }, { data: guest }] = await Promise.all([
    supabase.from("runsheet_items").select("time, title, note, icon").eq("event_id", id).eq("visibility", "guests").order("sort").order("time"),
    supabase.from("updates").select("body, posted_at").eq("event_id", id).order("posted_at", { ascending: false }),
    supabase.from("guests").select("name").eq("event_id", id).limit(1).maybeSingle(),
  ]);
  const e = eventForRender(event as EventRow, {
    runsheet: (stops ?? []) as RunsheetStop[],
    updates: (updates ?? []) as Update[],
  });

  // A guest sees their own name here, so the preview borrows the first one on the list.
  const greeting = guest?.name ? copy.greeting(firstName(guest.name as string)) : copy.greetingGroup;
  const reply = (
    <div className="pcard">
      <div className="label red">{copy.rsvp.heading}</div>
      <div className="para">{copy.host.previewReply}</div>
    </div>
  );
  return <InviteBody e={e} greeting={greeting} reply={reply} layout={asLayout(layout)} addressee={guest?.name ? String(guest.name) : undefined} />;
}
