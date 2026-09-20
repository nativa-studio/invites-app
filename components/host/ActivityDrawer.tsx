"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { formatDateTime } from "@/lib/format";
import type { Happening } from "@/lib/db/activity";
import { Sheet } from "./Sheet";

// Everything that has happened, behind a button.
//
// Behind one, rather than on the page, because it is the only thing on this screen that is not a
// number: it is eighty lines of detail that answer "what changed" rather than "where are we", and
// a host opens this screen for the second question far more often than the first. It is one tap
// away when they want it and none of the page when they do not.
export function ActivityDrawer({ feed }: { feed: Happening[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2 className="h2">{copy.host.trackActivity}</h2>
          <button type="button" className="btn small" onClick={() => setOpen(true)} disabled={feed.length === 0}>
            {copy.host.trackActivityOpen}
          </button>
        </div>
        {feed.length === 0
          ? <p className="hint">{copy.host.trackActivityNone}</p>
          // The newest one, on the page, so the button is worth pressing. A drawer with no clue
          // what is inside it is a drawer nobody opens.
          : <p className="muted">{copy.host.did[feed[0].kind](feed[0].who)} · {formatDateTime(feed[0].at)}</p>}
      </section>

      {open && (
        <Sheet title={copy.host.trackActivity} blurb={copy.host.trackActivityBlurb} onClose={() => setOpen(false)}>
          <div className="sheet-body">
            <ol className="feed">
              {feed.map((h, i) => (
                <li key={`${h.at}-${i}`} className={h.kind}>
                  <span className="n">{copy.host.did[h.kind](h.who)}</span>
                  <span className="t">{formatDateTime(h.at)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Sheet>
      )}
    </>
  );
}
