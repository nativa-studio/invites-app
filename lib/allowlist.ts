import "server-only";

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
