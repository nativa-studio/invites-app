"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { formatMoney, formatShortDate } from "@/lib/format";
import type { Gift } from "@/lib/guest/gift";
import { giftAction, type GiftState } from "@/app/i/[token]/gift-actions";
import { Gift as GiftIcon } from "@/components/art/icons";

// The group gift, on the invite, for a guest who has answered.
//
// It sits under the reply, with the plate, because it is a thing for somebody who has already
// decided. A guest still reading the date is deciding whether to come, and a question about money
// in the middle of that is the wrong question at the wrong moment. Somebody who said no still
// gets it: not being able to come and wanting to chip in are different things.
//
// No money moves through this. The organiser has typed where to send it and the guest pays them
// however they already pay people. The tick is the whole feature: it is what stops the organiser
// asking the same person three times and what stops somebody being quietly left off the card.
export function GiftCard({ token, gift }: { token: string; gift: Gift }) {
  const [state, act, pending] = useActionState<GiftState, FormData>(giftAction, { gift });
  const g = state.gift ?? gift;
  // The amount box opens on tapping the tick rather than sitting there, because the amount is
  // optional and an open box with a cursor in it does not read as optional.
  const [saying, setSaying] = useState(false);

  if (!g.enabled) return null;
  const who = g.organiser;
  const amount = formatMoney(g.suggested_amount);

  return (
    // Cream, with two bits of tape crossed over each other and the heading in red above the
    // present. Deliberately not the plate's card: they sit one under the other and telling them
    // apart at a glance is worth more than making them a matched set. The plate is the white one
    // with the blue tape, this is the cream one with the cross.
    <div className="pcard cream gift" data-section="gift">
      <div className="tape yel cross" />
      <div className="tape sky over" />
      <div className="label red">{copy.gift.heading}</div>
      <GiftIcon size={36} />

      {/* Four ways this reads, because both halves can be missing. With no organiser it does not
          invent one: "Someone is organising it" is worse than not raising the question, and the
          fallback used to be the heading itself, which put "Group gift" on the card twice. */}
      <p className="para">
        {who
          ? g.description ? copy.gift.running(who, g.description) : copy.gift.runningNoWhat(who)
          : g.description ? copy.gift.noOrganiser(g.description) : copy.gift.noOrganiserNoWhat}
      </p>

      {/* Nothing to ask anybody to do until the organiser has said where the money goes, so the
          block says so rather than showing an empty how to pay. */}
      {!g.ready ? (
        <p className="small">{who ? copy.gift.sorting(who) : copy.gift.sortingNoName}</p>
      ) : (
        <>
          {g.message && <p className="para">{g.message}</p>}
          {g.suggested_amount != null && <p className="small">{copy.gift.suggested(amount)}</p>}
          {g.chip_in_by && <p className="small">{copy.gift.by(formatShortDate(g.chip_in_by))}</p>}

          <div className="howto">
            <span className="ql">{copy.gift.howTo}</span>
            {/* Whitespace kept, because bank details are four lines and a BSB is not a sentence. */}
            <p className="pay">{g.pay_details}</p>
            {g.pay_reference && (
              <p className="small">{who ? copy.gift.reference(g.pay_reference, who) : copy.gift.referenceNoName(g.pay_reference)}</p>
            )}
          </div>

          {g.latest_update && (
            <p className="latest"><span className="ql">{copy.gift.update}</span> {g.latest_update}</p>
          )}

          <p className="small">{g.chipped_count === 0 ? copy.gift.countNone : copy.gift.count(g.chipped_count)}</p>

          {g.chipped_in ? (
            <form action={act}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="what" value="unchip" />
              <p className="done">{copy.gift.ticked}{g.my_amount != null && ` ${formatMoney(g.my_amount)}.`}</p>
              <button className="pbtn small" type="submit" disabled={pending}>{copy.gift.untick}</button>
            </form>
          ) : saying ? (
            <form action={act} className="chipin">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="what" value="chip" />
              <div className="q">
                <label htmlFor="amount">{copy.gift.amountLabel}</label>
                <input id="amount" name="amount" type="text" inputMode="decimal" autoComplete="off" placeholder={amount || "$20"} />
                <span className="hint">{copy.gift.amountHint}</span>
              </div>
              <button className="pbtn primary" type="submit" disabled={pending}>{copy.gift.send}</button>
            </form>
          ) : (
            <button type="button" className="pbtn primary" onClick={() => setSaying(true)}>{copy.gift.tick}</button>
          )}
        </>
      )}

      {state.error && <div className="err" role="alert">{state.error}</div>}

      {/* Only the organiser sees this, and only on their own link. */}
      {g.is_organiser && (
        <Link className="pbtn small" href={`/i/${token}/organiser`}>{copy.organiser.title}</Link>
      )}
    </div>
  );
}
