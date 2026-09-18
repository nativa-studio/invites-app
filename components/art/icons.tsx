// Poster-style icons: flat fills with a navy keyline. Colours come from the palette CSS variables.
type P = { size?: number };
const S = { fill: "var(--sky)", navy: "var(--navy)", yel: "var(--yel)", crm: "var(--crm)", red: "var(--red)", forest: "var(--forest)" };
const kl = { stroke: S.navy, strokeWidth: 3, strokeLinejoin: "round" as const };

export function Cap({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><path d="M12 36a20 20 0 0 1 40 0z" fill={S.red} {...kl} /><path d="M8 36h52l-6 8H14z" fill={S.crm} {...kl} /><circle cx="32" cy="34" r="6" fill="#fff" {...kl} /></svg>);
}
export function Ball({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="#fff" {...kl} /><path d="M6 32a26 26 0 0 1 52 0z" fill={S.red} {...kl} /><path d="M6 32h52" stroke={S.navy} strokeWidth="4" /><circle cx="32" cy="32" r="8" fill="#fff" {...kl} /></svg>);
}
export function Ring({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24" fill={S.red} {...kl} /><circle cx="32" cy="32" r="10" fill={S.fill} {...kl} /><path d="M32 8a24 24 0 0 1 24 24H46a14 14 0 0 0-14-14z" fill="#fff" /><path d="M32 56a24 24 0 0 1-24-24h10a14 14 0 0 0 14 14z" fill="#fff" /></svg>);
}
export function Cake({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="34" width="40" height="22" rx="3" fill={S.yel} {...kl} /><path d="M12 38c6 6 10-4 16 2s10-4 16 2 6-2 8 0v-4H12z" fill={S.red} stroke={S.navy} strokeWidth="2" /><g stroke={S.navy} strokeWidth="3" strokeLinecap="round"><path d="M20 34V22M32 34V20M44 34V22" /></g><g fill={S.red}><circle cx="20" cy="18" r="3" /><circle cx="32" cy="16" r="3" /><circle cx="44" cy="18" r="3" /></g></svg>);
}
export function Car({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><path d="M10 40l6-12h32l6 12z" fill={S.fill} {...kl} /><rect x="6" y="38" width="52" height="14" rx="4" fill={S.red} {...kl} /><circle cx="18" cy="54" r="5" fill={S.navy} /><circle cx="46" cy="54" r="5" fill={S.navy} /></svg>);
}
export function Gift({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="26" width="40" height="30" rx="3" fill={S.red} {...kl} /><rect x="28" y="26" width="8" height="30" fill={S.yel} stroke={S.navy} strokeWidth="2" /><rect x="10" y="20" width="44" height="10" rx="3" fill={S.fill} {...kl} /></svg>);
}
export function Camera({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="20" width="48" height="32" rx="6" fill={S.fill} {...kl} /><circle cx="32" cy="36" r="10" fill={S.crm} {...kl} /><circle cx="32" cy="36" r="4" fill={S.navy} /><rect x="22" y="12" width="20" height="10" rx="3" fill={S.red} {...kl} /></svg>);
}
export function Kids({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><circle cx="22" cy="18" r="8" fill={S.yel} {...kl} /><circle cx="44" cy="24" r="6" fill={S.crm} {...kl} /><path d="M8 56v-8a14 14 0 0 1 28 0v8z" fill={S.red} {...kl} /><path d="M36 56v-5a9 9 0 0 1 18 0v5z" fill={S.fill} {...kl} /></svg>);
}
export function Towel({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="10" width="36" height="44" rx="3" fill={S.fill} {...kl} /><rect x="14" y="22" width="36" height="6" fill="#fff" /><rect x="14" y="36" width="36" height="6" fill="#fff" /></svg>);
}
export function Plate({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="38" rx="26" ry="12" fill="#fff" {...kl} /><ellipse cx="32" cy="36" rx="16" ry="7" fill={S.yel} {...kl} /><path d="M22 34c4-8 16-8 20 0" fill={S.red} {...kl} /></svg>);
}
export function Bolt({ size = 30 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><path d="M36 4L12 36h18l-8 24 30-36H34l10-20z" fill={S.yel} {...kl} /></svg>);
}
export function Bubble({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><path d="M10 12h44v28H30l-12 12V40h-8z" fill={S.yel} {...kl} /><circle cx="22" cy="26" r="3" fill={S.navy} /><circle cx="32" cy="26" r="3" fill={S.navy} /><circle cx="42" cy="26" r="3" fill={S.navy} /></svg>);
}
export function Gate({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="22" width="44" height="34" fill={S.forest} {...kl} /><path d="M10 22c14-10 30-10 44 0" fill={S.crm} {...kl} /><path d="M22 56V30M32 56V28M42 56V30" stroke={S.navy} strokeWidth="3" /></svg>);
}
export function Clock({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="24" fill={S.crm} {...kl} /><path d="M32 20v14h11" fill="none" stroke={S.navy} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M26 8h12" stroke={S.navy} strokeWidth="4" strokeLinecap="round" /><path d="M32 8v2" stroke={S.navy} strokeWidth="4" strokeLinecap="round" /></svg>);
}
export function Pin({ size = 48 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><path d="M32 58S12 39 12 26a20 20 0 0 1 40 0c0 13-20 32-20 32z" fill={S.red} {...kl} /><circle cx="32" cy="25" r="8" fill={S.crm} {...kl} /></svg>);
}
export function Chev({ size = 30 }: P) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><path d="M16 24l16 16 16-16" fill="none" stroke={S.navy} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
export const ICONS: Record<string, (p: P) => React.ReactElement> = { cap: Cap, ball: Ball, ring: Ring, cake: Cake, car: Car, gift: Gift, camera: Camera, kids: Kids, towel: Towel, plate: Plate, gate: Gate, bolt: Bolt, clock: Clock, pin: Pin };
