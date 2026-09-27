import { copy } from "@/lib/copy";
import { defaultsFor } from "@/lib/event-types";
import { eventForRender } from "@/lib/db/events";
import type { PublicEvent, RunsheetStop } from "@/lib/db/types";
import { asLayoutId } from "@/lib/layouts";

// The stand in party, for the one place a design is offered before there is an event: step two of
// New event, where the host has said what kind of party it is and nothing else yet.
//
// It exists because the tile there has to be the invite. Every other screen that offers a design
// draws the real one, and this step drew a little diagram of each layout instead, so four designs
// came out as four copies of the same beige envelope and a host chose by reading the names.
//
// Nothing here touches the database. It is one object built from the event type's own defaults,
// the wording in copy.sample, and the title the host has typed if they have got that far, so it
// can be drawn on the server with no session, no row and no id.

const BRISBANE_OFFSET_MS = 10 * 60 * 60 * 1000;

type Party = (typeof copy.sample.parties)[keyof typeof copy.sample.parties];

function partyFor(type: string): Party {
  const parties = copy.sample.parties as Record<string, Party | undefined>;
  return parties[type] ?? copy.sample.parties.kids_party;
}

/** The sample's date: the first Saturday at least three weeks out, counted in Brisbane.
 *
 *  Worked out rather than written down, because a date in copy goes stale and a sample invite
 *  advertising a party in the past is the one thing it must not do. Queensland has no daylight
 *  saving, so this needs no timezone library, the same reasoning daysUntil is built on. */
export function sampleDate(now: number = Date.now()): string {
  const d = new Date(now + BRISBANE_OFFSET_MS);
  d.setUTCDate(d.getUTCDate() + 21);
  d.setUTCDate(d.getUTCDate() + ((6 - d.getUTCDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
}

function weekBefore(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}

/** The sample party's own title, for the tiles on step two of New event.
 *
 *  They are drawn on the client, where building a whole event row to read one string off it would
 *  be silly, and a tile with no title on it is not the invite. */
export function samplePartyTitle(type: string): string {
  return partyFor(type).title;
}

/** One plausible invite for a kind of party, ready to draw.
 *
 *  `title` is the host's own if they have typed one. They reach this step before the title box,
 *  so the first time through it is the sample's; coming back from step three it is theirs, which
 *  is worth the one expression it costs.
 *
 *  `layout` decides nothing here except which design InviteBody dispatches to, because the
 *  characters and the stationery are the design's own and read through artworkFor. */
export function sampleEvent({ type, layout, title }: { type: string; layout?: string | null; title?: string | null }): PublicEvent {
  const party = partyFor(type);
  const date = sampleDate();
  const stops: RunsheetStop[] = party.stops.map((s) => ({ time: s.time, title: s.title, note: s.note, icon: s.icon }));
  return eventForRender({
    ...defaultsFor(type),
    id: "sample",
    slug: "sample",
    type,
    layout_id: asLayoutId(layout),
    title: title?.trim() || party.title,
    host_line: party.hostLine,
    intro: party.intro,
    date,
    start_time: party.start,
    end_time: party.end,
    time_note: null,
    venue: party.venue,
    address: party.address,
    good_to_know: copy.sample.goodToKnow,
    what_to_bring: party.bring,
    rsvp_by: weekBefore(date),
    // The arrays, spelled out rather than left undefined. Every one of them is mapped or counted
    // somewhere in the invite, and an absent list is a thrown error rather than an empty section.
    facilities: [],
    dietary_chips: [],
    gift_prefs_ok: [],
    gift_prefs_avoid: [],
    section_order: [],
    wishlist: [],
    runsheet: stops,
    updates: [],
    palette: null,
    invite_image_path: null,
    status: "live",
  } as unknown as PublicEvent, { runsheet: stops, updates: [] });
}
