// Turns a pasted list into guests. Hosts paste from anywhere: a note, a spreadsheet column,
// a group chat. Each line is one guest. A mobile anywhere in the line is picked out, the rest
// is the name. Lines with no number are still guests, they just get a link to share by hand.
export type ParsedGuest = { name: string; phone: string; children: number | null; adults: number | null };

const PHONE = /(\+?\d[\d\s().-]{7,}\d)/;
// "2a 2k", "2 adults 3 kids", "1 adult". Read before the mobile, so a trailing count is never
// swallowed by the number.
const ADULTS = /(\d+)\s*(?:adults?|a)\b/i;
const KIDS = /(\d+)\s*(?:kids?|children|child|k)\b/i;

// A count only counts if it is a plausible number of people. "0400 111 222 A" must never
// read as 222 adults.
function plausible(match: RegExpMatchArray | null): number | null {
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isInteger(n) && n >= 0 && n <= 50 ? n : null;
}

export function parseGuestList(input: string): ParsedGuest[] {
  const out: ParsedGuest[] = [];
  const seen = new Set<string>();
  for (const raw of input.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line) continue;
    const adultsMatch = line.match(ADULTS);
    const kidsMatch = line.match(KIDS);
    const adults = plausible(adultsMatch);
    const children = plausible(kidsMatch);
    if (adultsMatch && adults !== null) line = line.replace(adultsMatch[0], " ");
    if (kidsMatch && children !== null) line = line.replace(kidsMatch[0], " ");
    const match = line.match(PHONE);
    const phone = match ? match[1].replace(/[^\d+]/g, "") : "";
    // Take the number out, then strip the separators a spreadsheet or a note leaves behind.
    const name = (match ? line.replace(match[1], " ") : line)
      .replace(/[,;|\t<>()]+/g, " ")
      .replace(/\s+-\s+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (!name) continue;
    const key = (phone || name).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      name,
      phone,
      children,
      adults,
    });
  }
  return out;
}
