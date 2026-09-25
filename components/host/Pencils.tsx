"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { copy } from "@/lib/copy";
import { sectionById } from "./sections";

// A pencil on every part of the invite, and nothing else changed.
//
// This replaces PickMode, which caught every tap anywhere in the invite and turned it into "edit
// this part". That made the host's copy of the invite a thing you could not use: pressing yes did
// nothing, Open in Maps did nothing, the gifts block would not open. So there was a second mode
// to see it working, a third for full size, and a fourth once you counted a guest's real link.
// Marcia: "it's just too many options, it's a bit confusing. I just want one place where the
// invite is, and in each section there is a little pencil, and that's where you click to edit.
// Otherwise, if you click anywhere else, it's the experience of the preview."
//
// So the invite here is the invite. Every tap on it does what it does for a guest, except that
// nothing is written, and the one thing that is not a guest's is the pencil in the corner of each
// part. One control, in the same place on every card, doing one thing.
//
// Drawn through portals into the section elements rather than added to thirty components. The
// mark on each part is data-section, which every layout already carries because the old editor
// needed it, and which the drawer still uses to know which part to open.
export function Pencils() {
  const [nodes, setNodes] = useState<HTMLElement[]>([]);

  useEffect(() => {
    // Sections come and go while the invite is being used: the reply card becomes a thank you,
    // the plate board appears on a yes. Read once on mount and the pencils would be right for
    // about four seconds. The observer is why this is cheap to leave switched on.
    function scan() {
      const all = [...document.querySelectorAll<HTMLElement>("[data-section]")]
        // Outermost only. A layout that wraps a card in a section of the same name would
        // otherwise get two pencils on one block, which is two answers to a question with one.
        .filter((el) => !el.parentElement?.closest("[data-section]"))
        .filter((el) => sectionById(el.dataset.section ?? ""));
      // Same list, same array: setting state on every mutation would be a loop, since drawing a
      // pencil into a section is itself a mutation.
      setNodes((was) => (was.length === all.length && was.every((el, i) => el === all[i]) ? was : all));
    }
    scan();
    const watch = new MutationObserver(scan);
    watch.observe(document.body, { childList: true, subtree: true });
    return () => watch.disconnect();
  }, []);

  return (
    <>
      {nodes.map((el) => createPortal(<Pencil section={el.dataset.section ?? ""} />, el, el.dataset.section))}
      <style>{`
        [data-section] { position: relative; }
        .bunting-pencil {
          position: absolute; top: 2px; right: 2px; z-index: 5;
          width: 44px; height: 44px; display: grid; place-items: center;
          border: 0; background: none; padding: 0; cursor: pointer;
          color: #1b2a4a; opacity: 0.45; transition: opacity 120ms ease;
        }
        .bunting-pencil:hover, .bunting-pencil:focus-visible { opacity: 1; }
        .bunting-pencil svg { width: 17px; height: 17px; }
        /* The disc is what makes it findable on a photograph, a dark strip and a cream card
           alike, without drawing a box on every part of the invitation. */
        .bunting-pencil::before {
          content: ""; position: absolute; width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.82); box-shadow: 0 1px 3px rgba(27,42,74,0.25);
        }
        .bunting-pencil svg { position: relative; }
        @media (prefers-reduced-motion: reduce) { .bunting-pencil { transition: none; } }
      `}</style>
    </>
  );
}

function Pencil({ section }: { section: string }) {
  const name = sectionById(section)?.title ?? "";
  return (
    <button
      type="button"
      className="bunting-pencil"
      aria-label={copy.host.editThis(name)}
      title={copy.host.editThis(name)}
      onClick={(ev) => {
        // The card underneath is a working part of the invite now. Without this, the pencil on
        // the gifts block would open the drawer and open Ideas on the way past.
        ev.preventDefault();
        ev.stopPropagation();
        window.parent.postMessage({ from: "bunting", section }, window.location.origin);
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>
  );
}
