import Link from "next/link";
import { copy } from "@/lib/copy";
import { daysUntil, relativeTime } from "@/lib/format";
import { counts, headsFor } from "@/lib/heads";
import { happeningLine } from "@/lib/happening";
import type { GuestRow, PublicEvent } from "@/lib/db/types";
import type { Happening } from "@/lib/db/activity";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { stockFor } from "@/lib/layouts";
import { inkFor, paperFor } from "@/lib/strip-set";
import { groupColour, groupsOf } from "@/lib/group-colours";
import { realAllergies } from "@/lib/allergies";
import { InviteThumb } from "./InviteThumb";

// Where the event is up to, before a host has to choose a tab.
//
// A row of numbers, then the cards. The numbers are the question a host opens the app with, and
// every one of them is a link to the names behind it: a count on its own is a dead end, and
// making somebody read "3 to reply" and then go and set a filter is the work the count was
// supposed to save.
//
// The row is five tiles that wrap, so the same markup is a row on a laptop and a stack on a
// phone. Nothing here is edited. Everything is worked out from the guest list, and the way to
// change any of it is to change the guest it came from.
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
  const all = guests.length;

  // Everybody who has not said no, counted with what they answered where they have answered and
  // what the host put in where they have not. The caption says so: a number that looks like a
  // fact is worse than no number.
  //
  // Through headsFor, not a sum of its own. This was its own reducer, asking almost the same
  // question as lib/heads.ts in almost the same code, and "same rule, on purpose" in a comment is
  // not the same rule: when the ladder in heads.ts gained a rung, this one would not have.
  const onList = guests.filter((g) => g.status !== "no").reduce(
    (a, g) => {
      const h = headsFor(g, splitParty);
      return { kids: a.kids + h.kids, adults: a.adults + h.adults, total: a.total + h.total };
    },
    { kids: 0, adults: 0, total: 0 },
  );

  const days = daysUntil(e.date);
  const p = paletteFor(e.palette, e.theme_id ?? "");
  const stock = stockFor(e.layout_id ?? undefined);
  const groups = groupsOf(guests);
  const pct = (n: number) => (all === 0 ? 0 : (n / all) * 100);
  const allergies = realAllergies(yes);
  const diet = Object.entries(
    yes.flatMap((g) => g.dietary).reduce<Record<string, number>>((m, d) => ({ ...m, [d]: (m[d] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <>
      <div className="tiles">
        {/* The invite itself, first, because it is the thing the event is. The whole tile is the
            link: a thumbnail with a separate Edit beside it gives a host two targets for one
            intention. */}
        <Link href={`${base}/invite`} className="tile art">
          <span
            className={`evt-art${stock === "beige" ? " beige" : ""}${stock === "ink" ? " ink" : ""}`}
            style={stock === "ink"
              ? ({ "--ink": inkFor(e.ink), "--paper": paperFor(e.ink) } as React.CSSProperties)
              : paletteVars(p)}
          >
            <InviteThumb
              title={e.title} intro={e.intro} themeId={e.theme_id}
              palette={e.palette} layout={e.layout_id ?? undefined} ink={e.ink}
            />
          </span>
          <span className="cap">
            <b>{copy.host.ovInvite}</b>
            <span className="sub">
              {all === 0 || sent === 0 ? copy.host.ovNotSent : `${copy.host.ovSentTo(sent, all)} · ${copy.host.ovEdit}`}
            </span>
          </span>
        </Link>

        <Link href={`${base}/guests?filter=yes`} className="tile">
          <span className="n"><b>{c.replied.total}</b> <span className="lab">{copy.host.ovComing}</span></span>
          <span className="sub">{splitLine(c.replied.kids, c.replied.adults, c.replied.total)}</span>
        </Link>

        {/* Replies is a tile rather than a card of its own. It is one number with its working
            shown, not a section. The empty track is the third count: the number a host is
            chasing has to have a visible size, not be the absence of the other two. */}
        <div className="tile">
          <span className="n">
            <b>{replied}</b><span className="of"> / {all}</span> <span className="lab">{copy.host.ovRepliedWord}</span>
          </span>
          <div className="bar" role="img" aria-label={`${yes.length} coming, ${no.length} can't make it, ${waiting.length} still to reply`}>
            <span className="seg yes" style={{ width: `${pct(yes.length)}%` }} />
            <span className="seg no" style={{ width: `${pct(no.length)}%` }} />
          </div>
          <div className="legend">
            <Link href={`${base}/guests?filter=yes`}><i className="dot yes" />{copy.host.ovLegendYes(yes.length)}</Link>
            <Link href={`${base}/guests?filter=no`}><i className="dot no" />{copy.host.ovLegendNo(no.length)}</Link>
            <Link href={`${base}/guests?filter=pending`}><i className="dot wait" />{copy.host.ovLegendWaiting(waiting.length)}</Link>
          </div>
        </div>

        <Link href={`${base}/guests`} className="tile">
          <span className="n"><b>{onList.total}</b> <span className="lab">{copy.host.ovOnList}</span></span>
          <span className="sub">{splitLine(onList.kids, onList.adults, onList.total)}</span>
          <span className="faint">{copy.host.ovOnListHint}</span>
        </Link>

        {/* The status as a label, not a second control. It is changed from the badge in the bar
            above, which is on every screen, and two controls for one setting is the shape of
            every expensive mistake on this project. */}
        <div className="tile">
          <span className={`tag state ${e.status ?? "draft"}`}>
            <i className="dot" />{copy.host.statusNames[e.status ?? "draft"] ?? e.status}
          </span>
          <span className="n">
            {days === null
              ? <b className="none">{copy.host.ovNoDate}</b>
              : <><b>{copy.host.ovDaysBig(days)}</b> <span className="lab">{copy.host.ovDaysLabel(days)}</span></>}
          </span>
        </div>
      </div>

      <div className="ov-grid">
        <section className="card strip">
          <div className="lead">
            <h2 className="h2">{copy.host.ovSettings}</h2>
            <Link href={`${base}/settings`} className="as-link">{copy.host.ovChange}</Link>
          </div>
          <div className="chips">
            <Chip label={copy.host.ovPlateChip} on={e.plate_enabled} />
            <Chip label={copy.host.ovGiftChip} on={e.group_gift_enabled} />
            <Chip label={copy.host.ovSplitChip} on={splitParty} />
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="h2">{copy.host.ovRecently}</h2>
            {feed.length > 0 && <Link href={`${base}/guests`} className="as-link">{copy.host.ovFullActivity}</Link>}
          </div>
          {feed.length === 0 ? (
            <p className="muted">{copy.host.ovNothingYet}</p>
          ) : (
            <ul className="rows trail">
              {feed.slice(0, 5).map((h, i) => (
                <li key={`${h.at}-${i}`} className={h.kind}>
                  <i className="dot" aria-hidden="true" />
                  <span className="what">
                    {/* The same sentence the full feed writes. It used to be built here, and
                        the drawer built its own, which is how one of them came to name the
                        present and the other not. See lib/happening.ts. */}
                    {happeningLine(h)}
                    {/* The group tag stays. It is what tells two Sarahs apart, and on a
                        group-link open it is the only thing on the line that says which link was
                        opened, since the row belongs to nobody. */}
                    {h.group && <span className={`tag g${groupColour(h.group, groups)}`}>{h.group}</span>}
                    {/* Allergies, food and their note, under the reply they came with. Same as
                        the drawer, because a host reading the five most recent things should not
                        have to open anything to find out somebody cannot eat nuts. */}
                    {h.said?.map((line, j) => <span key={j} className={`said${line.warn ? " warn" : ""}`}>{line.text}</span>)}
                  </span>
                  <span className="when">
                    {h.times && <span className="times">{copy.host.openedTimes(h.times)}</span>}
                    {relativeTime(h.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="h2">{copy.host.ovFoodNeeds}</h2>
          <dl className="needs">
            {/* Allergies first and named. It is the one thing here somebody has to act on rather
                than read past, so it is never summed into a count beside the diets. */}
            <dt className="warn">{copy.host.trackAllergies}</dt>
            <dd>
              {allergies.length === 0
                ? <span className="muted">{copy.host.ovNoneYet}</span>
                : allergies.map((g) => `${g.name} (${g.allergies?.trim()})`).join(", ")}
            </dd>
            <dt>{copy.host.ovDiet}</dt>
            <dd>
              {diet.length === 0
                ? <span className="muted">{copy.host.ovNoneYet}</span>
                : diet.map(([chip, n]) => `${n} ${chip.toLowerCase()}`).join(", ")}
            </dd>
          </dl>
        </section>
      </div>
    </>
  );
}

// "5 kids / 5 adults", and "5 kids / 5 adults / 1 didn't say" where the headline is bigger than
// the two halves. The slash is the design's, and the halves only appear when they exist, which
// copy.host.split already decides.
//
// The tail is the fix for the thing that reads as an arithmetic error. A guest who said yes with
// a party size and no breakdown is one person in the total and nobody in either half, which is
// honest and looks like a mistake, so the line says it out loud instead.
function splitLine(kids: number, adults: number, total: number): string {
  const unsaid = total - kids - adults;
  return [copy.host.split(kids, adults), unsaid > 0 ? copy.host.splitUnsaid(unsaid) : null]
    .filter(Boolean).join(", ").replace(/, /g, " / ");
}

function Chip({ label, on }: { label: string; on: boolean | null }) {
  return <span className={`chip${on ? " on" : ""}`}>{label} · {on ? copy.host.ovOn : copy.host.ovOff}</span>;
}
