import type { Palette } from "@/lib/db/types";

// Satori draws these images. It has no clip-path and turns CSS border triangles into blocks,
// so the envelope is drawn as inline SVG, which it renders faithfully. Text sits over it as
// absolutely positioned boxes, because Satori lays text out far better than SVG does.
function darken(hex: string, amount = 0.16): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.round(v * (1 - amount))));
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export type CardInput = {
  palette: Palette;
  /** Who the invite is for. Absent on the group link, which is addressed to nobody in particular. */
  addressee?: string | null;
  title: string;
  when: string;
  /** Absolute URL. Satori fetches it, so a relative path will not do. */
  artwork?: string | null;
};

const W = 1200;
const H = 630;
const EW = 880;
const EH = 470;
const FLAP_Y = 236;

export function envelopeCard({ palette: p, addressee, title, when, artwork }: CardInput) {
  const flap = darken(p.red);
  return (
    <div
      style={{
        width: W, height: H, display: "flex", alignItems: "center", justifyContent: "center",
        background: p.sky,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${p.navy}33 2px, transparent 0)`,
        backgroundSize: "18px 18px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ position: "relative", width: EW, height: EH, display: "flex" }}>
        <svg width={EW} height={EH} viewBox={`0 0 ${EW} ${EH}`} style={{ position: "absolute", left: 0, top: 0 }}>
          <rect x="4" y="4" width={EW - 8} height={EH - 8} rx="18" fill={p.red} stroke={p.navy} strokeWidth="7" />
          <path d={`M8 12 L${EW - 8} 12 L${EW / 2} ${FLAP_Y} Z`} fill={flap} stroke={p.navy} strokeWidth="7" strokeLinejoin="round" />
          <circle cx={EW / 2} cy={FLAP_Y} r="32" fill={p.yellow} stroke={p.navy} strokeWidth="6" />
        </svg>

        <div style={{ position: "absolute", left: 60, top: 272, display: "flex", flexDirection: "column", width: 460 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 7, color: p.cream, textTransform: "uppercase" }}>
            {addressee ? "To" : "You're invited"}
          </div>
          <div style={{ display: "flex", fontSize: addressee ? 60 : 46, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.04, marginTop: 4 }}>
            {addressee ?? title}
          </div>
          {addressee ? (
            <div style={{ display: "flex", fontSize: 26, color: p.cream, marginTop: 14 }}>{title}</div>
          ) : null}
          <div style={{ display: "flex", fontSize: 22, color: p.cream, marginTop: 6 }}>{when}</div>
        </div>

        {/* The host's own artwork, small in the corner, stuck on like a sticker */}
        {artwork ? (
          <div
            style={{
              position: "absolute", right: 34, bottom: 30, display: "flex",
              background: p.paper, border: `5px solid ${p.navy}`, borderRadius: 12,
              padding: 6, transform: "rotate(-2deg)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artwork} alt="" height={116} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const CARD_SIZE = { width: W, height: H };
