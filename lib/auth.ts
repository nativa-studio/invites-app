import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";

export const HOST_COOKIE = "bday_host";
const COOKIE_DAYS = 30;

// The cookie holds a keyed hash of the password, never the password itself.
// Changing HOST_PASSWORD logs every device out.
export function sessionValue(): string {
  return createHmac("sha256", env.hostPassword).update("birthday-host-session").digest("hex");
}

export function passwordMatches(candidate: string): boolean {
  if (!env.hostPassword) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(env.hostPassword);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isHostAuthed(): Promise<boolean> {
  if (!env.hostPassword) return false;
  const store = await cookies();
  const value = store.get(HOST_COOKIE)?.value ?? "";
  const expected = sessionValue();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function setHostCookie(): Promise<void> {
  const store = await cookies();
  store.set(HOST_COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_DAYS * 24 * 60 * 60,
  });
}

export async function clearHostCookie(): Promise<void> {
  const store = await cookies();
  store.delete(HOST_COOKIE);
}
