import type { CSSProperties } from "react";

// The accent colour comes from Airtable so the host can retheme the invite
// without a deploy. Anything that isn't a hex colour is ignored.
export function accentStyle(hex: string): CSSProperties | undefined {
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return undefined;
  return { "--accent": hex } as CSSProperties;
}
