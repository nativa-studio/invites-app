import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { getSiteUrl } from "@/lib/site-url";
import { CopyButton } from "@/components/host/CopyButton";
import { GroupLinks } from "@/components/host/GroupLinks";
import { ReplyCounts, tally } from "@/components/host/ReplyCounts";
import { EditCard, Sum } from "@/components/host/EditCard";
import { Switch } from "@/components/host/fields";

// Tracking: the screen you check rather than the screen you fill in. How it is going, then the
// links you hand out.
//
// The counts are here and again on RSVP, from the one component. This is the screen you land on,
// and landing on your own event to be told nothing about it would be a strange way in. RSVP is
// where the numbers are broken down and the questions behind them are set.
export default async function Tracking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, list] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const site = await getSiteUrl();
  const r = tally(list, e.ask_party_mode === "split");
  const groupLink = `${site}/e/${e.slug}`;
  const open = e.group_link_enabled !== false;
  // The groups the guest list already carries, shown under the one being named so a host can find
  // a link they handed out last week without retyping it.
  const groupsInUse = [...new Set(list.flatMap((g) => g.groups ?? []))].sort((a, b) => a.localeCompare(b));

  return (
    <>
      {list.length === 0 && <p className="notice">No guests yet. Add them under <b>Guests</b>, and every one gets their own link straight away.</p>}
      <ReplyCounts r={r} />
      {/* The switch that closes this link belongs next to the link, not three screens away under
          the reply questions, where it used to live. */}
      <EditCard
        eventId={e.id}
        title={copy.host.groupLink}
        blurb={copy.host.groupLinkBlurb}
        fields={["group_link_enabled"]}
        summary={<Sum label="Right now" value={open ? copy.host.groupLinkOpen : copy.host.groupLinkClosed} />}
        extra={
          <>
            <p className="hint">{copy.host.groupLinkHint}</p>
            <code>{groupLink}</code>
            <div className="actions"><CopyButton text={groupLink} label={copy.host.copy} /></div>
          </>
        }
      >
        <Switch id="group_link_enabled" label="Group link open (for chats)" value={open} />
      </EditCard>
      <GroupLinks base={groupLink} inUse={groupsInUse} />
    </>
  );
}
