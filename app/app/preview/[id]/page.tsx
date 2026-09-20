import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/invite.css";
import { copy } from "@/lib/copy";
import { firstName } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, RunsheetStop, Update } from "@/lib/db/types";
import { InviteBody, asLayout } from "@/components/invite/InviteBody";
import { eventForRender } from "@/lib/db/events";
import { googleCalendarLink } from "@/lib/calendar";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { PickMode } from "@/components/host/PickMode";
import { PreviewReply } from "@/components/invite/PreviewReply";
import { PreviewGift, PreviewPlate } from "@/components/invite/PreviewExtras";
import { TryReply } from "@/components/invite/TryReply";
import { previewGift, previewPlate } from "@/lib/db/preview-extras";

// The host's own look at their invite. Reads the event row straight from the table, so it works
// on a draft and before a single guest exists, and it never touches a guest's opened flag the
// way opening a real link would. Row level security does the guarding: the query returns nothing
// unless the person signed in owns the event.
//
// It comes two ways. Editing, where a tap on any part names that part so the screen holding the
// frame can open its drawer, and the reply is drawn rather than wired. And as a guest, where
// nothing is tappable and the reply is the guest's own form, answers and thank you and calendar
// buttons included, with only the last step held back because there is nobody to save it against.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Query = { layout?: string; show?: string; pick?: string; full?: string; as?: string };

export default async function Preview({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<Query> }) {
  const { id } = await params;
  const { layout, show, pick, full, as } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const asGuest = as === "guest";
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!event) notFound();
  // The runsheet and the updates are not columns on this row. A guest reads them through the
  // RPC, which builds them from these two tables, so the preview has to fetch them itself or a
  // layout that shows the order of the afternoon has nothing to count.
  const [{ data: stops }, { data: updates }, { data: guest }] = await Promise.all([
    supabase.from("runsheet_items").select("time, title, note, icon").eq("event_id", id).eq("visibility", "guests").order("sort").order("time"),
    supabase.from("updates").select("body, posted_at").eq("event_id", id).order("posted_at", { ascending: false }),
    supabase.from("guests").select("name, token").eq("event_id", id).limit(1).maybeSingle(),
  ]);
  // The plate and the gift, for the "as a guest" view. Read from the host's own rows, because a
  // preview has no token to call the guest functions with. Only fetched when that view is on:
  // the editing view never draws them, and this is three queries.
  const row = event as EventRow;
  const [{ data: allGuests }, gift, giftRow] = await Promise.all([
    asGuest && row.plate_enabled ? supabase.from("guests").select("status, dietary").eq("event_id", id) : { data: null },
    asGuest ? previewGift(id, row) : null,
    // The editing view draws the gift card too, and it needs what a guest would read on it.
    !asGuest && row.group_gift_enabled ? giftLine(supabase, id) : null,
  ]);
  const plate = asGuest ? await previewPlate(id, row, allGuests ?? []) : null;
  // The Layout tab previews what you are about to save, not what is saved. Anything it hands over
  // in the query string wins over the stored row, so a switch you have just flicked shows here
  // before you commit to it. Absent means use what is stored.
  const e = eventForRender({ ...(event as EventRow), ...unsaved(show) }, {
    runsheet: (stops ?? []) as RunsheetStop[],
    updates: (updates ?? []) as Update[],
  });

  // A guest sees their own name here, so the preview borrows the first one on the list.
  const who = guest?.name ? firstName(String(guest.name)) : undefined;
  const greeting = who ? copy.greeting(who) : copy.greetingGroup;
  // The calendar buttons on the thank you card are the real ones. The Apple file is served per
  // guest, so it needs somebody's token: the same first guest the greeting borrows. An event with
  // nobody on the list yet gets Google only, rather than a button that leads to a 404.
  const token = guest?.token ? String(guest.token) : null;
  const reply = asGuest
    ? (
      <TryReply
        e={e}
        who={who ?? copy.host.tryWho}
        googleLink={googleCalendarLink(e, token ? inviteLink(await getSiteUrl(), token) : "")}
        icsLink={token ? `/i/${token}/invite.ics` : null}
        plate={plate}
        gift={gift}
      />
    )
    : (
      <>
        <PreviewReply e={e} who={who} />
        {/* Drawn, and tappable, so the two parts of the invite guests write to can be edited the
            same way as every other part: point at the card, change what it says. Off means no
            card, the same rule the rest of the invite follows, and the switch that turns them
            back on lives in the drawer and on their own tabs. */}
        {/* Drawn here even with the block switched off, marked as not being on the invite.
            The switch that turns it back on lives in the drawer behind this card and nothing
            else opens that drawer, so hiding it the way the guest's page does would leave a
            host looking at a setting they could no longer reach. Trying it as a guest is the
            view that tells the truth, and there it is gone. */}
        {row.plate_enabled && <PreviewPlate note={row.plate_host_note} mode={row.plate_mode} off={row.plate_block === false} />}
        {row.group_gift_enabled && <PreviewGift description={giftRow?.description ?? null} organiser={giftRow?.organiser ?? null} off={row.gift_block === false} />}
      </>
    );
  // Picking means the host is editing, so the envelope starts open: a section they cannot see is
  // a section they cannot tap. Trying it as a guest is the opposite: the envelope is half of what
  // a guest gets, so it opens the way theirs does.
  //
  // Opened full size, this is a whole page with no chrome on it, so there was no way out except
  // the browser's own back, which a phone hides once you scroll. The frames that show this same
  // route inside the host screens do not ask for it, and must not have it.
  const here = (q: Record<string, string>) => {
    const p = new URLSearchParams({ full: "1", ...(layout ? { layout } : {}), ...(show != null ? { show } : {}), ...q });
    return `/app/preview/${id}?${p}`;
  };
  return (
    <>
      {full === "1" && (
        <>
          <a className="preview-back" href={`/app/events/${id}`}>{copy.host.backToParty}</a>
          {asGuest
            ? <a className="preview-mode" href={here({})}>{copy.host.backToEditing}</a>
            : <a className="preview-mode" href={here({ as: "guest" })}>{copy.host.tryAsGuest}</a>}
        </>
      )}
      {pick === "1" && !asGuest && <PickMode />}
      <InviteBody
        e={e}
        greeting={greeting}
        reply={reply}
        layout={asLayout(layout)}
        skipAnimation={pick === "1" && !asGuest ? true : undefined}
      />
    </>
  );
}

// `show` is the list of sections that are on, so an empty string means all four are off and an
// absent one means the host has not said, in which case the stored values stand.
const SECTIONS = { details: "show_details", day: "show_runsheet", know: "show_good_to_know", after: "show_after" } as const;

function unsaved(show: string | undefined): Partial<EventRow> {
  const patch: Record<string, unknown> = {};
  if (show != null) {
    const on = new Set(show.split(",").filter(Boolean));
    for (const [key, column] of Object.entries(SECTIONS)) patch[column] = on.has(key);
  }
  return patch as Partial<EventRow>;
}

// What the gift card says, for the editing view: what the present is, and the first name of
// whoever is running it, whether that is a guest or one of the hosts.
async function giftLine(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
): Promise<{ description: string | null; organiser: string | null } | null> {
  const { data } = await supabase
    .from("group_gift")
    .select("description, guest:guests!group_gift_organiser_guest_id_fkey(name), host:profiles!group_gift_organiser_profile_id_fkey(name)")
    .eq("event_id", id)
    .maybeSingle();
  if (!data) return null;
  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);
  const g = one(data.guest as { name: string } | { name: string }[] | null);
  const h = one(data.host as { name: string } | { name: string }[] | null);
  const name = g?.name ?? h?.name ?? null;
  return { description: data.description, organiser: name ? firstName(name) : null };
}
