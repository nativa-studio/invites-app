"use client";
import { useTransition } from "react";
import { copy } from "@/lib/copy";
import type { GuestRow } from "@/lib/db/types";
import { setGuestAnswer, type GuestAnswer } from "@/app/app/events/[id]/actions";
import { Sheet } from "./Sheet";

// Where a guest is up to, set by the host.
//
// Four states rather than a yes and a no, because the two ways back matter and they are not the
// same thing: clearing an answer leaves the record of what was sent, and going back to not sent
// wipes that record too. A host testing the thing wants the second one. A host whose guest said
// yes and then changed their mind wants the first.
//
// Each one says what it does underneath. These write over a guest's own reply, so none of them
// should be a word you have to guess at.
export function SetAnswer({ eventId, guest, onClose }: {
  eventId: string;
  guest: GuestRow;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();

  const options: { key: GuestAnswer; label: string; why: string; on: boolean }[] = [
    { key: "yes", label: copy.host.answerYes, why: copy.host.answerYesWhy, on: guest.status === "yes" },
    { key: "no", label: copy.host.answerNo, why: copy.host.answerNoWhy, on: guest.status === "no" },
    { key: "pending", label: copy.host.answerPending, why: copy.host.answerPendingWhy, on: guest.status === "pending" && Boolean(guest.sent_at) },
    { key: "unsent", label: copy.host.answerUnsent, why: copy.host.answerUnsentWhy, on: guest.status === "pending" && !guest.sent_at },
  ];

  return (
    <Sheet title={copy.host.answerHeading} blurb={copy.host.answerBlurb} onClose={onClose}>
      <div className="sheet-body">
        <ul className="pick">
          {options.map((o) => (
            <li key={o.key}>
              <button
                type="button"
                className="pick-row"
                aria-pressed={o.on}
                disabled={pending}
                onClick={() => { start(() => { void setGuestAnswer(eventId, guest.id, o.key); }); onClose(); }}
              >
                <span className="n">{o.label}</span>
                <span className="hint">{o.why}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
