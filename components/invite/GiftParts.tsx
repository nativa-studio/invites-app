"use client";
import { useState } from "react";
import { tapAction } from "@/app/i/[token]/gift-actions";
import { useReply } from "./ReplyState";

// Ideas and Group gift, side by side, one open at a time.
//
// They were two disclosures stacked one above the other. Side by side they read as a choice
// rather than a list, which is what they are: two different things a guest might want, and
// nobody wants both at once. Opening one shuts the other, so the card never grows to the height
// of both, and tapping the open one shuts it again.
//
// A client component with the panels handed in as children, rather than the native details and
// summary the stacked version used. Two summaries on one row with a full width panel underneath
// cannot be done with details without display:contents on the element itself, which takes the
// open and shut behaviour with it in some browsers. So the disclosure is written out here and
// what is inside the panels stays server rendered: this file holds the state and none of the
// content.
export function GiftParts({ parts }: {
  /** Label and panel for each part, in order. A part with no panel is not offered: the block
   *  never shows a title that opens onto nothing. */
  parts: { key: string; label: string; panel: React.ReactNode }[];
}) {
  const shown = parts.filter((p) => p.panel);
  const [open, setOpen] = useState<string | null>(null);
  // Only on the way open, and only for somebody holding their own link. Shutting a part is not a
  // thing a host needs to know, the group link has no token until somebody replies, and the
  // editor has no provider at all. Fire and forget: nothing on the screen waits for it, and a
  // measurement that can hold up an invitation is worse than no measurement.
  const ctx = useReply();
  const token = ctx?.reply.token ?? "";
  const pretend = ctx?.reply.pretend;
  if (shown.length === 0) return null;
  const here = shown.find((p) => p.key === open);

  return (
    <div className="gift-parts">
      <div className={`tabs${shown.length === 1 ? " one" : ""}`}>
        {shown.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`label sky small-label tab${open === p.key ? " on" : ""}`}
            aria-expanded={open === p.key}
            aria-controls="gift-part-panel"
            onClick={() => {
              const next = open === p.key ? null : p.key;
              setOpen(next);
              if (next && token && !pretend) void tapAction(token, p.key as "ideas" | "group");
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* One panel, full width under both titles, so the long one is not squeezed into half a
          phone. It keeps its id whether or not anything is open, because the buttons point at it
          and a control pointing at nothing is worse than a control pointing at an empty box. */}
      <div id="gift-part-panel" className="gift-panel">{here?.panel}</div>
    </div>
  );
}
