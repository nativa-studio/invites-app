import type { Palette } from "@/lib/db/types";

export const POSTER: Palette = { sky: "#2B6CB0", navy: "#1B2A4A", yellow: "#F5C531", cream: "#F3E3B5", red: "#D9432C", paper: "#FFF8E6", forest: "#2F7F7A" };
export const SUMMER: Palette = { sky: "#F6EFE1", navy: "#2A2320", yellow: "#E8B33A", cream: "#FBF7EF", red: "#BD5528", paper: "#FBF7EF", forest: "#4F6B4A" };

export function paletteFor(p: Palette | null | undefined, theme: string): Palette {
  if (p) return { ...POSTER, ...p };
  return theme === "poster" || theme === "gabriel" ? POSTER : SUMMER;
}

// The sky is two jobs in one colour, and on one palette that is a problem.
//
// It is the ground the whole invite sits on, and it is also the ink for the small blue words:
// the card labels, the clock and pin captions, the venue line, and the guest's own name in "Can
// Mia make it?". On the poster palette those are a blue on cream and read the way they look in
// the design. On the quiet palette the ground IS the sky, a cream, so every one of those words
// was cream on cream. Measured against the paper behind it: 1.07 to 1, which is not subtle, it
// is invisible. It is the same fault that hid Tap to open, in a second place.
//
// So the ink is chosen rather than assumed, and chosen by measuring: the sky where it stands off
// the paper, the forest where it does not, the navy if neither does. WCAG's own ratio, and its
// 4.5 for text, rather than an opinion about which colours look light.
function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  const n = parseInt(full, 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function skyInk(p: Palette): string {
  if (contrast(p.sky, p.paper) >= 4.5) return p.sky;
  if (contrast(p.forest, p.paper) >= 4.5) return p.forest;
  return p.navy;
}

export function paletteVars(p: Palette): React.CSSProperties {
  return {
    "--sky": p.sky, "--navy": p.navy, "--yel": p.yellow, "--crm": p.cream, "--red": p.red, "--paper": p.paper, "--forest": p.forest,
    "--sky-ink": skyInk(p),
  } as React.CSSProperties;
}
