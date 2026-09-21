import Link from "next/link";
import { copy } from "@/lib/copy";
import { daysUntil } from "@/lib/format";
import { counts } from "@/lib/heads";
import type { GuestRow, PublicEvent } from "@/lib/db/types";
import type { Happening } from "@/lib/db/activity";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { stockFor } from "@/lib/layouts";
import { inkFor, paperFor } from "@/lib/strip-set";
import { InviteThumb } from "./InviteThumb";
import { ActivityDrawer } from "./ActivityDrawer";
import { groupsOf } from "@/lib/group-colours";

// Where the event is up to, before a host has to choose a tab.
//
// An event used to open on the invite editor, which answers "what does this look like". That is
// the right question in the week you make it and the wrong one for every week after, when the
// question is how many are coming and who has not answered. So the invite moved one tap away
// and this took the address.
//
// Every number here is a link to the names behind it. A count on its own is a dead end: a host
// who reads "9 to reply" wants the nine, and making them find the guest list and set a filter to
// get there is the same work the count was supposed to save.
//
// Nothing on this screen can be edited. Everything is worked out from the guest list, and the
// way to change any of it is to change the guest it came from.
export function Overview({
  e, guests, feed,
}: { e: PublicEvent & { id: string }; guests: GuestRow[]; feed: Happening[] }) {
  const base = `/app/events/${e.id}`;
  const splitParty = e.ask_party_mode === "split";
  const c = counts(guests, splitParty);

  const yes = guests.filter((g) => g.status === "yes");
  const no = guests.filter((g) => g.status === "no");
  const waiting = guests.filter((g) => g.status === "pending");
  const replied = yes.length + no.length;
  const sent = guests.filter((g) => g.sent_at).length;

  // Everybody who has not said no, counted with what they actually answered where they have
  // answered and what the host pencilled in where they have not. It is a guess, and the caption
  // under it says so: a number that looks like a fact is worse than no number.
  const onList = guests.filter((g) => g.status !== "no").reduce((n, g) => {
    if (g.status === "yes") {
      const split = (g.children ?? 0) + (g.adults ?? 0);
      return n + (splitParty && split > 0 ? split : g.party_size ?? 1);
    }
    return n + (g.expected_children ?? 0) + (g.expected_adults ?? 0);
  }, 0);

  const days = daysUntil(e.date);
  const p = paletteFor(e.palette, e.theme_id ?? "");
  const stock = stockFor(e.layout_id ?? undefined);
  const split = copy.host.split(c.replied.kids, c.replied.adults);

  return (
    <>
      {/* The invite itself, at the top, because it is the thing the event is. Whole tile is the
          link: a thumbnail with a separate Edit link beside it gives a host two targets for one
          intention on a screen they are holding one handed. */}
      <Link href={`${base}/invite`} className="ov-invite">
        <span
          className={`evt-art${stock === "beige" ? " beige" : ""}${stock === "ink" ? " ink" : ""}`}
          style={stock === "ink"
            ? ({ "--ink": inkFor(e.ink), "--paper": paperFor(e.ink) } as React.CSSProperties)
            : paletteVars(p)}
        >
          <InviteThumb
            artwork={e.invite_image_path}
            title={e.title}
            intro={e.intro}
            themeId={e.theme_id}
            palette={e.palette}
            layout={e.layout_id ?? undefined}
            ink={e.ink}
          />
        </span>
        <span className="ov-invite-foot">
          <b>{copy.host.ovInvite}</b>
          <span className="muted">
            {guests.length === 0 || sent === 0 ? copy.host.ovNotSent : copy.host.ovSentTo(sent, guests.length)}
          </span>
          <span className="as-link">{copy.host.ovEdit}</span>
        </span>
      </Link>

      <div className="ov-tiles">
        <Link href={`${base}/guests?filter=yes`} className="ov-tile">
          <span className="big">{c.replied.total}</span>
          <span className="lab">{copy.host.ovComing}</span>
          {split && <span className="sub">{split}</span>}
        </Link>

        <Link href={`${base}/guests`} className="ov-tile">
          <span className="big">{onList}</span>
          <span className="lab">{copy.host.ovOnList}</span>
          <span className="sub">{copy.host.ovOnListHint}</span>
        </Link>

        {/* Not a link. The status is changed from the badge in the header, which is the one
            place it lives, and the days are a fact about the calendar with nothing behind them. */}
        <div className="ov-tile still">
          <span className="big">{days === null ? "" : copy.host.ovDaysBig(days)}</span>
          <span className="lab">{days === null ? copy.host.ovNoDate : copy.host.ovDaysLabel(days)}</span>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="h2">{copy.host.ovReplies}</h2>
          <span className="muted">{copy.host.ovReplied(replied, guests.length)}</span>
        </div>
        {guests.length === 0 ? (
          <p className="muted">{copy.host.ovNobodyYet}</p>
        ) : (
          <>
            {/* One bar, three parts, and the empty track is the third one rather than a gap.
                "Still to reply" is the number a host is actually chasing, so it has to be a
                visible size on the bar and not the absence of the other two. */}
            <div
              className="ov-bar"
              role="img"
              aria-label={`${yes.length} coming, ${no.length} can't make it, ${waiting.length} still to reply`}
            >
              <span className="seg yes" style={{ width: `${(yes.length / guests.length) * 100}%` }} />
              <span className="seg no" style={{ width: `${(no.length / guests.length) * 100}%` }} />
            </div>
            <div className="ov-legend">
              <Link href={`${base}/guests?filter=yes`}><span className="dot yes" />{copy.host.ovLegendYes(yes.length)}</Link>
              <Link href={`${base}/guests?filter=no`}><span className="dot no" />{copy.host.ovLegendNo(no.length)}</Link>
              <Link href={`${base}/guests?filter=pending`}><span className="dot wait" />{copy.host.ovLegendWaiting(waiting.length)}</Link>
            </div>
          </>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="h2">{copy.host.ovSettings}</h2>
          <Link href={`${base}/settings`} className="btn small">{copy.host.ovChange}</Link>
        </div>
        <div className="ov-chips">
          <Chip label={copy.host.ovPlateChip} on={e.plate_enabled} />
          <Chip label={copy.host.ovGiftChip} on={e.group_gift_enabled} />
          <Chip label={copy.host.ovSplitChip} on={splitParty} />
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="h2">{copy.host.ovNudge}</h2>
          {waiting.length > 0 && (
            <Link href={`${base}/guests?filter=pending`} className="btn small">{copy.host.ovNudgeAll(waiting.length)}</Link>
          )}
        </div>
        {waiting.length === 0 ? (
          <p className="muted">{copy.host.ovNudgeNone}</p>
        ) : (
          <ul className="plain">
            {/* Three, not all of them. This is the card that says there is chasing to do; the
                chasing itself happens on the guest list, where the text buttons are. */}
            {waiting.slice(0, 3).map((g) => (
              <li key={g.id}>
                <b>{g.name}</b>
                <span className="muted"> · {!g.sent_at ? copy.host.ovUnsent : g.opened_at ? copy.host.ovOpened : copy.host.ovSent}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* The trail, in the component that has always drawn it, rather than a second plainer
          copy of the same feed.

          There was one here for a day: five lines, no group tag, no per-kind styling. It is the
          fault this project keeps making, written into CLAUDE.md twice already, and I made it
          again: a thing drawn in two places drifts, and the second drawing is always the poorer
          one because it is the one nobody is looking at while they work on the first.

          The group tag is the part that was lost. It is what tells two Sarahs apart, and on a
          group-link open it is the only thing on the line that says which link was opened, since
          nobody's name is attached to it. */}
      <ActivityDrawer feed={feed} groups={groupsOf(guests)} />
    </>
  );
}

function Chip({ label, on }: { label: string; on: boolean | null }) {
  return (
    <span className={`ov-chip${on ? " on" : ""}`}>
      {label} · {on ? copy.host.ovOn : copy.host.ovOff}
    </span>
  );
}
