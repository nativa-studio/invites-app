import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { signInWithGoogle } from "@/app/auth/actions";
import { joinEvent, peekJoin } from "@/lib/db/cohosts";
import { NotConfigured } from "@/components/host/NotConfigured";

// Taking up an invitation to co-host.
//
// A link rather than an email address typed into a box. The host has the other person's phone,
// not necessarily the address they sign in to Google with, and asking a host to guess it is
// asking them to get it wrong. The person who taps the link is the one who signs in, so the
// address can only ever be right.
//
// Signed in, this joins and goes straight to the event: there is nothing to decide, because
// tapping a link somebody sent you is the decision. Signed out, it says whose party it is and
// offers the one button, with the code riding along in `next` so Google comes back here.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Join({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!publicEnv.configured) return <NotConfigured />;

  // What this link is, before anybody signs in. Null is an unknown code or a link the owner has
  // switched off, and both say the same thing to the person holding it.
  const event = await peekJoin(code);
  if (!event) return <Closed />;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return <SignIn code={code} title={event.title} />;

  const result = await joinEvent(code);
  // Closed between the peek above and now, which is a host switching the link off while somebody
  // was signing in. Rare, and the honest answer is the same as any other closed link.
  if (!result.ok) return <Closed />;
  redirect(`/app/events/${result.event_id}`);
}

function SignIn({ code, title }: { code: string; title: string }) {
  return (
    <main className="host" style={{ paddingTop: 64 }}>
      <p className="brand">{copy.brand}</p>
      <h1 className="h1">{copy.join.title(title)}</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>{copy.join.lede}</p>
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={`/join/${code}`} />
        <button className="btn primary" type="submit">{copy.landing.google}</button>
      </form>
    </main>
  );
}

function Closed() {
  return (
    <main className="host" style={{ paddingTop: 64 }}>
      <p className="brand">{copy.brand}</p>
      <h1 className="h1">{copy.join.closedTitle}</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>{copy.join.closedBody}</p>
    </main>
  );
}
