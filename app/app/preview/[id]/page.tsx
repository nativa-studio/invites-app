import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/invite.css";
import { copy } from "@/lib/copy";
import { firstName } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, RunsheetStop, Update } from "@/lib/db/types";
import { InviteBody, asLayout } from "@/components/invite/InviteBody";
import { asArtwork } from "@/lib/artwork";
import { eventForRender } from "@/lib/db/events";
import { googleCalendarLink } from "@/lib/calendar";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import { Pencils } from "@/components/host/Pencils";
import { HostPlate } from "@/components/invite/HostPlate";
import { GiftsCard } from "@/components/invite/GiftsCard";
import { hasGifts } from "@/components/invite/GiftsContent";
import { ReplyProvider } from "@/components/invite/ReplyState";
import { TryReply } from "@/components/invite/TryReply";
import { previewGift, previewPlate, previewWishes } from "@/lib/db/preview-extras";
import { loadEvent } from "@/lib/db/host";

// The host's own look at their invite. Reads the event row straight from the table, so it works
// on a draft and before a single guest exists, and it never touches a guest's opened flag the
// way opening a real link would. Row level security does the guarding: the query returns nothing
// unless the person signed in owns the event.
//
// One screen, not four. It used to come two ways, editing and as a guest, and the editing one had
// a full size of its own, so a host had four things to choose between before they could change a
// word. Marcia: "it's just too many options, it's a bit confusing."
//
// So this is the guest's invite, working: the reply is their own form, the blocks open, the
// buttons go where they go, and only the saving is held back, because a host is not a guest on
// their own list. ?edit=1 adds one thing to it, a pencil on each part, and takes one away, the
// envelope, which a host does not want to sit through after every save.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Query = { layout?: string; art?: string; show?: string; edit?: string; full?: string };

export default async function Preview({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<Query> }) {
  const { id } = await params;
  const { layout, art, show, edit, full } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  // The host's own invite, with the pencils on. Without it this route is the invite and nothing
  // else, which is what the design sheet and the layout thumbnails show.
  const editing = edit === "1";
  const supabase = await createClient();
  // loadEvent rather than a plain select, because the gifts block is not drawn from the events
  // row alone: the wish list is its own table and what the present is lives on group_gift, and
  // loadEvent already joins both for the editor.
  //
  // This was the fault. The preview fetched select("*"), so the block drew the host's sentence
  // about gifts, no ideas at all, and a group gift that named nothing, while the guest's page,
  // which reads the same three things through event_public_json, drew all of it. Switching the
  // group gift on therefore looked exactly like it had wiped the wish list. Nothing had been
  // written over: the preview had never been given it.
  //
  // This is the rule CLAUDE.md opens with, and this is its third outing.
  const event = await loadEvent(id);
  // The runsheet and the updates are not columns on this row. A guest reads them through the
  // RPC, which builds them from these two tables, so the preview has to fetch them itself or a
  // layout that shows the order of the afternoon has nothing to count.
  const [{ data: stops }, { data: updates }, { data: guest }] = await Promise.all([
    supabase.from("runsheet_items").select("time, title, note, icon").eq("event_id", id).eq("visibility", "guests").order("sort").order("time"),
    supabase.from("updates").select("body, posted_at").eq("event_id", id).order("posted_at", { ascending: false }),
    supabase.from("guests").select("name, token").eq("event_id", id).limit(1).maybeSingle(),
  ]);
  // The plate, the gift and the crossings out, all three through the same functions a guest's
  // invite goes through, so what this shows cannot disagree with what they get. Read from the
  // host's own rows, because a preview has no token to call the guest functions with. See
  // lib/db/preview-extras.ts.
  //
  // All three, always, now that there is one screen. Two of them used to be fetched only for the
  // as-a-guest view, and the gifts block on the editing one therefore fell back to a line saying
  // how to chip in comes with the reply, which had stopped being true. Two drawings of one block
  // disagreeing is the fault CLAUDE.md opens with, and the surest way to stop it is to have one
  // drawing.
  //
  // Nothing is written from here. The provider below is marked pretend, so a tick moves on the
  // screen and touches no row.
  // The plate stays behind that view, because the editor draws its own plate card from
  // PreviewExtras rather than the guest's board, and a query nobody reads is a query not worth
  // making.
  const row = event as EventRow;
  const [plate, gift, wishes] = await Promise.all([previewPlate(id), previewGift(id), previewWishes(id)]);
  // The Layout tab previews what you are about to save, not what is saved. Anything it hands over
  // in the query string wins over the stored row, so a switch you have just flicked shows here
  // before you commit to it. Absent means use what is stored.
  const e = eventForRender({
    ...(event as EventRow),
    // The two names for the same thing. A guest's payload calls the present group_gift_what;
    // the host row, which joins the table it actually lives on, calls it gift_description.
    group_gift_what: row.gift_description ?? null,
    wishlist: row.wishlist ?? [],
    ...unsaved(show),
  }, {
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
  // preview=1 so the download is not counted as this guest tapping Add to calendar. The token
  // here is a real guest's, borrowed for the greeting, and a host trying their own invite must
  // not leave a mark on somebody else's row. The Google button stays pointed straight at Google
  // for the same reason, rather than at our counting redirect.
  const previewIcs = token ? `/i/${token}/invite.ics?preview=1` : null;
  // The guest's own form, always. It is the one part of the invite whose whole point is what it
  // does, and a drawn copy of it could not be pressed: a host wanting to know what their own
  // questions felt like had to switch modes to find out. Press yes here and the questions come,
  // the thank you comes, the plate board appears. None of it is saved and nobody is counted.
  const reply = (
    <TryReply
      e={e}
      who={who ?? copy.host.tryWho}
      googleLink={googleCalendarLink(e, token ? inviteLink(await getSiteUrl(), token) : "")}
      icsLink={previewIcs}
      plate={plate}
      gift={gift}
    />
  );
  // Opened full size, this is a whole page with no chrome on it, so there was no way out except
  // the browser's own back, which a phone hides once you scroll. The frames that show this same
  // route inside the host screens do not ask for it, and must not have it.
  return (
    <>
      {full === "1" && <a className="preview-back" href={`/app/events/${id}/invite`}>{copy.host.backToParty}</a>}
      {editing && <Pencils />}
      {/* The answer lives here, so the plate part below the info booth draws itself the way it
          does on a real invite. Pretend, which is what keeps a host trying their own invite off
          their own guest list. */}
      <ReplyProvider initial={{ token: token ?? "", status: "pending", plate: null, gift, wishes, pretend: true }}>
        <InviteBody
          e={e}
          greeting={greeting}
          reply={reply}
          layout={asLayout(layout)}
          // ?art= beside ?layout=, so the picker can show a design with the pictures it was
          // drawn around rather than with whatever this event already has. Looking only.
          artwork={asArtwork(art)}
          pretend
          // The host's own preview. It borrows a real guest's token for the greeting, so the
          // Google button goes straight to Google rather than through our counting redirect, and
          // the file carries preview=1. Either way round, a host looking at their own invite must
          // not turn up on their own list as having added the party to their calendar.
          calendar={e.date ? { google: googleCalendarLink(e, token ? inviteLink(await getSiteUrl(), token) : ""), ics: previewIcs } : null}
          // Two blocks a host can lose sight of, and only while editing. Everywhere else this
          // route is exactly what a guest gets.
          //
          // The gifts block: handed over only when there would otherwise be no card, which means
          // a block switched off or one with nothing written in it yet. On, with words in it, the
          // guest's own card draws and the pencil sits on that. A part with no card has no
          // pencil, and the switch that brings it back is behind that pencil.
          giftsCard={editing && (!row.show_gifts || !hasGifts(e))
            ? <GiftsCard e={e} off={!row.show_gifts} /> : undefined}
          // The plate: the same problem for a different reason. A guest sees the board after
          // saying yes, and a host has not. HostPlate draws the stand-in until they press yes on
          // their own invite, and the real board after it.
          plateCard={editing && row.plate_enabled
            ? <HostPlate note={row.plate_host_note} mode={row.plate_mode} off={row.plate_block === false} />
            : undefined}
          // No envelope while editing. It is a lovely three seconds the first time and a toll to
          // pay after every save. A guest's own link is where it is watched, and the design sheet
          // has a Play it again beside each layout.
          skipAnimation={editing ? true : undefined}
        />
      </ReplyProvider>
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
