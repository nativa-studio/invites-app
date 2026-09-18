"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventRow } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { formatInviteDate } from "@/lib/format";
import { inviteText, reminderText } from "@/lib/messages";
import type { Section } from "./sections";
import { MESSAGE_SECTIONS, previewTitle } from "./message-sections";
import { EditDrawer } from "./EditDrawer";

// The message, as it will actually land.
//
// This was four text boxes with names like "Link preview description", which asked a host to
// picture the result. Now it is the result: the card a chat app draws, the title, the line under
// it, and the message itself, with a real guest's name and a real link in it. Tap any piece and
// its wording opens, the same way the invite is edited.
//
// The card picture is generated from the invite, so it is not editable and does not pretend to be.
export function MessagePreview({ e, site, sample }: { e: EventRow; site: string; sample: string }) {
  const [open, setOpen] = useState<Section | null>(null);
  const router = useRouter();

  const link = sample ? `${site}/i/${sample}` : `${site}/e/${e.slug}`;
  const guest = { name: copy.host.sampleGuest };
  const card = `/s/${e.slug}/card.png?v=${encodeURIComponent(e.date ?? "")}`;
  const description = e.share_description?.trim()
    || [formatInviteDate(e.date), e.intro].filter(Boolean).join(". ");
  const host = site.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const part = (id: string) => MESSAGE_SECTIONS.find((s) => s.id === id)!;
  const saved = () => { setOpen(null); router.refresh(); };

  return (
    <>
      <p className="hint">{copy.host.messagePreviewHint}</p>
      <div className="chat">
        <button type="button" className="bubble-card" onClick={() => setOpen(part("card"))} aria-label="Change the link preview">
          <span className="art">
            {/* unoptimized: the card is generated per event and changes whenever the invite does,
                so a cached, resized copy would show yesterday's. */}
            <Image src={card} alt="" width={1200} height={630} unoptimized />
          </span>
          <span className="t">{previewTitle(e)}</span>
          <span className="d">{description}</span>
          <span className="u">{host}</span>
        </button>

        <button type="button" className="bubble" onClick={() => setOpen(part("invite"))}>
          {inviteText(e, guest, link)}
        </button>

        <span className="label-ish">{copy.host.messageReminder}</span>
        <button type="button" className="bubble" onClick={() => setOpen(part("reminder"))}>
          {reminderText(e, guest, link)}
        </button>
      </div>
      {open && <EditDrawer key={open.id} section={open} e={e} onClose={() => setOpen(null)} onSaved={saved} />}
    </>
  );
}
