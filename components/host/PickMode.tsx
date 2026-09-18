"use client";
import { useEffect } from "react";

// Turns the host's preview into something you can point at. Every part of the invite carries a
// data-section name; this catches a tap anywhere inside one and tells the page holding the frame
// which part was meant. It runs only when the preview is asked for it, so a guest's invite never
// has a listener on it.
//
// Links and buttons inside the invite are swallowed while picking. A host tapping Open in Maps
// meant "edit where this goes", not "leave the page", and a guest's RSVP buttons are not the
// host's to press.
export function PickMode() {
  useEffect(() => {
    function onClick(ev: MouseEvent) {
      const el = (ev.target as HTMLElement | null)?.closest<HTMLElement>("[data-section]");
      ev.preventDefault();
      ev.stopPropagation();
      const section = el?.dataset.section;
      if (section) window.parent.postMessage({ from: "bunting", section }, window.location.origin);
    }
    // Capture, so a link's own handler never gets the chance to navigate first.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <style>{`
      [data-section] { cursor: pointer; position: relative; }
      [data-section]::after {
        content: ""; position: absolute; inset: -6px; border-radius: 10px; pointer-events: none;
        border: 2px solid transparent; transition: border-color 120ms ease, background-color 120ms ease;
      }
      [data-section]:hover::after { border-color: #1c1917; background: rgba(28, 25, 23, 0.04); }
      @media (hover: none) { [data-section]:hover::after { border-color: transparent; background: none; } }
      @media (prefers-reduced-motion: reduce) { [data-section]::after { transition: none; } }
    `}</style>
  );
}
