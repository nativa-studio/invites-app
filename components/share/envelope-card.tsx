import type { Palette } from "@/lib/db/types";

// Drawn by Satori, which has no clip-path and turns CSS border triangles into blocks. The
// envelope is therefore inline SVG, which Satori renders faithfully, with the words laid over
// it as positioned boxes because Satori sets text far better than SVG does.

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount))),
  );
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export type CardVariant = "posted" | "opening" | "sealed";

export type CardInput = {
  palette: Palette;
  /** Who the invite is for. Absent on the group link, which is addressed to nobody in particular. */
  addressee?: string | null;
  title: string;
  when: string;
  /** Absolute URL. Satori fetches it, so a relative path will not do. */
  artwork?: string | null;
  /** Two digits at most, for the stamp. */
  age?: string | null;
  variant?: CardVariant;
};

const W = 1200;
const H = 630;
const PAPER = "#FDF6E4";
const DISPLAY = "Lilita One";
const HAND = "Patrick Hand SC";

function ground(p: Palette, children: React.ReactNode) {
  return (
    <div
      style={{
        width: W, height: H, display: "flex", alignItems: "center", justifyContent: "center",
        background: p.sky,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${p.navy}33 2px, transparent 0)`,
        backgroundSize: "18px 18px",
        fontFamily: "Nunito",
      }}
    >
      {children}
    </div>
  );
}

// A postage stamp with the age on it, the same one the invite uses.
function stamp(p: Palette, age: string | null | undefined, x: number, y: number) {
  const w = 104, h = 122;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, display: "flex", background: "#FFFFFF", padding: 7, borderRadius: 4, transform: "rotate(2deg)" }}>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: p.sky, border: `3px solid ${p.navy}` }}>
        <svg width="34" height="40" viewBox="0 0 26 30">
          <path d="M14 1L2 17h9l-4 12 17-18h-9l5-10z" fill={p.yellow} stroke={p.navy} strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
        {age ? <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: 34, color: "#FFFFFF", lineHeight: 1 }}>{age}</div> : null}
      </div>
    </div>
  );
}

// A. Posted. A cream envelope, hand addressed, stamped and postmarked, with the host's artwork
// sitting in the bottom corner. Cream on cream, so the drawing needs no box around it.
function posted({ palette: p, addressee, title, when, artwork, age }: CardInput) {
  const EW = 920, EH = 505;
  return ground(p,
    <div style={{ position: "relative", width: EW, height: EH, display: "flex", transform: "rotate(-1.2deg)" }}>
      <svg width={EW} height={EH} viewBox={`0 0 ${EW} ${EH}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x="5" y="5" width={EW - 10} height={EH - 10} rx="16" fill={PAPER} stroke={p.navy} strokeWidth="7" />
        <g stroke={p.navy} strokeWidth="5" fill="none" opacity="0.35" strokeLinecap="round">
          <path d={`M${EW - 236} 62 q22 -12 44 0 t44 0`} />
          <path d={`M${EW - 236} 92 q22 -12 44 0 t44 0`} />
          <path d={`M${EW - 236} 122 q22 -12 44 0 t44 0`} />
        </g>
      </svg>
      {stamp(p, age, EW - 150, 34)}
      <div style={{ position: "absolute", left: 76, top: 128, display: "flex", flexDirection: "column", width: 540 }}>
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 30, letterSpacing: 6, color: p.red }}>{addressee ? "TO" : "YOU'RE INVITED"}</div>
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 86, color: p.navy, lineHeight: 1.02, marginTop: 2 }}>{addressee ?? title}</div>
        {addressee ? <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: 40, color: p.navy, marginTop: 24 }}>{title}</div> : null}
        <div style={{ display: "flex", fontSize: 25, fontWeight: 700, color: p.navy, opacity: 0.72, marginTop: 10 }}>{when}</div>
      </div>
      {artwork ? (
        <div style={{ position: "absolute", right: 30, bottom: 18, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork} alt="" height={132} />
        </div>
      ) : null}
    </div>,
  );
}

// B. Opening. The flap is up and the invitation is halfway out, which is the clearest possible
// way of saying there is something in here to open.
function opening({ palette: p, addressee, title, when, artwork, age }: CardInput) {
  const CW = 640, CH = 232, EW = 800, EH = 292;
  const ELEFT = (980 - EW) / 2, ETOP = 252, FLAP_TOP = 178;
  const liner = shade(p.sky, 0.58);
  return ground(p,
    <div style={{ position: "relative", width: 980, height: 580, display: "flex" }}>
      {/* the flap, standing up behind everything */}
      <svg width={EW} height={EH + 120} viewBox={`0 0 ${EW} ${EH + 120}`} style={{ position: "absolute", left: ELEFT, top: FLAP_TOP }}>
        <path d={`M6 ${ETOP - FLAP_TOP} L${EW / 2} 8 L${EW - 6} ${ETOP - FLAP_TOP} Z`} fill={liner} stroke={p.navy} strokeWidth="7" strokeLinejoin="round" />
      </svg>
      {/* the invitation, halfway out */}
      <div
        style={{
          position: "absolute", left: (980 - CW) / 2, top: 16, width: CW, height: CH,
          display: "flex", flexDirection: "column", alignItems: "center",
          background: PAPER, border: `6px solid ${p.navy}`, borderRadius: 12, paddingTop: 22,
          transform: "rotate(-1.2deg)",
        }}
      >
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 23, letterSpacing: 7, color: p.red }}>{age ? "TRAINER WANTED" : "YOU'RE INVITED"}</div>
        <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: 54, color: p.navy, marginTop: 6, lineHeight: 1.04 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: p.navy, opacity: 0.7, marginTop: 10 }}>{when}</div>
      </div>
      {/* the envelope front, over the card */}
      <svg width={EW} height={EH} viewBox={`0 0 ${EW} ${EH}`} style={{ position: "absolute", left: ELEFT, top: ETOP }}>
        <rect x="5" y="5" width={EW - 10} height={EH - 10} rx="14" fill={p.red} stroke={p.navy} strokeWidth="7" />
        <path d={`M8 8 L${EW / 2} 150 L${EW - 8} 8`} fill="none" stroke={shade(p.red, -0.22)} strokeWidth="6" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: ELEFT + 54, top: ETOP + 168, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 21, letterSpacing: 6, color: p.cream }}>{addressee ? "TO" : ""}</div>
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 50, color: "#FFFFFF", lineHeight: 1 }}>{addressee ?? ""}</div>
      </div>
      {artwork ? (
        <div
          style={{
            position: "absolute", right: 26, top: ETOP + 138, display: "flex",
            background: PAPER, border: `5px solid ${p.navy}`, borderRadius: 10,
            padding: "6px 8px", transform: "rotate(-2.5deg)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork} alt="" height={98} />
        </div>
      ) : null}
    </div>,
  );
}

// C. Sealed. No artwork at all, which is what every event gets before a host uploads anything,
// and what a memorial or a quiet dinner should get regardless.
function sealed({ palette: p, addressee, title, when }: CardInput) {
  const EW = 900, EH = 512, FLAP = 226;
  return ground(p,
    <div style={{ position: "relative", width: EW, height: EH, display: "flex", transform: "rotate(1deg)" }}>
      <svg width={EW} height={EH} viewBox={`0 0 ${EW} ${EH}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x="5" y="5" width={EW - 10} height={EH - 10} rx="16" fill={PAPER} stroke={p.navy} strokeWidth="7" />
        <path d={`M9 14 L${EW - 9} 14 L${EW / 2} ${FLAP} Z`} fill={shade(PAPER, -0.07)} stroke={p.navy} strokeWidth="7" strokeLinejoin="round" />
        <circle cx={EW / 2} cy={FLAP} r="36" fill={p.red} stroke={p.navy} strokeWidth="6" />
        <circle cx={EW / 2} cy={FLAP} r="23" fill="none" stroke={shade(p.red, 0.4)} strokeWidth="3" />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 288, width: EW, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {addressee ? <div style={{ display: "flex", fontFamily: HAND, fontSize: 26, letterSpacing: 7, color: p.red }}>TO</div> : null}
        <div style={{ display: "flex", fontFamily: HAND, fontSize: addressee ? 68 : 52, color: p.navy, lineHeight: 1.02 }}>{addressee ?? title}</div>
        {addressee ? <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: 34, color: p.navy, marginTop: 10 }}>{title}</div> : null}
        <div style={{ display: "flex", fontSize: 23, fontWeight: 700, color: p.navy, opacity: 0.7, marginTop: 6 }}>{when}</div>
      </div>
    </div>,
  );
}

export function envelopeCard(input: CardInput) {
  const variant: CardVariant = input.variant ?? (input.artwork ? "posted" : "sealed");
  if (variant === "opening") return opening(input);
  if (variant === "sealed") return sealed(input);
  return posted(input);
}

export const CARD_SIZE = { width: W, height: H };
