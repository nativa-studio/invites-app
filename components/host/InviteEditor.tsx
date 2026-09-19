"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { sectionById, type Section } from "./sections";
import { InviteParts } from "./InviteParts";
import { EditDrawer } from "./EditDrawer";
import { EditCard, Sum } from "./EditCard";
import { Choice } from "./fields";

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
        <a className="btn small" href={`/app/preview/${e.id}?full=1`} target="_blank" rel="noreferrer">{copy.host.openFull}</a>
      </div>
      {/* Tapping the invite reaches every part that is on it, and none of the parts that are not.
          This list reaches all of them, and is also the only place a part can be moved, since
          there is no gap on the invite to tap to say "put it here". */}
      <InviteParts e={e} onEdit={(part) => { const s = sectionById(part); if (s) setOpen(s); }} />
      {/* Whether the thing above is a draft or is out in the world. It lived on the Details tab,
          which is gone, and it is the one setting on this screen that is about the invite as a
          whole rather than about a part of it. */}
      <EditCard
        eventId={e.id}
        title={copy.host.statusHeading}
        blurb={copy.host.statusBlurb}
        fields={["status"]}
        summary={<Sum label="Right now" value={copy.host.statusNames[e.status] ?? e.status} />}
      >
        <Choice
          id="status"
          label="This event is"
          value={e.status}
          options={[["draft", "A draft"], ["live", "Live"], ["thanks", "Saying thanks"], ["archived", "Archived"]]}
        />
      </EditCard>
      {/* Keyed by section, so tapping a different part of the invite gets a fresh drawer rather
          than one still holding the last one's unsaved state. */}
      {open && <EditDrawer key={open.id} section={open} e={e} onClose={() => setOpen(null)} onSaved={saved} />}
    </>
  );
}
