import { copy } from "@/lib/copy";
import { formatShortDate } from "@/lib/format";
import type { PublicEvent } from "@/lib/db/types";
import { Bolt } from "@/components/art/icons";

// The reply block as the host's preview shows it while they are editing.
//
// It used to be a note saying a guest answers here, which told the host nothing about the part of
// the invite that decides whether anyone replies at all. It is now the real card, with the real
// buttons carrying the host's own wording, drawn but not wired: a preview should show the thing,
// not describe it. Pressing it for real is what Preview is for, which swaps this card
// for TryReply, the guest's own form.
//
// data-section is what makes it tappable in the editor, and it was the one part of the invite
// without one: tapping the reply did nothing at all, so the reply by date had nowhere to be
// changed from. The name matches the entry in sections.tsx, the same as every other card.
export function PreviewReply({ e, who }: { e: PublicEvent; who?: string }) {
  return (
    <div className="pcard tilt-l reply" data-section="reply">
      <div className="rsvp-h"><Bolt size={24} /> {copy.rsvp.heading} <Bolt size={24} /></div>
      <div className="rsvp-q">Can <u>{who ?? "your guest"}</u> make it?</div>
      {e.rsvp_by && <div className="para" style={{ fontSize: 15 }}>{copy.rsvp.replyBy(formatShortDate(e.rsvp_by))}</div>}
      <span className="pbtn primary" aria-hidden="true">{e.yes_label ?? copy.rsvp.yes}</span>
      <span className="pbtn" aria-hidden="true">{e.no_label ?? copy.rsvp.no}</span>
      <div className="small">{copy.host.previewReply}</div>
    </div>
  );
}
