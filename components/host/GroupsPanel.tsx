import { copy } from "@/lib/copy";
import { groupSlug } from "@/lib/groups";
import type { GuestRow } from "@/lib/db/types";
import { groupInviteText, type TemplateEvent } from "@/lib/messages";
import { CopyButton } from "./CopyButton";
import { NewGroupLink } from "./NewGroupLink";

// The groups: who is in each one, how they are replying, and the link that reaches them.
//
// This was two cards, one under the other, both listing every group with its link. The top one
// printed the url in full and the bottom one printed the counts, so a host read Family, Friends,
// Neighbours twice on the way down the screen and had to know which of the two copies carried the
// button they wanted. One card now: the group, how it is going, and both ways to take its link.
//
// Copy message is the one a host wants nine times out of ten, since a group link exists to be
// pasted into a chat, and it used to be on the card without the counts. Copy link on its own is
// for a poster or a QR code.
//
// Guests with no group are counted too. A host who cannot see the unlabelled ones cannot fix them.
export function GroupsPanel({ guests, base, event }: { guests: GuestRow[]; base: string; event: TemplateEvent }) {
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
      {rows.map((r) => {
        const link = `${base}/${groupSlug(r.name)}`;
        return (
          <div className="grouprow" key={r.name}>
            <div className="n">{r.name}</div>
            <div className="b">
              {r.total} {r.total === 1 ? "guest" : "guests"}
              {r.yes > 0 && `, ${r.yes} coming${r.heads !== r.yes ? ` (${r.heads} people)` : ""}`}
              {r.no > 0 && `, ${r.no} can't`}
              {r.waiting > 0 && `, ${r.waiting} waiting`}
            </div>
            <div className="actions">
              <CopyButton text={groupInviteText(event, link)} label={copy.host.copyMessage} what="message" />
              <CopyButton text={link} label={copy.host.copy} />
            </div>
          </div>
        );
      })}
      {ungrouped.length > 0 && (
        <div className="grouprow plain">
          <div className="n">{copy.host.groupsNone}</div>
          <div className="b">{ungrouped.length} {ungrouped.length === 1 ? "guest" : "guests"}{copy.host.groupsNoneHint}</div>
        </div>
      )}
      <NewGroupLink base={base} event={event} />
    </section>
  );
}
