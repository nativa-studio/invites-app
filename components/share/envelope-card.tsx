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
  /** Shown only when there is no addressee, on the group link. */
  title: string;
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
// standing in the bottom corner. The name is the only thing written on it: a chat app already
// prints the title and the date as text under the picture, so repeating them here says it twice.
function posted({ palette: p, addressee, title, artwork, age }: CardInput) {
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
      <div style={{ position: "absolute", left: 80, top: 176, display: "flex", flexDirection: "column", width: 580 }}>
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 36, letterSpacing: 8, color: p.red }}>{addressee ? "TO" : "YOU'RE INVITED"}</div>
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 118, color: p.navy, lineHeight: 1.02, marginTop: 4 }}>{addressee ?? title}</div>
      </div>
      {artwork ? (
        <div style={{ position: "absolute", right: 44, bottom: 26, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork} alt="" height={168} />
        </div>
      ) : null}
    </div>,
  );
}

// B. Opening. The flap is up and the invitation is halfway out, which is the clearest possible
// way of saying there is something in here to open.
function opening({ palette: p, addressee, title, artwork }: CardInput) {
  const CW = 660, CH = 252, EW = 800, EH = 292;
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
          position: "absolute", left: (980 - CW) / 2, top: 8, width: CW, height: CH,
          display: "flex", flexDirection: "column", alignItems: "center",
          background: PAPER, border: `6px solid ${p.navy}`, borderRadius: 12, paddingTop: 18,
          transform: "rotate(-1.2deg)",
        }}
      >
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 26, letterSpacing: 8, color: p.red }}>YOU&apos;RE INVITED</div>
        {artwork ? (
          <div style={{ display: "flex", marginTop: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artwork} alt="" height={168} />
          </div>
        ) : (
          <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: 62, color: p.navy, marginTop: 20, lineHeight: 1.04 }}>{title}</div>
        )}
      </div>
      {/* the envelope front, over the card */}
      <svg width={EW} height={EH} viewBox={`0 0 ${EW} ${EH}`} style={{ position: "absolute", left: ELEFT, top: ETOP }}>
        <rect x="5" y="5" width={EW - 10} height={EH - 10} rx="14" fill={p.red} stroke={p.navy} strokeWidth="7" />
        <path d={`M8 8 L${EW / 2} 150 L${EW - 8} 8`} fill="none" stroke={shade(p.red, -0.22)} strokeWidth="6" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: ELEFT + 56, top: ETOP + 148, width: EW - 112, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 24, letterSpacing: 7, color: p.cream }}>{addressee ? "TO" : ""}</div>
        <div style={{ display: "flex", fontFamily: HAND, fontSize: 72, color: "#FFFFFF", lineHeight: 1.02 }}>{addressee ?? ""}</div>
      </div>
    </div>,
  );
}

// C. Sealed. No artwork at all, which is what every event gets before a host uploads anything,
// and what a memorial or a quiet dinner should get regardless.
// A sealed envelope, front on, filling the frame. This is the picture a text message shows, so it
// has one job: look like a letter addressed to the person reading it, before they have read a word
// of the message. The name is the loudest thing on it, and the stamp carries the age the way the
// invite's own seal does.
function sealed({ palette: p, addressee, title, age }: CardInput) {
  const ink = shade(p.red, -0.45);
  const name = (addressee ?? title).toUpperCase();
  // Fit the name to the space rather than guessing from its length. A guest is called whatever
  // they are called, and the group link puts a whole title here, so a fixed size either wraps a
  // long one with one word stranded on the second line, or wastes half the envelope on a short
  // one. 0.62em is close enough to this face's average capital, and the floor and ceiling keep
  // both extremes readable.
  const room = W - 260;
  const track = name.length > 22 ? 8 : 14;
  const size = Math.max(34, Math.min(82, Math.floor((room / name.length - track) / 0.62)));
  return (
    <div style={{ width: W, height: H, display: "flex", background: "#FFFFFF", padding: 26, fontFamily: "Nunito" }}>
      <div style={{ position: "relative", width: W - 52, height: H - 52, display: "flex", background: p.red, borderRadius: 22 }}>
        {/* The postmark: a ring and its cancellation lines, up in the corner where one lands. */}
        <svg width="360" height="150" viewBox="0 0 360 150" style={{ position: "absolute", left: 300, top: 34 }}>
          <g fill="none" stroke={ink} strokeWidth="3" opacity="0.5">
            <circle cx="72" cy="72" r="56" />
            <circle cx="72" cy="72" r="42" />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M140 ${44 + i * 18} q30 -10 60 0 t60 0 t60 0`} />
            ))}
          </g>
        </svg>
        {/* The stamp, with the age on it where a denomination would be. */}
        <div style={{ position: "absolute", right: 44, top: 34, width: 132, height: 156, display: "flex", padding: 9, background: "#FFFFFF", borderRadius: 3, transform: "rotate(2deg)" }}>
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: shade(p.red, 0.82), border: `3px solid ${ink}` }}>
            <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: age && age.length > 1 ? 66 : 80, color: ink }}>{age ?? ""}</div>
          </div>
        </div>
        {/* Who it is for. Letterspaced capitals, the way a name is written on an envelope. */}
        <div style={{ position: "absolute", left: 96, top: 300, width: W - 260, display: "flex" }}>
          <div style={{ display: "flex", fontSize: size, letterSpacing: track, color: PAPER, lineHeight: 1.1 }}>{name}</div>
        </div>
      </div>
    </div>
  );
}

export function envelopeCard(input: CardInput) {
  // A sealed envelope is what a message should show: a letter with the reader's name on it.
  // The other two stay reachable with ?style= for comparing them.
  const variant: CardVariant = input.variant ?? "sealed";
  if (variant === "opening") return opening(input);
  if (variant === "sealed") return sealed(input);
  return posted(input);
}

export const CARD_SIZE = { width: W, height: H };
