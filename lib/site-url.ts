import { headers } from "next/headers";
import { publicEnv as env } from "./env";

// Public origin for building invite links: NEXT_PUBLIC_SITE_URL when set,
// otherwise whatever host the current request came in on (Vercel sets
// x-forwarded-host / x-forwarded-proto).
//
// A preview deployment ignores the configured value even when it is set. That value names the live
// site, so on a preview it would send a host who signs in straight back to the live site, and would
// stamp live addresses into links copied out of a preview. A preview must talk about itself.
export async function getSiteUrl(): Promise<string> {
  const preview = process.env.VERCEL_ENV === "preview";
  if (env.siteUrl && !preview) return env.siteUrl;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function inviteLink(siteUrl: string, token: string): string {
  return `${siteUrl}/i/${token}`;
}
