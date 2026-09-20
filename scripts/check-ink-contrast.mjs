// Every ink the strip offers, measured against the paper it is printed on.
//
// The strip is one colour on one paper, so a new ink is a whole invite's legibility in one line
// of a table. A bright saffron looks like Diwali and sits at about 2 to 1, which is a paragraph
// nobody can read. WCAG's own numbers rather than an opinion about which colours look dark.
//
//   node scripts/check-ink-contrast.mjs
import fs from "node:fs";

const src = fs.readFileSync(new URL("../lib/strip-set.ts", import.meta.url), "utf8");
const table = (name) => Object.fromEntries(
  [...src.slice(src.indexOf(`const ${name}`)).slice(0, src.slice(src.indexOf(`const ${name}`)).indexOf("};"))
    .matchAll(/(\w+): "(#[0-9A-Fa-f]{6})"/g)].map((m) => [m[1], m[2]]),
);
const inks = table("INKS");
const papers = table("PAPERS");

const channel = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => { const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255); };
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

let failed = 0;
for (const [name, ink] of Object.entries(inks)) {
  const paper = papers[name];
  if (!paper) { console.log(`${name.padEnd(12)} no paper of its own`); failed++; continue; }
  const c = contrast(ink, paper);
  const verdict = c >= 7 ? "AAA" : c >= 4.5 ? "AA" : "FAILS";
  if (c < 4.5) failed++;
  console.log(`${name.padEnd(12)} ${ink} on ${paper}  ${c.toFixed(2)}:1  ${verdict}`);
}
console.log(failed ? `\n${failed} ink(s) below 4.5 to 1.` : "\nEvery ink reads on its own paper.");
process.exit(failed ? 1 : 0);
