// Thin client for the Airtable REST API. Two tables:
//   Guests: one row per invited guest, the app writes RSVPs back here.
//   Event:  a single row with the party details shown on the invite.
// Field names are documented in README.md and must match Airtable exactly.

import { env } from "./env";
import { generateToken } from "./tokens";

export type RsvpStatus = "Pending" | "Coming" | "Not coming";
export type GuestSource = "Invited" | "Open link";

export type Guest = {
  id: string;
  name: string;
  phone: string;
  token: string;
  status: RsvpStatus;
  partySize: number | null;
  message: string;
  respondedAt: string | null;
  source: GuestSource;
  hostNotes: string;
};

export type EventInfo = {
  id: string;
  title: string;
  hostName: string;
  intro: string;
  date: string | null;
  time: string;
  venue: string;
  address: string;
  mapLink: string;
  details: string;
  rsvpBy: string | null;
  allowPlusOnes: boolean;
  maxPartySize: number;
  hostPhone: string;
  coverImageUrl: string;
  accentColour: string;
  textMessage: string;
};

export const GUEST_FIELDS = {
  name: "Name",
  phone: "Phone",
  token: "Token",
  status: "Status",
  partySize: "Party size",
  message: "Message",
  respondedAt: "Responded at",
  source: "Source",
  hostNotes: "Host notes",
} as const;

const EVENT_FIELDS = {
  title: "Title",
  hostName: "Host name",
  intro: "Intro",
  date: "Date",
  time: "Time",
  venue: "Venue",
  address: "Address",
  mapLink: "Map link",
  details: "Details",
  rsvpBy: "RSVP by",
  allowPlusOnes: "Allow plus ones",
  maxPartySize: "Max party size",
  hostPhone: "Host phone",
  coverImage: "Cover image",
  accentColour: "Accent colour",
  textMessage: "Text message",
} as const;

type Fields = Record<string, unknown>;
type Record_ = { id: string; createdTime: string; fields: Fields };

export class AirtableError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AirtableError";
    this.status = status;
  }
}

function str(fields: Fields, key: string): string {
  const v = fields[key];
  return typeof v === "string" ? v : "";
}

function num(fields: Fields, key: string): number | null {
  const v = fields[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function bool(fields: Fields, key: string): boolean {
  return fields[key] === true;
}

function attachmentUrl(fields: Fields, key: string): string {
  const v = fields[key];
  if (!Array.isArray(v) || v.length === 0) return "";
  const first = v[0] as { url?: string; thumbnails?: { large?: { url?: string } } };
  return first.thumbnails?.large?.url || first.url || "";
}

function toGuest(r: Record_): Guest {
  const f = r.fields;
  const status = str(f, GUEST_FIELDS.status);
  const source = str(f, GUEST_FIELDS.source);
  return {
    id: r.id,
    name: str(f, GUEST_FIELDS.name),
    phone: str(f, GUEST_FIELDS.phone),
    token: str(f, GUEST_FIELDS.token),
    status: status === "Coming" || status === "Not coming" ? status : "Pending",
    partySize: num(f, GUEST_FIELDS.partySize),
    message: str(f, GUEST_FIELDS.message),
    respondedAt: str(f, GUEST_FIELDS.respondedAt) || null,
    source: source === "Open link" ? "Open link" : "Invited",
    hostNotes: str(f, GUEST_FIELDS.hostNotes),
  };
}

function toEvent(r: Record_): EventInfo {
  const f = r.fields;
  const max = num(f, EVENT_FIELDS.maxPartySize);
  return {
    id: r.id,
    title: str(f, EVENT_FIELDS.title) || "You're invited",
    hostName: str(f, EVENT_FIELDS.hostName),
    intro: str(f, EVENT_FIELDS.intro),
    date: str(f, EVENT_FIELDS.date) || null,
    time: str(f, EVENT_FIELDS.time),
    venue: str(f, EVENT_FIELDS.venue),
    address: str(f, EVENT_FIELDS.address),
    mapLink: str(f, EVENT_FIELDS.mapLink),
    details: str(f, EVENT_FIELDS.details),
    rsvpBy: str(f, EVENT_FIELDS.rsvpBy) || null,
    allowPlusOnes: bool(f, EVENT_FIELDS.allowPlusOnes),
    maxPartySize: max && max >= 1 ? Math.min(Math.floor(max), 20) : 6,
    hostPhone: str(f, EVENT_FIELDS.hostPhone),
    coverImageUrl: attachmentUrl(f, EVENT_FIELDS.coverImage),
    accentColour: str(f, EVENT_FIELDS.accentColour).trim(),
    textMessage: str(f, EVENT_FIELDS.textMessage),
  };
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  query?: Record<string, string>;
  revalidate?: number; // seconds; omit for uncached
};

async function request<T>(table: string, path: string, opts: RequestOptions = {}): Promise<T> {
  if (!env.airtableToken || !env.airtableBaseId) {
    throw new AirtableError("Airtable is not configured (AIRTABLE_TOKEN / AIRTABLE_BASE_ID).", 0);
  }
  const url = new URL(
    `${env.airtableApiUrl}/${env.airtableBaseId}/${encodeURIComponent(table)}${path}`,
  );
  for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, v);

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env.airtableToken}`,
      "Content-Type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    ...(opts.revalidate ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = (await res.json()) as { error?: { message?: string } | string };
      detail = typeof j.error === "string" ? j.error : (j.error?.message ?? "");
    } catch {
      // ignore body parse failures
    }
    throw new AirtableError(`Airtable ${res.status} on ${table}${path}: ${detail || res.statusText}`, res.status);
  }
  return (await res.json()) as T;
}

// Airtable formula strings: escape backslashes and double quotes.
function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

// ---- Event -----------------------------------------------------------------

export async function getEvent(): Promise<EventInfo | null> {
  const data = await request<{ records: Record_[] }>(env.eventTable, "", {
    query: { maxRecords: "1" },
    revalidate: 60,
  });
  const r = data.records[0];
  return r ? toEvent(r) : null;
}

// ---- Guests ----------------------------------------------------------------

export async function listGuests(): Promise<Guest[]> {
  const all: Record_[] = [];
  let offset: string | undefined;
  do {
    const data = await request<{ records: Record_[]; offset?: string }>(env.guestsTable, "", {
      query: {
        pageSize: "100",
        "sort[0][field]": GUEST_FIELDS.name,
        "sort[0][direction]": "asc",
        ...(offset ? { offset } : {}),
      },
    });
    all.push(...data.records);
    offset = data.offset;
  } while (offset);
  return all.map(toGuest);
}

export async function getGuestByToken(token: string): Promise<Guest | null> {
  const data = await request<{ records: Record_[] }>(env.guestsTable, "", {
    query: {
      maxRecords: "1",
      filterByFormula: `{${GUEST_FIELDS.token}} = ${quote(token)}`,
    },
  });
  const r = data.records[0];
  return r ? toGuest(r) : null;
}

export async function updateGuest(id: string, fields: Fields): Promise<Guest> {
  const data = await request<Record_>(env.guestsTable, `/${id}`, {
    method: "PATCH",
    body: { fields, typecast: true },
  });
  return toGuest(data);
}

export async function createGuest(fields: Fields): Promise<Guest> {
  const data = await request<{ records: Record_[] }>(env.guestsTable, "", {
    method: "POST",
    body: { records: [{ fields }], typecast: true },
  });
  return toGuest(data.records[0]);
}

// Give every guest a link code. Idempotent: only rows with an empty Token are
// touched. Airtable accepts up to 10 records per PATCH.
export async function ensureTokens(guests: Guest[]): Promise<Guest[]> {
  const missing = guests.filter((g) => !g.token);
  if (missing.length === 0) return guests;

  const updated = new Map<string, string>();
  for (let i = 0; i < missing.length; i += 10) {
    const batch = missing.slice(i, i + 10).map((g) => ({
      id: g.id,
      fields: { [GUEST_FIELDS.token]: generateToken() },
    }));
    const data = await request<{ records: Record_[] }>(env.guestsTable, "", {
      method: "PATCH",
      body: { records: batch },
    });
    for (const r of data.records) updated.set(r.id, str(r.fields, GUEST_FIELDS.token));
  }
  return guests.map((g) => (updated.has(g.id) ? { ...g, token: updated.get(g.id)! } : g));
}
