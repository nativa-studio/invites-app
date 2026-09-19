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

export type CardVariant = "front" | "back" | "posted" | "opening" | "sealed";

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

// The back of the same envelope: the flap folded down, the wax seal holding it shut, the name,
// the characters. A postmark and a stamp were here too once, on the argument that one picture
// could do two jobs, and they read as the front. They live on the front now, where they belong.
//
// This is the face that goes in a message, because it is the face the guest then taps open: the
// picture in the chat and the thing on the page are one object.
function back({ palette: p, addressee, title, artwork }: CardInput) {
  const body = shade(p.red, -0.18);
  const rim = shade(p.red, -0.32);
  const PAD = 26;
  const EW = W - PAD * 2, EH = H - PAD * 2;
  const APEX = 300;
  return (
    <div style={{ width: W, height: H, display: "flex", background: "#FFFFFF", padding: PAD, fontFamily: "Nunito" }}>
      <div style={{ position: "relative", width: EW, height: EH, display: "flex", background: body, borderRadius: 22 }}>
        {/* The flap, folded down, lighter than the body it lies on, exactly as in the app. */}
        <svg width={EW} height={APEX + 14} viewBox={`0 0 ${EW} ${APEX + 14}`} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={`M0 0 L${EW / 2} ${APEX} L${EW} 0 Z`} fill={p.red} />
          <path d={`M0 0 L${EW / 2} ${APEX} L${EW} 0`} fill="none" stroke={rim} strokeWidth="5" strokeLinejoin="round" />
        </svg>
        {/* The wax seal, at the point of the flap, holding it shut. */}
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", left: EW / 2 - 60, top: APEX - 60 }}>
          <circle cx="60" cy="60" r="52" fill={p.yellow} stroke={p.navy} strokeWidth="7" />
          <path d="M66 24L34 66h24l-10 30 42-46H66l13-26z" fill={p.navy} />
        </svg>
        {nameBlock(p, addressee, title, false)}
        {characters(artwork)}
      </div>
    </div>
  );
}

// The name, written where a name is written on an envelope. Both faces use this, so a guest sees
// the same words in the same place whichever side they are looking at.
//
// Fitted to the space rather than guessed from its length: a guest is called whatever they are
// called, so a fixed size either wraps a long name with a word stranded on the second line, or
// wastes half the envelope on a short one.
//
// Both numbers here were wrong once, and were corrected by measuring the card rather than
// reasoning about it. The room is the gap: the name starts 88 in and the characters stand 369
// wide in a corner inset 40, which leaves 627. It said 700, the whole width across to the corner,
// so "Anastasia and Christopher" was drawn straight through them. And 0.72em, not the 0.62 that
// was here, is what a capital of this face costs once a name is full of the wide ones: at 0.62,
// "Kate and Tom Richardson" was sized to 617 of the 624 available, came out 40 px wider than
// that, and wrapped. Sizing a shade small never shows. A stranded word does.
const ROOM = 624;

function nameBlock(p: Palette, addressee: string | null | undefined, title: string, fallback: boolean) {
  // The group link is addressed to nobody, so there is no name to write. On the back that line
  // is simply left out: a chat app prints the title as text directly under the picture, and
  // saying it twice in two type sizes looks like a mistake. The front is not in a chat, it is on
  // the page itself with nothing printed under it, so there the title takes the name's place
  // rather than leaving the envelope blank.
  const big = addressee ?? (fallback ? title : null);
  const name = (big ?? "").toUpperCase();
  const track = name.length > 20 ? 7 : 12;
  const size = Math.max(26, Math.min(74, Math.floor((ROOM / Math.max(1, name.length) - track) / 0.72)));
  return (
    <div style={{ position: "absolute", left: 88, bottom: 92, display: "flex", flexDirection: "column", width: ROOM }}>
      <div style={{ display: "flex", fontFamily: HAND, fontSize: 30, letterSpacing: 9, color: p.cream, opacity: 0.85 }}>
        {addressee ? "INVITE FOR" : "YOU'RE INVITED"}
      </div>
      {big ? (
        <div style={{ display: "flex", fontSize: size, letterSpacing: track, color: PAPER, lineHeight: 1.1, marginTop: 10 }}>{name}</div>
      ) : null}
    </div>
  );
}

// The characters, standing along the bottom corner, the same band the app stands there.
function characters(artwork: string | null | undefined) {
  if (!artwork) return null;
  return (
    <div style={{ position: "absolute", right: 40, bottom: 26, display: "flex" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={artwork} alt="" height={132} />
    </div>
  );
}

// The front of the same red envelope. One object with two faces: this one is what it looks like
// coming towards you, so it carries the things a postie puts on a letter, the stamp and the
// postmark, and it has no flap and no seal, because both of those are round the other side.
//
// Everything it shares with the back is drawn from the same numbers: the body colour, the corner
// radius, where the name sits and how it is fitted, and the band of characters. The two should
// look like one envelope turned over, not like two envelopes.
function front({ palette: p, addressee, title, age, artwork }: CardInput) {
  const body = shade(p.red, -0.18);
  const mark = shade(p.red, -0.38);
  const PAD = 26;
  const EW = W - PAD * 2, EH = H - PAD * 2;
  return (
    <div style={{ width: W, height: H, display: "flex", background: "#FFFFFF", padding: PAD, fontFamily: "Nunito" }}>
      <div style={{ position: "relative", width: EW, height: EH, display: "flex", background: body, borderRadius: 22 }}>
        {/* The seam along the top, where the flap folds over from behind. The only sign from this
            side that there is a flap at all. */}
        <svg width={EW} height="10" viewBox={`0 0 ${EW} 10`} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={`M22 6 L${EW - 22} 6`} stroke={mark} strokeWidth="4" opacity="0.5" strokeLinecap="round" />
        </svg>
        {/* The postmark, struck beside the stamp the way one is. */}
        <svg width="300" height="150" viewBox="0 0 300 150" style={{ position: "absolute", right: 210, top: 44 }}>
          <g fill="none" stroke={mark} strokeWidth="4" opacity="0.55" strokeLinecap="round">
            <circle cx="70" cy="72" r="56" />
            <circle cx="70" cy="72" r="42" />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M138 ${46 + i * 18} q30 -11 60 0 t60 0`} />
            ))}
          </g>
        </svg>
        {/* The stamp, with the age where a denomination goes. */}
        <div style={{ position: "absolute", right: 44, top: 34, width: 132, height: 156, display: "flex", padding: 9, background: "#FFFFFF", borderRadius: 3, transform: "rotate(2deg)" }}>
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, background: p.sky, border: `3px solid ${p.navy}` }}>
            <svg width="40" height="46" viewBox="0 0 26 30">
              <path d="M14 1L2 17h9l-4 12 17-18h-9l5-10z" fill={p.yellow} stroke={p.navy} strokeWidth="2.4" strokeLinejoin="round" />
            </svg>
            {age ? <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: 44, color: "#FFFFFF", lineHeight: 1 }}>{age}</div> : null}
          </div>
        </div>
        {nameBlock(p, addressee, title, true)}
        {characters(artwork)}
      </div>
    </div>
  );
}

export function envelopeCard(input: CardInput) {
  // The back is what a message shows, because it is the face the guest taps open. The front is
  // the other side of the same envelope and is what the invite page opens. The two older
  // drawings, the cream letter and the half-open one, stay reachable with ?style= for comparing.
  const variant: CardVariant = input.variant ?? "back";
  if (variant === "front") return front(input);
  if (variant === "opening") return opening(input);
  if (variant === "posted") return posted(input);
  return back(input);
}

export const CARD_SIZE = { width: W, height: H };
