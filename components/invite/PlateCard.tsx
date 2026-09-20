"use client";
import { useActionState, useState } from "react";
import { copy } from "@/lib/copy";
import { sentenceList } from "@/lib/format";
import type { Plate } from "@/lib/guest/plate";
import { plateAction, type PlateState } from "@/app/i/[token]/plate-actions";
import { Bolt } from "@/components/art/icons";

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
// No allergy line. It said "Please keep in mind: 1 guest needs Dairy free" on the card where a
// guest claims a dish, which is the room's food needs counted up and put in front of forty
// people. Whoever is cooking needs that and has it, on the host's own potluck board.
export function PlateCard({ token, plate, pretend }: { token: string; plate: Plate; pretend?: boolean }) {
  const [state, act, pending] = useActionState<PlateState, FormData>(plateAction, { plate });
  // The host trying their own invite. Everything works and nothing is written, which is the same
  // rule the reply already follows there: a preview has no guest row and no token, and a host
  // claiming a dish at their own party must not turn up on their own list.
  //
  // It was inert instead, which made the one screen built to answer "what do my guests get" the
  // one screen where you could not find out.
  const [local, setLocal] = useState<Plate>(plate);
  const board = pretend ? local : state.plate ?? plate;
  const [adding, setAdding] = useState(false);

  const toggle = (id: string) => setLocal((b) => ({
    ...b,
    items: b.items.map((i) => (i.id === id ? { ...i, mine: !i.mine, claimed: !i.mine } : i)),
  }));
  const addLocal = (label: string, tags: string[]) => setLocal((b) => ({
    ...b,
    items: [...b.items, { id: `p${b.items.length}`, label, quantity: null, tags, claimed: true, mine: true, added_by_me: true }],
  }));

  const mine = board.items.filter((i) => i.mine);
  const needed = board.items.filter((i) => !i.claimed);
  // Somebody else has these. Named, so a guest can see what is already handled and not turn up
  // with a second pavlova, but run together rather than listed: there is nothing to tap on
  // another guest's dish, and eight more rows is most of a screen on a page that is already long.
  const covered = board.items.filter((i) => i.claimed && !i.mine);

  // A tile, two to a row. Every dish is the same shape whether it is yours or going, so the
  // board reads as a set of things to press rather than a table to study, and two across fits
  // eight dishes in the space four rows used.
  //
  // Yours is the filled one with the stamp on it. It says Yours rather than an instruction,
  // because it is already done, and pressing it is how you undo that.
  const face = (i: (typeof board.items)[number]) => (
    <>
      <span className="n">{i.label}</span>
      <span className="do">{i.mine ? copy.plate.mine : copy.plate.claim}</span>
      {i.tags.length > 0 && <span className="tg">{i.tags.join(", ")}</span>}
      {i.mine && <span className="stamp"><Bolt size={16} /></span>}
    </>
  );

  const row = (i: (typeof board.items)[number]) => (
    <li key={i.id}>
      {pretend ? (
        <button type="button" className={`dishtile${i.mine ? " mine" : ""}`} onClick={() => toggle(i.id)}>{face(i)}</button>
      ) : (
        <form action={act}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="item" value={i.id} />
          <input type="hidden" name="what" value={i.mine ? "unclaim" : "claim"} />
          <button type="submit" className={`dishtile${i.mine ? " mine" : ""}`} disabled={pending}>{face(i)}</button>
        </form>
      )}
    </li>
  );

  return (
    // Paper, one strip of tape, the heading in red. Every dish is a bar rather than a row, so
    // the whole thing is one tap wide and the board reads as a set of things to press rather
    // than a table to study.
    <div className="pcard tilt-r plate" data-section="plate">
      {/* One at each top corner, the way a sheet of paper actually gets stuck up. Not the pair
          crossed over each other in the middle, which is the gift card's and stays there. */}
      <div className="tape tl" />
      <div className="tape tr" />
      <div className="label red">{copy.plate.heading}</div>
      <p className="para">{board.host_note || (board.mode === "everyone" ? copy.plate.everyone : copy.plate.free)}</p>

      {board.items.length === 0 && <p className="small">{copy.plate.empty}</p>}

      {/* Yours first, because it is the one that is already settled, then everything still
          going. No headings over either: the bars say which is which themselves. */}
      {(mine.length > 0 || needed.length > 0) && (
        <ul className="dishtiles">
          {mine.map((i) => row(i))}
          {needed.map((i) => row(i))}
        </ul>
      )}

      {/* A link rather than a button. Claiming one of the host's ideas is the main thing here
          and adding your own is the other option, so it should not compete with the bars for
          the eye, and it sits with them because that is the moment it occurs to somebody. */}
      {adding ? (
        <form
          className="addplate"
          {...(pretend
            ? { onSubmit: (ev: React.FormEvent<HTMLFormElement>) => {
                ev.preventDefault();
                const f = new FormData(ev.currentTarget);
                const label = String(f.get("label") ?? "").trim();
                if (!label) return;
                addLocal(label, f.getAll("tags").map(String));
                setAdding(false);
              } }
            : { action: act })}
        >
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
        <button type="button" className="pbtn quiet" onClick={() => setAdding(true)}>{copy.plate.addHeading}</button>
      )}

      {/* What other people have, as a sentence. It was tags, and before that a list, and before
          that a row each. A guest reads this once, to know they are not the second pavlova, so
          it should take one line of reading and no decisions. */}
      {covered.length > 0 && (
        <>
          <div className="rule" />
          <p className="ontable">
            {copy.plate.onTable}{" "}
            <span className="names">{sentenceList(covered.map((i) => i.label))}</span>
          </p>
        </>
      )}

      {needed.length === 0 && mine.length === 0 && board.items.length > 0 && (
        <p className="small">{copy.plate.allCovered}</p>
      )}

      {state.error && <div className="err" role="alert">{state.error}</div>}
    </div>
  );
}
