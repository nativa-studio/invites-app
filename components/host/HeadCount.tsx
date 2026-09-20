"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import type { GuestRow } from "@/lib/db/types";
import { Sheet } from "./Sheet";
import { counts, type Heads } from "@/lib/heads";

// How many people, counted twice on purpose.
//
// A host asks "how many am I catering for" long before everyone has replied, and the honest
// answer has two halves that do not agree: the numbers they pencilled in when they added each
// household, and the numbers guests have actually given back. The first is a plan and the second
// is a fact, and the gap between them is the thing worth looking at, because it is how many
// replies are still out.
//
// Nothing here is editable, so it opens a sheet rather than a form. The per-guest numbers are
// changed on the guest's own row, which is where a host knows whose they are.

export function HeadCount({ guests, splitParty }: { guests: GuestRow[]; splitParty: boolean }) {
  const [open, setOpen] = useState(false);
  const c = counts(guests, splitParty);

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2 className="h2">{copy.host.headsHeading}</h2>
          <button type="button" className="btn small" onClick={() => setOpen(true)}>{copy.host.headsOpen}</button>
        </div>
        <dl className="sum">
          <dt>{copy.host.headsExpectedShort}</dt>
          <dd>{c.expected.total}</dd>
          <dt>{copy.host.headsRepliedShort}</dt>
          <dd>{c.replied.total}</dd>
        </dl>
      </section>

      {open && (
        <Sheet title={copy.host.headsHeading} blurb={copy.host.headsBlurb} onClose={() => setOpen(false)}>
          <div className="sheet-body">
            <Block
              title={copy.host.headsExpected}
              hint={copy.host.headsExpectedHint(c.expected.from, guests.length)}
              heads={c.expected}
              split
            />
            <Block
              title={copy.host.headsReplied}
              hint={copy.host.headsRepliedHint(c.replied.from, c.waiting)}
              heads={c.replied}
              split={splitParty}
              noSplitHint={copy.host.headsNoSplit}
            />
          </div>
        </Sheet>
      )}
    </>
  );
}

// One set of numbers: the two halves, then what they come to.
function Block({ title, hint, heads, split, noSplitHint }: {
  title: string;
  hint: string;
  heads: Heads;
  split: boolean;
  noSplitHint?: string;
}) {
  return (
    <section className="heads">
      <span className="label-ish">{title}</span>
      <div className="counts">
        {split ? (
          <>
            <div className="count"><b>{heads.kids}</b><span>{copy.host.headsKids}</span></div>
            <div className="count"><b>{heads.adults}</b><span>{copy.host.headsAdults}</span></div>
          </>
        ) : null}
        <div className="count"><b>{heads.total}</b><span>{copy.host.headsAll}</span></div>
      </div>
      <p className="hint">{hint}{!split && noSplitHint ? ` ${noSplitHint}` : ""}</p>
    </section>
  );
}
