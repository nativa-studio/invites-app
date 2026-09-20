"use client";
import { useActionState } from "react";
import { copy } from "@/lib/copy";
import { formatMoney, firstName } from "@/lib/format";
import { smsLink, whatsappLink } from "@/lib/messages";
import type { GiftBoard } from "@/lib/guest/gift";
import { organiserAction, type BoardState } from "@/app/i/[token]/organiser/actions";
import { Gift as GiftIcon } from "@/components/art/icons";

// The organiser's own page, in the order the job happens.
//
// First their details, because until those are filled in nobody can do anything and the block on
// everybody's invite says so. Then the update box, which is how they tell forty people one thing
// without starting forty conversations. Then who has chipped in, and last the chase list, because
// it is the only part that asks them to go and do something to somebody else.
//
// Whole names here, and amounts. This is the one screen in the app where both belong: they are
// running the money and cannot chase "S." for "an amount".
export function OrganiserBoard({ token, board, link, eventTitle }: {
  token: string;
  board: GiftBoard;
  link: string;
  eventTitle: string;
}) {
  const [state, act, pending] = useActionState<BoardState, FormData>(organiserAction, { board });
  const b = state.board ?? board;
  const what = b.description || eventTitle;
  const nudge = (name: string) => copy.organiser.nudgeBody(firstName(name), what, link);

  return (
    <div className="orgwrap">
      <div className="pcard white">
        <div className="tape yel" />
        <GiftIcon size={44} />
        <h1 className="rsvp-h">{copy.organiser.title}</h1>
        <p className="para">{b.description ? copy.organiser.yours(b.description) : copy.organiser.yoursNoWhat}</p>
      </div>

      <form action={act} className="pcard white">
        <div className="label sky">{copy.organiser.setup}</div>
        <p className="small">{copy.organiser.setupBlurb}</p>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="what" value="save" />

        <div className="q">
          <label htmlFor="pay_details">{copy.organiser.payLabel}</label>
          <textarea id="pay_details" name="pay_details" rows={3} defaultValue={b.pay_details ?? ""} />
          <span className="hint">{copy.organiser.payHint}</span>
        </div>
        <div className="q">
          <label htmlFor="pay_reference">{copy.organiser.refLabel}</label>
          <input id="pay_reference" name="pay_reference" type="text" autoComplete="off" defaultValue={b.pay_reference ?? ""} />
          <span className="hint">{copy.organiser.refHint}</span>
        </div>
        <div className="q">
          <label htmlFor="message">{copy.organiser.msgLabel}</label>
          <textarea id="message" name="message" rows={3} defaultValue={b.message ?? ""} />
          <span className="hint">{copy.organiser.msgHint}</span>
        </div>
        <div className="q">
          <label htmlFor="suggested">{copy.organiser.amountLabel}</label>
          <input id="suggested" name="suggested" type="text" inputMode="decimal" autoComplete="off" defaultValue={b.suggested_amount ?? ""} />
        </div>
        <div className="q">
          <label htmlFor="chip_in_by">{copy.organiser.byLabel}</label>
          <input id="chip_in_by" name="chip_in_by" type="date" defaultValue={b.chip_in_by ?? ""} />
        </div>
        {/* A real, visible checkbox. It was a chip, which is right for dietary needs where a row
            of them is read as a set, and wrong for one switch carrying a sentence: checked drew
            as a solid navy button and unchecked as an outlined one, so the only way to know
            whether the surprise was on was to remember which way you had left it. */}
        <label className="orgswitch">
          <input type="checkbox" name="surprise" defaultChecked={b.surprise} />
          <span>
            {copy.organiser.surprise}
            <span className="hint">{copy.organiser.surpriseHint}</span>
          </span>
        </label>

        <button className="pbtn primary" type="submit" disabled={pending}>{copy.organiser.save}</button>
        {state.saved === "save" && !state.error && <p className="small" role="status">{copy.organiser.saved}</p>}
      </form>

      <form action={act} className="pcard white">
        <div className="label sky">{copy.organiser.updateHeading}</div>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="what" value="update" />
        <div className="q">
          <label htmlFor="latest_update">{copy.organiser.updateLabel}</label>
          <input id="latest_update" name="latest_update" type="text" autoComplete="off" defaultValue={b.latest_update ?? ""} />
          <span className="hint">{copy.organiser.updateHint}</span>
        </div>
        <button className="pbtn" type="submit" disabled={pending}>{copy.organiser.post}</button>
        {state.saved === "update" && !state.error && <p className="small" role="status">{copy.organiser.saved}</p>}
      </form>

      <div className="pcard white">
        <div className="label yel">{copy.organiser.whoHeading}</div>
        <p className="para">
          {b.target ? copy.organiser.totalOf(formatMoney(b.total), formatMoney(b.target)) : copy.organiser.total(formatMoney(b.total))}
        </p>
        {b.contributors.length === 0 ? (
          <p className="small">{copy.organiser.none}</p>
        ) : (
          <ul className="who">
            {b.contributors.map((c) => (
              <li key={`${c.name}-${c.at}`}>
                <span className="n">{c.name}</span>
                <span className="b">{c.amount != null ? formatMoney(c.amount) : copy.organiser.noAmount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pcard white">
        <div className="label sky">{copy.organiser.waitingHeading}</div>
        {b.waiting.length === 0 ? (
          <p className="small">{copy.organiser.allIn}</p>
        ) : (
          <ul className="who">
            {b.waiting.map((g) => (
              <li key={g.id}>
                <span className="n">{g.name}</span>
                {/* No number on file means no button, rather than a button that opens an empty
                    message and looks like it failed. */}
                {g.phone && (
                  <span className="b">
                    <a className="pbtn small" href={smsLink(g.phone, nudge(g.name))}>{copy.organiser.nudge}</a>
                    <a className="pbtn small" href={whatsappLink(g.phone, nudge(g.name))}>{copy.organiser.nudgeWhatsapp}</a>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {state.error && <div className="err" role="alert">{state.error}</div>}
    </div>
  );
}
