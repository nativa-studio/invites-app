"use client";
import { useActionState, useState } from "react";
import { copy } from "@/lib/copy";
import type { Plate } from "@/lib/guest/plate";
import { plateAction, type PlateState } from "@/app/i/[token]/plate-actions";
import { Plate as PlateIcon } from "@/components/art/icons";

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

  return (
    <div className="pcard white plate" data-section="plate">
      <div className="tape sky" />
      <div className="label sky">{copy.plate.heading}</div>
      <p className="para">{board.host_note || (board.mode === "everyone" ? copy.plate.everyone : copy.plate.free)}</p>
      {allergies && <p className="allergy">{copy.plate.allergies(allergies)}</p>}

      {board.items.length === 0 && <p className="small">{copy.plate.empty}</p>}

      <ul className="dishes">
        {board.items.map((i) => (
          <li className={i.claimed ? "dish taken" : "dish"} key={i.id}>
            <PlateIcon size={32} />
            <div className="what">
              <span className="n">{i.label}</span>
              <span className="b">
                {/* Yours, taken, or free. Never whose: the board used to name whoever had
                    claimed each dish, which turned a list of what is still needed into a
                    register of the neighbours for anybody holding a link. */}
                {i.mine ? copy.plate.mine : i.claimed ? copy.plate.taken : copy.plate.nobody}
                {/* Kept whole. "nut free" broken over two lines reads as two things. */}
                {i.tags.length > 0 && <span className="tags"> · {i.tags.join(", ")}</span>}
              </span>
            </div>
            <form action={act}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="item" value={i.id} />
              <input type="hidden" name="what" value={i.mine ? "unclaim" : "claim"} />
              {(i.mine || !i.claimed) && (
                <button className="pbtn small" type="submit" disabled={pending}>
                  {i.mine ? copy.plate.unclaim : copy.plate.claim}
                </button>
              )}
            </form>
          </li>
        ))}
      </ul>

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
