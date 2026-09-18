"use client";
import { useEffect, useRef } from "react";

// The sheet that slides up from the bottom, and the only one.
//
// Everything a host does in one of these behaves the same way: it takes focus when it appears so
// Escape works and a screen reader lands on it, it closes on the backdrop or the button, and it
// refuses to close on the backdrop while there is unsaved work to lose.
//
// `dirty` is the caller's, because only the caller knows whether anything has been typed. When it
// is true the backdrop stops closing and the button says Discard, so the only way to lose a change
// is to say so.
export function Sheet({
  title, blurb, dirty, onClose, children,
}: {
  title: string;
  blurb?: string;
  dirty?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const leave = () => { if (!dirty) onClose(); };

  // The tap that opened this may have come from a frame or a button elsewhere on the page, so
  // that is where the keyboard still is. Moving focus here is what makes Escape work at all.
  useEffect(() => { sheet.current?.focus(); }, []);

  return (
    <div className="sheet-back" onClick={leave} role="presentation">
      <div
        className="sheet"
        ref={sheet}
        tabIndex={-1}
        onClick={(ev) => ev.stopPropagation()}
        onKeyDown={(ev) => { if (ev.key === "Escape") leave(); }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-head">
          <h2 className="h2">{title}</h2>
          <button type="button" className="btn small" onClick={onClose}>{dirty ? "Discard" : "Close"}</button>
        </div>
        {blurb && <p className="hint">{blurb}</p>}
        {children}
      </div>
    </div>
  );
}
