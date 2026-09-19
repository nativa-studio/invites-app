import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedHost } from "@/lib/allowlist";

// Google sends the browser back here with a code. Exchange it for a session, then go to the app.
//
// Unless they are not on the list while this is being built, in which case the session is thrown
// away again on the spot. Signing them out here rather than showing them a notice inside the app
// is the difference between a door that is not open yet and a door that opens onto a locked room:
// there is no half signed in state, no profile row, and nothing for a stranger to poke at.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getClaims();
      const email = data?.claims?.email as string | undefined;
      if (!isAllowedHost(email)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/not-yet", url.origin));
      }
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/?error=signin", url.origin));
}
