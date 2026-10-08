import "server-only";
import { createClient } from "@/lib/supabase/server";

// Who is allowed to sign in while Bunting is being built.
//
// `HOST_ALLOWLIST` is a comma separated list of email addresses. Unset means everybody, which is
// how a local checkout and any future open version behave; set it and only those addresses get
// past the door. It is deliberately not a NEXT_PUBLIC_ variable, because a list of real email
// addresses has no business being shipped to a browser.
//
// This is a front door, not a lock. The lock is row level security: a signed-in stranger can only
// ever see their own rows, and has never been able to read anybody else's guests, allergy notes
// or phone numbers. What this stops is somebody using a half built product and forming an opinion
// of it, which is a different problem and worth solving separately.
const list = (): string[] =>
  (process.env.HOST_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export function allowlistOn(): boolean {
  return list().length > 0;
}

export function isAllowedHost(email: string | null | undefined): boolean {
  const allowed = list();
  if (allowed.length === 0) return true;
  return Boolean(email) && allowed.includes(String(email).trim().toLowerCase());
}

/** The list, or a hand on an event already.
 *
 *  A co-host is somebody a host handed their party to, which is a stronger vouching than being on
 *  a list typed into an environment variable by whoever set the deployment up. Without this a
 *  co-host gets in once, through the invite that let them past the door, and is turned away at
 *  /app on every visit after, which is worse than never letting them in at all.
 *
 *  The list is still the front door for everybody who has never been invited to anything. This
 *  only ever widens it, never narrows it, so a database that cannot answer leaves the list in
 *  charge rather than locking the owner out of their own app.
 *
 *  The membership question is asked of the database rather than of the caller, because the answer
 *  has to be the database's: it is the one place that knows who is on what, and a page that
 *  decided for itself would be a second rule to keep in step. */
export async function isAllowedNow(email: string | null | undefined): Promise<boolean> {
  if (isAllowedHost(email)) return true;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_any_member");
  if (error) return false;
  return data === true;
}
