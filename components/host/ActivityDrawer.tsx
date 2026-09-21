"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { formatDateTime } from "@/lib/format";
import type { Happening } from "@/lib/db/activity";
import { Sheet } from "./Sheet";
import { groupColour } from "@/lib/group-colours";

// Everything that has happened, behind a button.
//
// Behind one, rather than on the page, because it is the only thing on this screen that is not a
// number: it is eighty lines of detail that answer "what changed" rather than "where are we", and
// a host opens this screen for the second question far more often than the first. It is one tap
// away when they want it and none of the page when they do not.
export function ActivityDrawer({ feed, groups }: { feed: Happening[]; groups: string[] }) {
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
                  {/* What they wrote with the reply, under the reply. It used to live only on
                      the guest list, which meant reading "Sarah said yes" here and then going
                      somewhere else to find out she had told you about a nut allergy. The one
                      thing a host has to act on was the one thing this screen left out. */}
                  {h.said?.map((line, j) => <span key={j} className={`said${line.warn ? " warn" : ""}`}>{line.text}</span>)}
                  {/* The group beside the time rather than in the sentence, so the line still
                      reads as a sentence. It is there to tell which Sarah, and a host who works
                      through the neighbours on Tuesday can find them without reading the names. */}
                  <span className="t">
                    {formatDateTime(h.at)}
                    {h.group && <span className={`tag g${groupColour(h.group, groups)}`}>{h.group}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Sheet>
      )}
    </>
  );
}
