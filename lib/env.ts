// Central place for environment configuration so every module reads the
// same values and missing settings produce one clear message.

export const env = {
  airtableToken: process.env.AIRTABLE_TOKEN ?? "",
  airtableBaseId: process.env.AIRTABLE_BASE_ID ?? "",
  // Only for local testing against a mock server; leave unset in production.
  airtableApiUrl: (process.env.AIRTABLE_API_URL || "https://api.airtable.com/v0").replace(/\/+$/, ""),
  guestsTable: process.env.AIRTABLE_GUESTS_TABLE || "Guests",
  eventTable: process.env.AIRTABLE_EVENT_TABLE || "Event",
  hostPassword: process.env.HOST_PASSWORD ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, ""),
};

export function airtableConfigured(): boolean {
  return Boolean(env.airtableToken && env.airtableBaseId);
}

export function missingConfig(): string[] {
  const missing: string[] = [];
  if (!env.airtableToken) missing.push("AIRTABLE_TOKEN");
  if (!env.airtableBaseId) missing.push("AIRTABLE_BASE_ID");
  if (!env.hostPassword) missing.push("HOST_PASSWORD");
  return missing;
}
