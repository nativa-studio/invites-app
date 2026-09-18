import { copy } from "@/lib/copy";
import { formatShortDate } from "@/lib/format";
import type { PublicEvent } from "@/lib/db/types";
import { Bolt } from "@/components/art/icons";

// The reply block as the host's preview shows it.
//
// It used to be a note saying a guest answers here, which told the host nothing about the part of
// the invite that decides whether anyone replies at all. It is now the real card, with the real
// buttons carrying the host's own wording, drawn but not wired: a preview should show the thing,
// not describe it.
export function PreviewReply({ e, who }: { e: PublicEvent; who?: string }) {
  return (
    <div className="pcard tilt-l reply">
      <div className="rsvp-h"><Bolt /> {copy.rsvp.heading} <Bolt /></div>
      <div className="rsvp-q">Can <u>{who ?? "your guest"}</u> make it?</div>
      {e.rsvp_by && <div className="para" style={{ fontSize: 15 }}>{copy.rsvp.replyBy(formatShortDate(e.rsvp_by))}</div>}
      <span className="pbtn primary" aria-hidden="true">{e.yes_label ?? copy.rsvp.yes}</span>
      <span className="pbtn" aria-hidden="true">{e.no_label ?? copy.rsvp.no}</span>
      <div className="small">{copy.host.previewReply}</div>
    </div>
  );
}
