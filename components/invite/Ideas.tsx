"use client";
import React from "react";
import type { WishlistItem } from "@/lib/db/types";
import { wishAction } from "@/app/i/[token]/gift-actions";
import { useReply } from "./ReplyState";

// The wish list, as a sentence, with a line through the ones somebody has already got.
//
// A guest taps an idea and it goes through. That is the whole of it: no label over it, no note
// under it, nothing that says a tap is available. Marcia: "really subtle, I don't want to impose
// anything, so you don't say anything." She will cross one or two off herself, and the rest of
// the list explains itself from that.
//
// Still a sentence, not a column of tick boxes. Ten presents set out as a form is a chore handed
// to somebody who came to read an invitation, and it would be the loudest thing on the card.
//
// Two ideas are never crossable:
//
//   - The first one. It is the general one, the sentence about the kind of thing he likes rather
//     than a thing anybody can buy, so crossing it off would say the whole list was taken. The
//     database refuses it too, in wish_claim, which is the half that matters.
//   - Any idea with a link on it. The label is the link, and one piece of text cannot both open a
//     shop and cross itself out. The link is the host pointing at the exact one, so it wins.
export function Ideas({ list }: { list: WishlistItem[] }) {
  const ctx = useReply();
  const token = ctx?.reply.token ?? "";
  const pretend = ctx?.reply.pretend;
  const report = ctx?.report;
  const state = ctx?.reply.wishes ?? null;
  const by = new Map((state ?? []).map((w) => [w.id, w]));
  // Only somebody holding their own link may cross one off. The group link has no token until
  // somebody replies, and it drew tappable words anyway: they struck through, wrote nothing, and
  // came back plain on the next load, which is the invite telling a guest something it had not
  // done. Crossed is still drawn there, because the list has to read the same through every door.
  //
  // A host trying their own invite is let through on pretend, which is the arrangement the plate
  // and the tick both use: everything works, nothing is written.
  const live = Boolean(token) || Boolean(pretend);

  // Drawn at once, sent afterwards. A tap that waits for a round trip before the line appears
  // reads as a tap that did nothing, and this one is worth almost nothing to the person making
  // it: they are doing the host a favour, and it has to cost them nothing.
  //
  // What comes back replaces it. Two guests on one invite is the normal case, so somebody else
  // may have taken the scooter while this page sat open, and wish_claim refuses a second claim
  // rather than overwriting the first. The answer to a refusal is to draw what is true.
  async function toggle(id: string, on: boolean) {
    if (!report) return;
    report({ wishes: (state ?? []).map((w) => (w.id === id ? { ...w, claimed: on, mine: on } : w)) });
    if (pretend || !token) return;
    const fresh = await wishAction(token, id, on);
    if (fresh) report({ wishes: fresh });
  }

  return (
    <p className="para ideas">
      {list.map((w, i) => (
        <React.Fragment key={`${w.label}-${i}`}>
          {word(w, i)}
          {joiner(i, list.length)}
        </React.Fragment>
      ))}
    </p>
  );

  function word(w: WishlistItem, i: number) {
    if (w.url) return <a href={w.url} target="_blank" rel="noreferrer">{w.label}</a>;
    const st = w.id ? by.get(w.id) : undefined;
    // Nothing to tap. The first idea, an item with no entry yet (the group link before its own
    // fetch, or an older payload), or a page with no provider at all. It still wears its line if
    // it has one: a host who drags a crossed off idea to the top has not un-bought it, and the
    // strike is the truth about the present rather than a property of the tap.
    if (i === 0 || !st || !report || !live) return st?.claimed ? <s className="gone">{w.label}</s> : w.label;
    // Somebody else has it. Not a button: there is nothing here for this guest to do, and a
    // control that answers a tap by doing nothing is worse than plain words.
    if (st.claimed && !st.mine) return <s className="gone">{w.label}</s>;
    return (
      <button
        type="button"
        className={`crossable${st.claimed ? " gone" : ""}`}
        // The only thing said out loud, and only to a screen reader, which cannot see a line
        // through a word. Pressed is the state, the label is the present, and there is no third
        // thing to explain.
        aria-pressed={st.claimed}
        onClick={() => { void toggle(st.id, !st.claimed); }}
      >
        {w.label}
      </button>
    );
  }
}

// ", " between, " and " before the last. The same shape sentenceList gives, written out here
// because the labels can carry links and buttons, and a joined string cannot.
function joiner(i: number, n: number): string {
  if (i >= n - 1) return "";
  return i === n - 2 ? " and " : ", ";
}
