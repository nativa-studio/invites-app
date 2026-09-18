import { copy } from "@/lib/copy";
import { groupSlug } from "@/lib/groups";
import type { GuestRow } from "@/lib/db/types";
import { CopyButton } from "./CopyButton";

// Where everyone is from, at a glance.
//
// Groups were only ever visible one guest at a time, buried in the list, so a host could not
// answer "have the neighbours replied?" without reading fifty rows. This is that answer: every
// group, how many are in it, how many have said yes, and the link that put them there.
//
// Guests with no group are counted too. A host who cannot see the unlabelled ones cannot fix them.
export function GroupsPanel({ guests, base }: { guests: GuestRow[]; base: string }) {
  const names = [...new Set(guests.flatMap((g) => g.groups ?? []))].sort((a, b) => a.localeCompare(b));
  const ungrouped = guests.filter((g) => !g.groups?.length);

  const row = (name: string, members: GuestRow[]) => ({
    name,
    total: members.length,
    yes: members.filter((g) => g.status === "yes").length,
    no: members.filter((g) => g.status === "no").length,
    waiting: members.filter((g) => g.status === "pending").length,
    heads: members.filter((g) => g.status === "yes").reduce((n, g) => n + (g.party_size ?? 1), 0),
  });

  const rows = names.map((n) => row(n, guests.filter((g) => g.groups?.includes(n))));

  return (
    <section className="card">
      <h2 className="h2">{copy.host.groupsHeading}</h2>
      <p className="hint">{copy.host.groupsBlurb}</p>
      {rows.length === 0 && ungrouped.length === 0 && <p className="hint">{copy.host.groupsEmpty}</p>}
      {rows.map((r) => (
        <div className="grouprow" key={r.name}>
          <div className="n">{r.name}</div>
          <div className="b">
            {r.total} {r.total === 1 ? "guest" : "guests"}
            {r.yes > 0 && `, ${r.yes} coming${r.heads !== r.yes ? ` (${r.heads} people)` : ""}`}
            {r.no > 0 && `, ${r.no} can't`}
            {r.waiting > 0 && `, ${r.waiting} waiting`}
          </div>
          <CopyButton text={`${base}/${groupSlug(r.name)}`} label={copy.host.copy} />
        </div>
      ))}
      {ungrouped.length > 0 && (
        <div className="grouprow plain">
          <div className="n">{copy.host.groupsNone}</div>
          <div className="b">{ungrouped.length} {ungrouped.length === 1 ? "guest" : "guests"}{copy.host.groupsNoneHint}</div>
        </div>
      )}
    </section>
  );
}
