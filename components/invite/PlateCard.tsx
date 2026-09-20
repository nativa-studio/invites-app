"use client";
import { useActionState, useState } from "react";
import { copy } from "@/lib/copy";
import type { Plate } from "@/lib/guest/plate";
import { plateAction, type PlateState } from "@/app/i/[token]/plate-actions";
import { Bolt, Plate as PlateIcon } from "@/components/art/icons";

// The board, on the invite, for a guest who has said yes.
//
// It sits under the reply and nowhere else. What to bring is a question for somebody who is
// coming: before that it is noise on a page whose whole job is deciding, and a dish claimed by
// somebody who then says no is a dish nobody is carrying.
//
// Every tap posts to one action and gets the whole board back, so what is on the screen is what
// is in the database rather than what the tap hoped for. That is not tidiness: two guests tap the
// last pavlova within the same minute, and the second one has to see the first one's name rather
// than a claim that quietly did nothing.
//
// The allergy line is counts. No names, no notes. A guest wrote "Ada carries an epipen" in a box
// meant for the host, and it is not going on a board forty people can read.
export function PlateCard({ token, plate }: { token: string; plate: Plate }) {
  const [state, act, pending] = useActionState<PlateState, FormData>(plateAction, { plate });
  const board = state.plate ?? plate;
  const [adding, setAdding] = useState(false);

  const allergies = board.allergies.map((a) => copy.plate.allergy(a.n, a.chip)).join(", ");
  const mine = board.items.filter((i) => i.mine);
  const needed = board.items.filter((i) => !i.claimed);
  // Somebody else has these. Named, so a guest can see what is already handled and not turn up
  // with a second pavlova, but run together rather than listed: there is nothing to tap on
  // another guest's dish, and eight more rows is most of a screen on a page that is already long.
  const covered = board.items.filter((i) => i.claimed && !i.mine);

  const row = (i: (typeof board.items)[number]) => (
    <li className="dish" key={i.id}>
      <PlateIcon size={32} />
      <div className="what">
        <span className="n">{i.label}</span>
        {/* Kept whole. "nut free" broken over two lines reads as two things. */}
        {i.tags.length > 0 && <span className="b"><span className="tags">{i.tags.join(", ")}</span></span>}
      </div>
      <form action={act}>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="item" value={i.id} />
        <input type="hidden" name="what" value={i.mine ? "unclaim" : "claim"} />
        <button className={`pbtn small${i.mine ? "" : " primary"}`} type="submit" disabled={pending}>
          {i.mine ? copy.plate.unclaim : copy.plate.claim}
        </button>
      </form>
    </li>
  );

  return (
    // Cream paper, tilted, heading in the display face between two bolts: the same card the
    // reply and the thank you are, because they are the same kind of thing. It was white with a
    // tape strip and a small label, which is the family the details and the runsheet belong to:
    // cards you read. This is a card you act on, and it should look like the other one of those.
    <div className="pcard tilt-r plate" data-section="plate">
      <div className="rsvp-h"><Bolt size={24} /> {copy.plate.heading} <Bolt size={24} /></div>
      <p className="para">{board.host_note || (board.mode === "everyone" ? copy.plate.everyone : copy.plate.free)}</p>
      {allergies && <p className="allergy">{copy.plate.allergies(allergies)}</p>}

      {board.items.length === 0 && <p className="small">{copy.plate.empty}</p>}

      {/* Grouped, so the status line on every row can go.
          It used to be one list where each dish said what it was doing: nobody yet, someone's
          bringing this, you're bringing this. Three groups say the same thing once each, which
          makes every row shorter and puts the only two rows a guest can act on together at the
          top. What other people have taken collapses to a count, because a guest's job here is
          picking from what is left, and what is covered is worth seeing but not worth a row
          each. */}
      {mine.length > 0 && (
        <>
          <div className="dishgroup">{copy.plate.yoursHeading}</div>
          <ul className="dishes">{mine.map((i) => row(i))}</ul>
        </>
      )}

      {needed.length > 0 && (
        <>
          <div className="dishgroup">{copy.plate.neededHeading}</div>
          <ul className="dishes">{needed.map((i) => row(i))}</ul>
        </>
      )}

      {covered.length > 0 && (
        <>
          <div className="dishgroup">{copy.plate.coveredHeading}</div>
          {/* Names only, and no buttons: another guest's dish is not yours to touch. Middot
              rather than comma, because "Sausage rolls, the good ones" is a real thing somebody
              types and in a comma run it reads as two dishes. */}
          <p className="run">
            {covered.map((i, n) => (
              <span key={i.id}>{n > 0 && " \u00b7 "}{i.label}</span>
            ))}
          </p>
        </>
      )}
      {needed.length === 0 && mine.length === 0 && board.items.length > 0 && (
        <p className="small">{copy.plate.allCovered}</p>
      )}

      {state.error && <div className="err" role="alert">{state.error}</div>}

      {/* Shut until it is wanted. An open box with a cursor in it on a page a guest came to read
          asks them to think of something, and most of them are here to claim what is already
          listed. */}
      {adding ? (
        <form action={act} className="addplate">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="what" value="add" />
          <div className="q">
            <label htmlFor="label">{copy.plate.addLabel}</label>
            <input id="label" name="label" type="text" placeholder={copy.plate.addPlaceholder} autoComplete="off" required />
          </div>
          <div className="q">
            <span className="ql">{copy.plate.addTags}</span>
            <div className="chips">
              {["nut free", "gluten free", "dairy free", "vegan"].map((t) => (
                <label className="chip" key={t}><input type="checkbox" name="tags" value={t} />{t}</label>
              ))}
            </div>
          </div>
          <button className="pbtn primary" type="submit" disabled={pending}>{copy.plate.add}</button>
        </form>
      ) : (
        <button type="button" className="pbtn small" onClick={() => setAdding(true)}>{copy.plate.addHeading}</button>
      )}
    </div>
  );
}
