"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { hiddenSections, sectionById, type Section } from "./sections";
import { EditDrawer } from "./EditDrawer";

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
  const off = hiddenSections(e);

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
      {/* Tapping the invite reaches every part that is on it. The parts that are off are not on it
          to be tapped, so they are offered here by name. */}
      {off.length > 0 && (
        <div className="off-parts">
          <span className="hint">{copy.host.offParts}</span>
          <div className="actions">
            {off.map((s) => (
              <button key={s.id} type="button" className="btn small" onClick={() => setOpen(s)}>{s.title}</button>
            ))}
          </div>
        </div>
      )}
      <div className="actions">
        <a className="btn small" href={`/app/preview/${e.id}?full=1`} target="_blank" rel="noreferrer">{copy.host.openFull}</a>
      </div>
      {/* Keyed by section, so tapping a different part of the invite gets a fresh drawer rather
          than one still holding the last one's unsaved state. */}
      {open && <EditDrawer key={open.id} section={open} e={e} onClose={() => setOpen(null)} onSaved={saved} />}
    </>
  );
}
