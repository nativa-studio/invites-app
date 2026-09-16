import { headers } from "next/headers";
import { publicEnv as env } from "./env";

// Public origin for building invite links: NEXT_PUBLIC_SITE_URL when set,
// otherwise whatever host the current request came in on (Vercel sets
// x-forwarded-host / x-forwarded-proto).
export async function getSiteUrl(): Promise<string> {
  if (env.siteUrl) return env.siteUrl;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function inviteLink(siteUrl: string, token: string): string {
  return `${siteUrl}/i/${token}`;
}
