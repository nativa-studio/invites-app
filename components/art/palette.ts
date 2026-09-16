import type { Palette } from "@/lib/db/types";

export const POSTER: Palette = { sky: "#2B6CB0", navy: "#1B2A4A", yellow: "#F5C531", cream: "#F3E3B5", red: "#D9432C", paper: "#FFF8E6", forest: "#2F7F7A" };
export const SUMMER: Palette = { sky: "#F6EFE1", navy: "#2A2320", yellow: "#E8B33A", cream: "#FBF7EF", red: "#BD5528", paper: "#FBF7EF", forest: "#4F6B4A" };

export function paletteFor(p: Palette | null | undefined, theme: string): Palette {
  if (p) return { ...POSTER, ...p };
  return theme === "poster" || theme === "gabriel" ? POSTER : SUMMER;
}

export function paletteVars(p: Palette): React.CSSProperties {
  return {
    "--sky": p.sky, "--navy": p.navy, "--yel": p.yellow, "--crm": p.cream, "--red": p.red, "--paper": p.paper, "--forest": p.forest,
  } as React.CSSProperties;
}
