// Monoline doodles: one line, one ink, no fill.
//
// The poster icons in `icons.tsx` are flat colour with a navy keyline, which is right for the
// stationery suite and wrong for the illustrated strip: the strip is one ink on paper, so a
// picture that carries four colours of its own is not in the set. These are the same subjects
// drawn the other way, ported from `design/round1/gen3.py`.
//
// Every stroke is `currentColor`, so the ink is chosen once on the page and every picture on it
// follows. That is what makes the set swappable: nothing here knows which ink it is drawn in.
import React from "react";
import type { NoteKind } from "@/lib/good-to-know";

const PATHS = {
  balloon: '<path d="M32 8c-9 0-15 7-15 16 0 10 8 18 15 22 7-4 15-12 15-22 0-9-6-16-15-16z"/><path d="M30 46l2 4-2 4 2 4M22 20c0-4 3-7 6-8"/>',
  sun: '<circle cx="32" cy="32" r="11"/><path d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M15 49l5-5M44 20l5-5"/>',
  ring: '<ellipse cx="32" cy="34" rx="22" ry="12"/><ellipse cx="32" cy="34" rx="9" ry="5"/><path d="M14 30c4-6 32-6 36 0"/>',
  // Redrawn from the board's: at 56px its candles were three stubs and its icing read as hatching.
  cake: '<path d="M12 38h40v16H12z"/><path d="M12 38c0-7 40-7 40 0"/><path d="M20 31V21M32 31V19M44 31V21"/><path d="M20 21c-3-3-1-6 0-7 1 1 3 4 0 7M32 19c-3-3-1-6 0-7 1 1 3 4 0 7M44 21c-3-3-1-6 0-7 1 1 3 4 0 7"/>',
  sausage: '<path d="M10 38c0-8 44-8 44 0M10 38c0 8 44 8 44 0M16 30c6-8 26-8 32 0"/><path d="M24 18c0-3 3-3 3-6M36 18c0-3 3-3 3-6"/>',
  car: '<path d="M12 40l4-12h32l4 12M8 40h48v10H8z"/><circle cx="18" cy="52" r="4"/><circle cx="46" cy="52" r="4"/><path d="M20 34h24"/>',
  gate: '<path d="M12 56V20M52 56V20M12 22c14-10 26-10 40 0M20 56V30M28 56V26M36 56V26M44 56V30"/>',
  towel: '<path d="M16 12h32v40H16zM16 22h32M16 42h32"/>',
  gift: '<rect x="12" y="26" width="40" height="28" rx="2"/><path d="M12 36h40M32 26v28M32 26c-6 0-12-3-12-8s8-4 12 8c4-12 12-13 12-8s-6 8-12 8z"/>',
  kids: '<circle cx="22" cy="18" r="7"/><circle cx="44" cy="24" r="5"/><path d="M8 56v-8a14 14 0 0 1 28 0v8M36 56v-5a9 9 0 0 1 18 0v5"/>',
  shower: '<path d="M14 14a10 10 0 0 1 20 4h8a10 10 0 0 1 10 10v2H24v-2a10 10 0 0 1 2-6"/><path d="M28 38v3M36 38v8M44 38v3M32 50v3M40 50v3"/>',
  glasses: '<path d="M12 12h16l-2 16a6 6 0 0 1-12 0zM20 34v16M12 50h16"/><path d="M40 20l8 4-4 22M36 46l14 4"/>',
  disco: '<circle cx="32" cy="34" r="16"/><path d="M32 8v10M16 34h32M32 18v32M20 24c8 6 16 6 24 0M20 44c8-6 16-6 24 0"/>',
  pram: '<path d="M10 20h8l4 16h28a12 12 0 0 1-12 12H22a12 12 0 0 1-12-12V20z"/><circle cx="24" cy="54" r="4"/><circle cx="46" cy="54" r="4"/><path d="M30 12c8-6 18 0 20 8"/>',
  // Same: the string barely sagged, so three flags hung in mid air and it read as a zigzag.
  bunting: '<path d="M4 16c14 14 42 14 56 0"/><path d="M12 23l5 14 5-14M27 28l5 14 5-14M42 23l5 14 5-14"/>',
  candle: '<path d="M26 30h12v24H26zM32 22c-4-4-2-9 0-10 2 1 4 6 0 10z"/><path d="M20 56h24"/>',
  leaf: '<path d="M16 48C16 28 32 14 50 12c-2 18-14 34-34 36z"/><path d="M18 46c8-10 18-20 28-28"/>',
  camera: '<rect x="10" y="20" width="44" height="30" rx="4"/><circle cx="32" cy="35" r="9"/><path d="M22 20l4-6h12l4 6"/>',
  bubble: '<path d="M12 14h40v26H30l-10 10V40h-8z"/><path d="M20 24h24M20 30h16"/>',
  map: '<path d="M32 56s16-14 16-28a16 16 0 0 0-32 0c0 14 16 28 16 28z"/><circle cx="32" cy="28" r="6"/>',
  // The six the strip needed that the board never drew, in the same hand: same 64 box, same
  // weight, no fill, nothing that only reads in colour.
  cap: '<path d="M32 13L18 48h28L32 13z"/><path d="M13 50h38"/><circle cx="32" cy="8" r="4"/><path d="M25 34c4 2 10 2 14 0"/>',
  ball: '<circle cx="32" cy="32" r="22"/><path d="M10 32h44M32 10c8 7 8 37 0 44M32 10c-8 7-8 37 0 44"/>',
  plate: '<circle cx="35" cy="32" r="18"/><circle cx="35" cy="32" r="11"/><path d="M8 12v12a3 3 0 0 0 6 0V12M11 27v25"/>',
  cup: '<path d="M14 20h28v18a14 14 0 0 1-28 0z"/><path d="M42 24h5a6 6 0 0 1 0 12h-5"/><path d="M10 56h36"/>',
  bolt: '<path d="M36 6L16 36h12l-4 22 22-32H34l4-20z"/>',
  clock: '<circle cx="32" cy="32" r="22"/><path d="M32 18v14l10 6"/>',
  // Diwali. The diya is the one everybody knows, so it stands in the middle of the trio; the
  // lantern and the rangoli are either side of it and read at 56px without needing colour, which
  // a string of fairy lights or a marigold garland does not.
  diya: '<path d="M8 36h48"/><path d="M10 36c3 10 11 16 22 16s19-6 22-16"/><path d="M32 36v-5"/><path d="M32 31c-5-5-3-11 0-14 3 3 5 9 0 14z"/>',
  // Second go. The first was straight-sided with three long strokes under it and read as a box on
  // legs. A paper lantern is the bulge and the fringe, so both got bigger.
  lantern: '<path d="M32 4v6"/><path d="M23 10h18"/><path d="M23 10c-7 6-7 22 0 28M41 10c7 6 7 22 0 28"/><path d="M23 38h18"/><path d="M17 24h30"/><path d="M26 38v8M29 38v10M32 38v12M35 38v10M38 38v8"/>',
  rangoli: '<circle cx="32" cy="32" r="6"/><path d="M32 13c4 6 4 10 0 13-4-3-4-7 0-13zM32 51c4-6 4-10 0-13-4 3-4 7 0 13zM13 32c6-4 10-4 13 0-3 4-7 4-13 0zM51 32c-6-4-10-4-13 0 3 4 7 4 13 0z"/><path d="M18 18c7 1 10 4 11 11-7-1-10-4-11-11zM46 46c-7-1-10-4-11-11 7 1 10 4 11 11zM18 46c1-7 4-10 11-11-1 7-4 10-11 11zM46 18c-1 7-4 10-11 11 1-7 4-10 11-11z"/>',
} as const;

// The poster set and this one do not name every picture the same way, and the runsheet already
// stores a poster name against each stop. Rather than migrate what hosts have saved, the two
// names that differ meet here.
const ALIAS = { bbq: "sausage", pin: "map" } as const;

/** Every picture in the set, as a type, the aliases below included. A set naming one that was
 *  never drawn is a cover that comes out as a speech bubble, and nothing at runtime would say
 *  so, so the compiler does. */
export type MonoName = keyof typeof PATHS | keyof typeof ALIAS;


// The lookups run over widened copies: the narrow types above are there so a set or a note
// cannot name a picture that was never drawn, and a runsheet icon arrives as a plain string.
const PATH_OF: Record<string, string> = PATHS;
const ALIAS_OF: Record<string, string> = ALIAS;

/** The raw path data for one picture, for anywhere that cannot render a React component: the
 *  share card is drawn by Satori from a string of SVG, not from this module's JSX. */
export function monoPath(name: MonoName): string {
  return PATH_OF[ALIAS_OF[name] ?? name] ?? PATHS.bubble;
}

// The same picture as real elements rather than a string of markup.
//
// The share card is drawn by Satori, which renders SVG faithfully and refuses
// dangerouslySetInnerHTML outright, so the one place that cannot take the string needs the
// shapes. The set is written as markup because that is how it was drawn and how it reads; this
// reads it back. Every attribute in it is a plain lowercase SVG attribute, which React takes
// as-is, so there is no name mapping to keep in step.
const TAG = /<(path|circle|ellipse|rect)\s([^>]*?)\/?>/g;
const ATTR = /([a-zA-Z-]+)="([^"]*)"/g;

export function monoShapes(name: MonoName): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  for (const tag of monoPath(name).matchAll(TAG)) {
    const props: Record<string, string> = {};
    for (const a of tag[2].matchAll(ATTR)) props[a[1]] = a[2];
    out.push(React.createElement(tag[1], { key: out.length, ...props }));
  }
  return out;
}

export function hasMono(name: string | null | undefined): name is MonoName {
  const n = ALIAS_OF[name ?? ""] ?? name ?? "";
  return n in PATH_OF;
}

/** One doodle. `name` is a picture in the set; anything unknown draws the speech bubble, which is
 *  the one that says "there is something written here" rather than saying the wrong thing. */
export function Mono({ name, size = 44 }: { name: MonoName; size?: number }) {
  const key = ALIAS_OF[name] ?? name;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATH_OF[key] ?? PATHS.bubble }}
    />
  );
}

// The same reading of a good-to-know line that the suite does, drawn in this set instead.
//
// It is deliberately the same rules rather than a second opinion: a line about sunscreen gets the
// sun in both layouts, so a host who switches design does not find their invite saying something
// different. The suite's copy of this lives in `Cards.tsx`; when one changes, change both.
export function monoNote(kind: NoteKind, text: string): MonoName {
  if (kind === "siblings") return "kids";
  if (kind === "bring") return /sun|hat|sunscreen|burn|shade/i.test(text) ? "sun" : "towel";
  if (kind === "serve") return /bbq|barbecue|barbeque|sausage|grill|spit/i.test(text) ? "sausage" : /cake/i.test(text) ? "cake" : "sausage";
  if (kind === "drinks") return "cup";
  if (kind === "plate") return "plate";
  if (kind === "photos") return "camera";
  if (/shower/i.test(text)) return "shower";
  return "bubble";
}
