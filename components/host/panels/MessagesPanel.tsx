import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { MessagePreview } from "@/components/host/MessagePreview";

// The words that go out rather than the words on the invite.
//
// These used to sit under the guest list as four text boxes, which asked a host to picture the
// result from field names like "Link preview description". They are shown as the message instead,
// and tapping a piece of it opens that piece's wording in a sheet.
//
// It used to fold, because Details was thirty fields long. Details is three cards now, so the
// fold was the only thing on the screen you had to open before you could see anything, and the
// last thing in the app that hid its contents behind a heading.
export function MessagesPanel({ e, site, sample }: { e: EventRow; site: string; sample: string }) {
  return (
    <section className="card">
      <h2 className="h2">{copy.host.messagesHeading}</h2>
      <p className="hint">{copy.host.messagesBlurb}</p>
      <MessagePreview e={e} site={site} sample={sample} />
    </section>
  );
}
