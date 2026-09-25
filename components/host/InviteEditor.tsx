"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { sectionById, type Section } from "./sections";
import { InviteParts } from "./InviteParts";
import { EditDrawer } from "./EditDrawer";
import { Sheet } from "./Sheet";

// The invite, in the one place there is.
//
// The frame holds the guest's invite, working. Press yes and the questions come, open the gifts
// block, tap the address: it all does what it does for a guest, and none of it is saved. The one
// thing on it that is not a guest's is the pencil in the corner of each part. Tap that and the
// frame sends back which part it was, which opens a drawer holding that part's wording and its
// show or hide switch. Saving writes only those fields, then the frame reloads, so what you are
// looking at is what you just saved.
//
// There used to be four ways to look at this: editing, where every tap meant "change this" and
// nothing on the invite could be used; Preview, where nothing could be changed; full size, in a
// tab of its own; and a guest's real link. Marcia: "it's just too many options, it's a bit
// confusing. I just want one place where the invite is." One screen, one control on it.
//
// Editing by pointing beats a tab of forty fields because the question answers itself: you do not
// have to know that "what to bring" is the line that reads Wear, you tap the pencil on the line
// that reads Wear.
export function InviteEditor({ e }: { e: EventRow }) {
  const [open, setOpen] = useState<Section | null>(null);
  const [version, setVersion] = useState(0);
  const [parts, setParts] = useState(false);
  const router = useRouter();
  // v is the reload: a save bumps it and the frame remounts on what was just written.
  const src = `/app/preview/${e.id}?edit=1&v=${version}`;

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
      <p className="hint">{copy.host.inviteHint}</p>
      {/* Tapping a pencil reaches every part that is on the invite, and none of the parts that
          are not. This list reaches all of them, and is also the only place a part can be moved,
          since there is no gap on the invite to tap to say "put it here". In a sheet, because it
          is seven rows of switches and handles that a host opens on purpose and then shuts. */}
      <div className="actions">
        <button type="button" className="btn small" onClick={() => setParts(true)}>{copy.host.partsOpen}</button>
      </div>
      <div className="screen phone">
        <iframe key={src} src={src} title="Your invite" />
      </div>
      {parts && (
        <Sheet title={copy.host.partsHeading} blurb={copy.host.partsBlurb} onClose={() => setParts(false)}>
          <div className="sheet-body">
            <InviteParts e={e} onEdit={(part) => { const s = sectionById(part); if (s) { setParts(false); setOpen(s); } }} />
          </div>
        </Sheet>
      )}
      {/* Keyed by section, so tapping a different part of the invite gets a fresh drawer rather
          than one still holding the last one's unsaved state. */}
      {open && <EditDrawer key={open.id} section={open} e={e} onClose={() => setOpen(null)} onSaved={saved} />}
    </>
  );
}
