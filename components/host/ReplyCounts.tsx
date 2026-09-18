import { copy } from "@/lib/copy";
import type { GuestRow } from "@/lib/db/types";

// What the replies add up to. One of these, used on the screen you land on and again on RSVP,
// because two copies would have disagreed the first time one of them learned to count something.
export type Replies = ReturnType<typeof tally>;

export function tally(list: GuestRow[], splitParty: boolean) {
  const yes = list.filter((g) => g.status === "yes");
  const no = list.filter((g) => g.status === "no");
  const pending = list.filter((g) => g.status === "pending");
  const opened = pending.filter((g) => g.opened_at);
  const people = yes.reduce((n, g) => n + (g.party_size ?? 1), 0);
  const dietary = yes.flatMap((g) => g.dietary);
  return {
    yes, no, pending, opened, people, splitParty,
    children: yes.reduce((n, g) => n + (g.children ?? 0), 0),
    adults: yes.reduce((n, g) => n + (g.adults ?? 0), 0),
    dietaryCounts: Object.entries(dietary.reduce<Record<string, number>>((m, d) => ({ ...m, [d]: (m[d] ?? 0) + 1 }), {})),
    notes: yes.some((g) => g.dietary_note),
    // What the host pencilled in for people who have not replied, which is what catering hangs on.
    stillExpected: pending.reduce((n, g) => n + (g.expected_children ?? 0) + (g.expected_adults ?? 0), 0),
    withExpectations: pending.filter((g) => g.expected_children != null || g.expected_adults != null).length,
  };
}

export function ReplyCounts({ r }: { r: Replies }) {
  return (
    <div className="counts">
      <div className="count"><b>{r.people}</b><span>{copy.host.coming}{r.splitParty && r.people ? ` (${r.children} kids, ${r.adults} adults)` : ""}</span></div>
      <div className="count"><b>{r.yes.length}</b><span>{copy.host.saidYes}</span></div>
      <div className="count"><b>{r.no.length}</b><span>{copy.host.saidNo}</span></div>
      <div className="count"><b>{r.pending.length}</b><span>{copy.host.noReply}{r.opened.length ? `, ${r.opened.length} ${copy.host.opened}` : ""}</span></div>
    </div>
  );
}

// The two lines that only matter once somebody has replied, or been pencilled in.
export function ReplyNotes({ r }: { r: Replies }) {
  return (
    <>
      {r.stillExpected > 0 && (
        <p className="notice">Another {r.stillExpected} pencilled in from {r.withExpectations} {r.withExpectations === 1 ? "guest who has" : "guests who have"} not replied, so around {r.people + r.stillExpected} all up.</p>
      )}
      {r.dietaryCounts.length > 0 && (
        <p className="notice">Food: {r.dietaryCounts.map(([k, n]) => `${n} ${k.toLowerCase()}`).join(", ")}.{r.notes ? " Some notes too, see the guest list." : ""}</p>
      )}
    </>
  );
}
