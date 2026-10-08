import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedNow } from "@/lib/allowlist";
import { peekJoin } from "@/lib/db/cohosts";

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
      // On the list, or already running somebody's event, or holding a live invitation to one.
      //
      // The third is how a co-host ever gets in at all: the first time they arrive they are on no
      // list and in no event, and the only thing vouching for them is the link they followed. So
      // the code in `next` is checked against the database, and a live one opens the door exactly
      // once; after that they are a member and the second test carries them from then on.
      if (!(await isAllowedNow(email)) && !(await invited(safeNext))) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/not-yet", url.origin));
      }
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/?error=signin", url.origin));
}

/** Whether `next` is an invitation to co-host something, and whether it is still open.
 *
 *  Only ever a /join/<code> path, and the code is read by the database rather than trusted: a
 *  made-up one peeks as nothing and the door stays shut. Nothing else in the address is looked
 *  at, so nothing else in it can widen this. */
async function invited(next: string): Promise<boolean> {
  const code = next.match(/^\/join\/([a-z0-9]{6,24})$/)?.[1];
  if (!code) return false;
  return Boolean(await peekJoin(code));
}
