import type { Metadata } from "next";
import "@/app/invite.css";
import { copy } from "@/lib/copy";
import { InviteBody, asLayout } from "@/components/invite/InviteBody";
import { ReplyProvider } from "@/components/invite/ReplyState";
import { TryReply } from "@/components/invite/TryReply";
import { googleCalendarLink } from "@/lib/calendar";
import { sampleEvent } from "@/lib/sample-event";

// A design, running, before there is an event to run it on.
//
// Step two of New event asks a host to pick a look, and until now it could only show them a
// diagram of each one: the event does not exist yet, so /app/preview/[id] has nothing to read.
// This is the same screen with the row built rather than fetched. Everything below the first two
// lines is the invite a guest gets, envelope and all, which is the part of this product that does
// not survive being described.
//
// It reads nothing and writes nothing. There is no id in the URL because there is no row, so
// there is nothing here to guard: the sample is the same for every host. It lives under /app
// anyway, behind the host layout, because it is a step in making an event and not a page for the
// world.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Query = { layout?: string; type?: string; title?: string };

export default async function SamplePreview({ searchParams }: { searchParams: Promise<Query> }) {
  const { layout, type, title } = await searchParams;
  const e = sampleEvent({ type: type ?? "kids_party", layout, title });
  // A guest sees their own name at the top, so the sample borrows the one the message preview
  // uses. One stand in name in one place, rather than a second one invented here.
  const who = copy.host.sampleGuest;
  // The calendar buttons work, and point straight at Google with no link in the event. Nothing is
  // counted because there is no guest and no token to count against, which is also why there is
  // no Apple file: that route is served per guest.
  const google = googleCalendarLink(e, "");
  return (
    <ReplyProvider initial={{ token: "", status: "pending", plate: null, gift: null, wishes: [], pretend: true }}>
      <InviteBody
        e={e}
        greeting={copy.greeting(who)}
        reply={<TryReply e={e} who={who} googleLink={google} icsLink={null} plate={null} gift={null} />}
        layout={asLayout(layout)}
        pretend
        calendar={e.date ? { google, ics: null } : null}
      />
    </ReplyProvider>
  );
}
