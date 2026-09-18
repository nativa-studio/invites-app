import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { CopyButton } from "@/components/host/CopyButton";
import { GroupLinks } from "@/components/host/GroupLinks";

// Tracking: the screen you check rather than the screen you fill in. Counts first, then the one
// or two lines that tell you what needs doing, then the link you paste into a group chat.
export default async function Tracking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, list] = await Promise.all([loadEvent(id), loadGuests(id)]);
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
  // What the host pencilled in for people who have not replied, which is what catering hangs on.
  const stillExpected = pending.reduce((n, g) => n + (g.expected_children ?? 0) + (g.expected_adults ?? 0), 0);
  const withExpectations = pending.filter((g) => g.expected_children != null || g.expected_adults != null).length;
  const groupLink = `${site}/e/${e.slug}`;
  // The groups the guest list already carries, shown under the one being named so a host can find
  // a link they handed out last week without retyping it.
  const groupsInUse = [...new Set(list.flatMap((g) => g.groups ?? []))].sort((a, b) => a.localeCompare(b));

  return (
    <>
      {list.length === 0 && <p className="notice">No guests yet. Add them under <b>Guests</b>, and every one gets their own link straight away.</p>}
      <div className="counts">
        <div className="count"><b>{people}</b><span>{copy.host.coming}{e.ask_party_mode === "split" && people ? ` (${children} kids, ${adults} adults)` : ""}</span></div>
        <div className="count"><b>{yes.length}</b><span>{copy.host.saidYes}</span></div>
        <div className="count"><b>{no.length}</b><span>{copy.host.saidNo}</span></div>
        <div className="count"><b>{pending.length}</b><span>{copy.host.noReply}{opened.length ? `, ${opened.length} ${copy.host.opened}` : ""}</span></div>
      </div>
      {stillExpected > 0 && (
        <p className="notice">Another {stillExpected} pencilled in from {withExpectations} {withExpectations === 1 ? "guest who has" : "guests who have"} not replied, so around {people + stillExpected} all up.</p>
      )}
      {dietaryCounts.length > 0 && (
        <p className="notice">Food: {dietaryCounts.map(([k, n]) => `${n} ${k.toLowerCase()}`).join(", ")}.{yes.some((g) => g.dietary_note) ? " Some notes too, see the guest list." : ""}</p>
      )}
      <section className="card">
        <h2 className="h2">{copy.host.groupLink}</h2>
        <p className="hint">{copy.host.groupLinkHint}</p>
        <code>{groupLink}</code>
        <div className="actions"><CopyButton text={groupLink} label={copy.host.copy} /></div>
      </section>
      <GroupLinks base={groupLink} inUse={groupsInUse} />
    </>
  );
}
