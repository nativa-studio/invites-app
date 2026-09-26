"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { formatMoney, formatShortDate } from "@/lib/format";
import type { Gift } from "@/lib/guest/gift";
import { giftAction, tapAction, type GiftState } from "@/app/i/[token]/gift-actions";
import { useReply } from "./ReplyState";

// Chipping in, inside the gifts block, behind a button.
//
// It was a card of its own under the reply. That put the group gift on the invite twice: the
// block announced it and named the present, and then a second card a screen down said the same
// thing again with the bank details under it. Marcia: "delete the stand alone chip in block, add
// a button on chip in where the person clicks and they see the block with the how to chip in
// info."
//
// So this is the one place the group gift lives, and the money is one tap inside it. Shut to
// begin with for the same reason the rest of the block is: somebody reading about the present is
// not necessarily reaching for their phone banking, and bank details sitting open under a
// birthday invitation read like a bill.
//
// Nothing here is fetched. The gift arrives with the guest's own reply through ReplyState, the
// same way the plate board does, which is what lets this sit in the gifts block rather than
// under the reply that knows the answer.
export function ChipInSlot() {
  const ctx = useReply();
  // No provider is the host's editor drawing the invite with nobody answering. A guest who has
  // not replied gets the same line they always did: the money is behind their answer.
  if (!ctx) return <p className="small">{copy.gift.blockHow}</p>;
  const { token, gift, pretend } = ctx.reply;
  // No reply needed. Money was kept behind the RSVP while this was a card shoved under it, where
  // it interrupted somebody deciding whether to come. It is a quiet line inside the gifts block
  // now, behind a button, so it asks nothing of anybody who has not gone looking for it, and
  // somebody who wants to send something before they know their own plans can.
  //
  // Any answer or none, unlike the plate. Not being able to come and wanting to chip in are
  // different things, and somebody who has said no is often the keenest to send something.
  if (!gift?.enabled) return <p className="small">{copy.gift.blockHow}</p>;
  return <ChipIn token={token} gift={gift} pretend={pretend} />;
}

function ChipIn({ token, gift, pretend }: { token: string; gift: Gift; pretend?: boolean }) {
  const [state, act, pending] = useActionState<GiftState, FormData>(giftAction, { gift });
  // The host trying their own invite: the tick works and nothing is written. Same rule as the
  // plate board, and the reason it is not simply switched off is that a host checking their own
  // invite wants to see what a guest sees, working.
  const [local, setLocal] = useState<Gift>(gift);
  const g = pretend ? local : state.gift ?? gift;
  const [open, setOpen] = useState(false);

  const organiser = g.is_organiser
    ? <Link className="pbtn small" href={`/i/${token}/organiser`}>{copy.organiser.title}</Link>
    : null;

  // Nothing to ask anybody to do until the organiser has said where the money goes. The organiser
  // still gets their own link, because nothing else leads to the page where they fill that in.
  if (!g.ready) {
    return organiser ?? <p className="small">{g.organiser ? copy.gift.sorting(g.organiser) : copy.gift.sortingNoName}</p>;
  }

  if (!open) {
    return (
      <div className="chip-open">
        {/* Quiet. It is an optional disclosure on a card that is otherwise reading matter, and
            a full width red button inside it was the loudest thing on the invite. */}
        <button
          type="button"
          className="pbtn small quiet"
          onClick={() => {
            setOpen(true);
            if (token && !pretend) void tapAction(token, "chip");
          }}
        >
          {copy.gift.chipIn}
        </button>
        {g.chipped_in && <p className="small done">{copy.gift.ticked}</p>}
        {organiser}
      </div>
    );
  }

  return (
    <div className="chip-panel">
      {g.message && <p className="para">{g.message}</p>}
      {g.suggested_amount != null && <p className="small">{copy.gift.suggested(formatMoney(g.suggested_amount))}</p>}
      {g.chip_in_by && <p className="small">{copy.gift.by(formatShortDate(g.chip_in_by))}</p>}

      <div className="howto">
        {/* No "How to chip in" over it. The box is inside Group gift, behind a button marked Chip
            in, and holds a line beginning PayID: three labels deep for one short line of bank
            details, and the last of the three said nothing the other two had not. */}
        <div className="pay-row">
          {/* Whitespace kept, because bank details are four lines and a BSB is not a sentence. */}
          <p className="pay">{g.pay_details}</p>
          <Copy what={g.pay_details ?? ""} />
        </div>
        {g.pay_reference && <p className="small">{copy.gift.reference(g.pay_reference)}</p>}
      </div>

      {g.latest_update && (
        <p className="latest"><span className="ql">{copy.gift.update}</span> {g.latest_update}</p>
      )}

      {/* No count. "1 person has chipped in" is the organiser's bookkeeping read out to a guest
          who has just been shown a PayID, and both of the numbers it can say are wrong to put
          there: a small one reads as nobody is doing this, a big one as everybody has and you
          have not. Who has chipped in is on the organiser's own page, where it is somebody's job
          rather than somebody's business. */}
      {/* No tick without a guest to tick. The group link shows this block so that what to send and
          where is the same whichever door somebody came through, but who has chipped in is a note
          against one guest's row, and nobody on this page has one until they answer. */}
      {!token ? (
        <p className="small">{copy.gift.tickWithReply}</p>
      ) : g.chipped_in ? (
        <form {...(pretend
          ? { onSubmit: (ev: React.FormEvent<HTMLFormElement>) => { ev.preventDefault(); setLocal((v) => ({ ...v, chipped_in: false, chipped_count: Math.max(0, v.chipped_count - 1) })); } }
          : { action: act })}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="what" value="unchip" />
          <p className="done">{copy.gift.ticked}</p>
          <button className="pbtn small" type="submit" disabled={pending}>{copy.gift.untick}</button>
        </form>
      ) : (
        /* One tap, no second step. It asked How much, optional, with a Done under it: a form to
           fill in to say you had already done the thing, and the one field on it was one the
           guest did not have to answer and the host could not rely on. What the tick is for is
           the organiser knowing who to stop asking, and that does not need a number. */
        <form {...(pretend
          ? { onSubmit: (ev: React.FormEvent<HTMLFormElement>) => { ev.preventDefault(); setLocal((v) => ({ ...v, chipped_in: true, chipped_count: v.chipped_count + 1 })); } }
          : { action: act })}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="what" value="chip" />
          {/* Quiet: telling the organiser you have paid them is a note, not the moment the money
              moves, and the money moved in somebody's banking app a minute ago. */}
          <button className="pbtn small quiet" type="submit" disabled={pending}>{copy.gift.tick}</button>
        </form>
      )}

      {state.error && <div className="err" role="alert">{state.error}</div>}
      {organiser}
    </div>
  );
}

// One tap to take the PayID away with you.
//
// Reading a phone number off one app and typing it into your bank is where a digit gets dropped,
// and a dropped digit in a PayID is somebody else's money.
//
// The symbol every other app uses for this, beside the thing it copies, rather than a button
// reading "Copy": a word is a thing to read and this is a thing to recognise. It becomes a tick
// when it has worked, the same convention again, and the tick stays until the next tap, because
// a confirmation that fades before you look up from the keyboard has confirmed nothing.
//
// The name is on the button rather than in it, since there is no text to read it from. It says
// what will happen, then what happened, so a screen reader is not handed a nameless button.
//
// Wrapped, because the clipboard is refused outside a secure context and in some in-app
// browsers. Refused, the label says to copy it by hand and the details are still on the screen.
function Copy({ what }: { what: string }) {
  const [said, setSaid] = useState<"" | "done" | "no">("");
  if (!what) return null;
  const label = said === "done" ? copy.gift.copied : said === "no" ? copy.gift.copyFailed : copy.gift.copy;
  return (
    <button
      type="button"
      className="copy"
      aria-label={label}
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(what);
          setSaid("done");
        } catch {
          setSaid("no");
        }
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {said === "done"
          ? <path d="M20 6 9 17l-5-5" />
          : <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>}
      </svg>
    </button>
  );
}
