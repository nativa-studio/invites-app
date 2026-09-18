"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveEvent, type SaveState } from "@/app/app/events/[id]/settings/actions";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { sectionById, ShowSwitch, type Section } from "./sections";

// The invite, and a way to edit it by pointing at it.
//
// The preview runs in a frame in pick mode, so a tap anywhere inside it sends back the name of
// the part that was tapped. That opens a drawer holding just that part's wording and its show or
// hide switch. Saving writes only those fields, then the frame reloads so what you are looking at
// is what you just saved.
//
// Editing by pointing beats a tab of forty fields because the question answers itself: you do not
// have to know that "what to bring" is the line that reads Wear, you tap the line that reads Wear.
export function InviteEditor({ e }: { e: EventRow }) {
  const [open, setOpen] = useState<Section | null>(null);
  const [version, setVersion] = useState(0);
  const router = useRouter();
  const src = `/app/preview/${e.id}?pick=1&v=${version}`;

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (ev.origin !== window.location.origin) return;
      if (ev.data?.from !== "bunting" || typeof ev.data.section !== "string") return;
      const section = sectionById(ev.data.section);
      if (section) setOpen(section);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function saved() {
    setOpen(null);
    setVersion((v) => v + 1);
    router.refresh();
  }

  return (
    <>
      <p className="hint">Tap any part of the invite to change it.</p>
      <div className="screen phone">
        <iframe key={src} src={src} title="Your invite" />
      </div>
      <div className="actions">
        <a className="btn small" href={`/app/preview/${e.id}`} target="_blank" rel="noreferrer">{copy.host.openFull}</a>
      </div>
      {/* Keyed by section, so tapping a different part of the invite gets a fresh drawer rather
          than one still holding the last one's unsaved state. */}
      {open && <Drawer key={open.id} section={open} e={e} onClose={() => setOpen(null)} onSaved={saved} />}
    </>
  );
}

function Drawer({ section, e, onClose, onSaved }: { section: Section; e: EventRow; onClose: () => void; onSaved: () => void }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEvent, {});
  const sheet = useRef<HTMLDivElement>(null);
  // Typing in here and then tapping the invite behind used to close the drawer and throw the
  // change away without a word, which looks exactly like a save that did not work. Once there is
  // something to lose, only the button marked Discard can lose it.
  const [dirty, setDirty] = useState(false);
  const leave = () => { if (!dirty) onClose(); };

  useEffect(() => { if (state.saved) onSaved(); }, [state.saved, onSaved]);

  // The tap that opened this came from inside the frame, so that is where the keyboard still is.
  // Moving focus into the sheet is what makes Escape work at all, and it is also where a screen
  // reader should land: the thing that just appeared.
  useEffect(() => { sheet.current?.focus(); }, []);

  const fields = section.show ? [...section.fields, section.show.column] : section.fields;
  const nothingToEdit = section.render(e) === null;

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
        aria-label={section.title}
      >
        <div className="sheet-head">
          <h2 className="h2">{section.title}</h2>
          <button type="button" className="btn small" onClick={onClose}>{dirty ? "Discard" : "Close"}</button>
        </div>
        {section.blurb && <p className="hint">{section.blurb}</p>}
        <form action={action} className="sheet-body" onInput={() => setDirty(true)} onChange={() => setDirty(true)}>
          <input type="hidden" name="event_id" value={e.id} />
          <input type="hidden" name="_fields" value={[...new Set(fields)].join(",")} />
          {section.render(e)}
          <ShowSwitch section={section} e={e} />
          {state.error && <p className="notice" role="alert">{state.error}</p>}
          {fields.length > 0 ? (
            <div className="sheet-foot">
              {dirty && <span className="hint" aria-live="polite">Not saved yet</span>}
              <button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving" : "Save"}</button>
            </div>
          ) : (
            nothingToEdit && <p className="hint">Nothing to change here.</p>
          )}
        </form>
      </div>
    </div>
  );
}
