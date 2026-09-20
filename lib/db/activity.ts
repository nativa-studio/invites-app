import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { GuestRow } from "./types";

// What has happened on this event, newest first.
//
// It comes from two places, because the two record different things and neither one is enough.
//
// The activity table holds a row per event, so it keeps a history: a guest who said yes in
// October and no in November has both, and the trail says so. The guest row holds one timestamp
// per kind, so it only ever remembers the last one, but it is the only record of three things
// that were never written to activity at all: their link going out, their first look at it, and a
// reminder.
//
// So: activity for the things that can happen more than once, guest columns for the things that
// are stamped once, merged and sorted. Nothing is counted twice, because no kind appears in both.
export type Happening = {
  at: string;
  kind: "yes" | "no" | "joined" | "calendar" | "token" | "sent" | "opened" | "reminded";
  who: string;
};

type Row = {
  kind: string;
  detail: string | null;
  at: string;
  guest: { name: string } | { name: string }[] | null;
};

export const loadActivity = cache(async (eventId: string, guests: GuestRow[]): Promise<Happening[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity")
    .select("kind, detail, at, guest:guests(name)")
    .eq("event_id", eventId)
    .order("at", { ascending: false })
    .limit(120);

  const out: Happening[] = [];
  for (const row of (data ?? []) as Row[]) {
    const g = Array.isArray(row.guest) ? row.guest[0] : row.guest;
    // A guest who has since been removed takes their name with them, and a line about nobody is
    // worse than no line.
    const who = g?.name;
    if (!who) continue;
    const kind = row.kind === "rsvp"
      ? (row.detail === "yes" ? "yes" : row.detail === "no" ? "no" : null)
      : row.kind === "joined" || row.kind === "calendar" || row.kind === "token"
        ? (row.kind as Happening["kind"])
        : null;
    if (!kind) continue;
    out.push({ at: row.at, kind, who });
  }

  for (const g of guests) {
    if (g.sent_at) out.push({ at: g.sent_at, kind: "sent", who: g.name });
    if (g.opened_at) out.push({ at: g.opened_at, kind: "opened", who: g.name });
    if (g.reminded_at) out.push({ at: g.reminded_at, kind: "reminded", who: g.name });
  }

  return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)).slice(0, 80);
});
