import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { isAllowedHost } from "@/lib/allowlist";
import { NotConfigured } from "@/components/host/NotConfigured";

// Everything under /app needs a signed-in host, and sign-in needs the Supabase settings. If this
// deployment does not have them, say so rather than letting the first database call throw.
//
// It also needs a host who is on the list while this is being built. The callback already turns
// anybody else away before a session exists, so this is the second line: it catches somebody who
// signed in before the list existed and still has the cookies, and it covers any future way into
// the app that does not come through the callback.
//
// Neither of these is the security boundary. That is row level security, in the database, where a
// signed-in stranger can only ever read their own rows. This is about who gets to use a half
// built product, which is a different question.
export default async function HostLayout({ children }: { children: React.ReactNode }) {
  if (!publicEnv.configured) return <NotConfigured />;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  // Not signed in at all is the proxy's job, and it has already sent them to the landing page.
  // Reaching here without claims means the cookie went stale between the two, so let it pass and
  // let the first query decide.
  if (claims && !isAllowedHost(claims.email as string | undefined)) {
    await supabase.auth.signOut();
    redirect("/not-yet");
  }
  return <>{children}</>;
}
