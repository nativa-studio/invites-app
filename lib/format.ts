// Date helpers. Airtable date fields arrive as "YYYY-MM-DD" with no time, so
// they are formatted as UTC calendar dates to avoid timezone drift.

const LOCALE = "en-AU";

function asUtcDate(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const d = new Date(`${ymd}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatLongDate(ymd: string | null | undefined): string {
  if (!ymd) return "";
  const d = asUtcDate(ymd);
  if (!d) return ymd;
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatShortDate(ymd: string | null | undefined): string {
  if (!ymd) return "";
  const d = asUtcDate(ymd);
  if (!d) return ymd;
  return new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", timeZone: "UTC" }).format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Brisbane",
  }).format(d);
}

// "YYYYMMDD" for calendar links.
export function compactDate(ymd: string): string {
  return ymd.replace(/-/g, "");
}

export function nextDay(ymd: string): string {
  const d = asUtcDate(ymd);
  if (!d) return ymd;
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Titles and relations a host types as part of how they address someone. "Auntie Rose" is
// greeted as Auntie Rose, never as Auntie.
const TITLES = /^(mr|mrs|ms|miss|mx|dr|prof|sir|aunt|aunty|auntie|uncle|nan|nanna|nana|pop|poppy|gran|granny|grandma|grandpa|nonna|nonno|oma|opa|yia|tia|tio)\.?$/i;

// How to greet a guest by the name the host stored. Households and couples keep their whole
// name; a plain "Priya Nair" shortens to Priya.
export function firstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // Couples and groups: "Sarah & Tom", "Mia + Sam", "Sarah and Tom".
  if (/[&+]|\band\b/i.test(trimmed)) return trimmed;
  // Households: "The Nairs", "Nguyen family".
  if (/^the\b/i.test(trimmed)) return trimmed;
  if (/\b(family|household|crew|mob|clan)$/i.test(trimmed)) return trimmed;
  const words = trimmed.split(/\s+/);
  // "Auntie Rose", "Dr Jane Patel": keep the title with the name that follows it.
  if (words.length > 1 && TITLES.test(words[0])) return `${words[0]} ${words[1]}`;
  return words[0];
}

export function normalisePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.replace(/[^\d+]/g, "");
}

// Last 9 digits are enough to match "0400 000 000" with "+61 400 000 000".
export function phoneKey(raw: string | null | undefined): string {
  const digits = normalisePhone(raw).replace(/\D/g, "");
  return digits.slice(-9);
}

// "14:00:00" or "14:00" to "2pm" / "2:30pm".
export function formatTime(t: string | null | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

export function formatTimeRange(start: string | null | undefined, end: string | null | undefined, note: string | null | undefined): string {
  if (note) return note;
  if (start && end) return `${formatTime(start)} to ${formatTime(end)}`;
  if (start) return `From ${formatTime(start)}`;
  return "";
}

// "Sunday 1 November" without the year, for invites.
export function formatInviteDate(ymd: string | null | undefined): string {
  if (!ymd) return "";
  const d = asUtcDate(ymd);
  if (!d) return ymd;
  return new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(d);
}

// A host writes their sign-off however they like: "With love from Leo's mum and dad",
// "From Marcia and Tom", "With love Gabe, Tommy and Ma", or just "Marcia". Sentences elsewhere
// need the people, not the phrase.
//
// Every part of the opener is optional and independent. The old pattern required the word "from",
// so "With love Gabe, Tommy and Ma" matched nothing and the invite's last line read "Text With
// love Gabe, Tommy and Ma".
// 0403692420 becomes "0403 692 420". A number is read aloud in threes, and a run of ten digits
// on a phone screen is something a guest has to count through with a finger.
export function formatMobile(raw: string | null | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  const local = digits.startsWith("61") ? `0${digits.slice(2)}` : digits;
  if (local.length !== 10 || !local.startsWith("0")) return (raw ?? "").trim();
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function hostName(hostLine: string | null | undefined, fallback = "the host"): string {
  const trimmed = (hostLine ?? "").trim().replace(/^((with\s+)?(love|thanks)\s+)?(from\s+)?/i, "").trim();
  return trimmed || fallback;
}

// Money, in dollars, the way a person writes it. Whole amounts lose the trailing zeros, because
// "$20" is what somebody types and "$20.00" is what an invoice says. Australian dollars, so the
// symbol is a bare dollar sign rather than the A$ an international format would produce.
export function formatMoney(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return "";
  const whole = Math.round(amount * 100) % 100 === 0;
  return `$${amount.toLocaleString("en-AU", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

// A list the way a person says it: "a, b, c and d". No comma before the and, which is the
// Australian habit and the house style everywhere else in this app.
export function sentenceList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// How many sleeps. Counted in Brisbane, not in UTC and not in the browser.
//
// The server runs in UTC. A party on 1 November is "tomorrow" from about 2pm Brisbane on the 31st
// if you subtract UTC dates, because by then it is still the 31st in London and the clock the
// host is looking at says otherwise. Queensland has no daylight saving, so the offset is a flat
// ten hours and this needs no timezone library.
//
// Null when there is no date, which is a real state: an event can exist for weeks before anyone
// picks a day.
const BRISBANE_OFFSET_MS = 10 * 60 * 60 * 1000;

export function daysUntil(ymd: string | null | undefined): number | null {
  if (!ymd) return null;
  const then = asUtcDate(ymd);
  if (!then) return null;
  const nowInBrisbane = new Date(Date.now() + BRISBANE_OFFSET_MS);
  const today = Date.UTC(nowInBrisbane.getUTCFullYear(), nowInBrisbane.getUTCMonth(), nowInBrisbane.getUTCDate());
  return Math.round((then.getTime() - today) / 86_400_000);
}
