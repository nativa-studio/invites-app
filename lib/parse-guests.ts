// Turns a pasted list into guests. Hosts paste from anywhere: a note, a spreadsheet column,
// a group chat. Each line is one guest. A mobile anywhere in the line is picked out, the rest
// is the name. Lines with no number are still guests, they just get a link to share by hand.
export type ParsedGuest = { name: string; phone: string };

const PHONE = /(\+?\d[\d\s().-]{7,}\d)/;

export function parseGuestList(input: string): ParsedGuest[] {
  const out: ParsedGuest[] = [];
  const seen = new Set<string>();
  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
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
    out.push({ name, phone });
  }
  return out;
}
