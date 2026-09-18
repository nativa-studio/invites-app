import type { EventRow } from "@/lib/db/types";
import { MessagePreview } from "@/components/host/MessagePreview";

// The words that go out rather than the words on the invite.
//
// These used to sit under the guest list as four text boxes, which asked a host to picture the
// result from field names like "Link preview description". They are a setting, so they live with
// the settings, they fold because Details is long enough already, and they are shown as the
// message rather than as the form that makes it.
export function MessagesPanel({ e, site, sample }: { e: EventRow; site: string; sample: string }) {
  return (
    <details className="card drop">
      <summary>Messages</summary>
      <div className="drop-body">
        <MessagePreview e={e} site={site} sample={sample} />
      </div>
    </details>
  );
}
