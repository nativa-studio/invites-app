import type { Palette } from "@/lib/db/types";
import { inkFor, paperFor, stripSet } from "@/lib/strip-set";
import { monoShapes } from "@/components/art/mono";
import { copy } from "@/lib/copy";
import type { Stock as StockId } from "@/lib/layouts";

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

export type StockName = StockId;

// Satori has no color-mix, so the blend the stylesheet does in CSS is done here in numbers. Same
// two colours in, same paper out, which is the point: the envelope in the chat and the envelope
// on the page have to be the same envelope.
function mix(a: string, b: string, t: number): string {
  const hex = (h: string) => parseInt(h.replace("#", ""), 16);
  const [x, y] = [hex(a), hex(b)];
  const ch = (sh: number) => Math.round((((x >> sh) & 255) * (1 - t)) + (((y >> sh) & 255) * t));
  return `#${[16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, "0")).join("")}`;
}

// The envelope's own colours, kept apart from the event's palette because they are the stationery
// rather than the artwork. The suite is a red envelope on white. The lineup is a cream page, and a
// red envelope on it fought the page, so its envelope is cut from a warmer, deeper shade of the
// same paper: it reads as an envelope lying on a sheet rather than as a colour dropped on top.
//
// Beige paper takes dark writing, red paper takes pale, so the ink travels with the stock.
type Stock = { ground: string; body: string; flap: string; rim: string; ink: string; label: string; mark: string };

function stockFor(p: Palette, name: StockName | undefined, ink?: string | null): Stock {
  // One ink on a tint of itself. Every colour on the envelope is mixed from the two the invite
  // is printed in, so a host who picks marigold gets a marigold envelope without being asked a
  // second question about stationery.
  if (name === "ink") {
    const i = inkFor(ink), paper = paperFor(ink);
    return {
      ground: paper,
      body: mix(paper, i, 0.24),
      flap: mix(paper, i, 0.15),
      rim: mix(paper, i, 0.34),
      ink: i,
      label: mix(paper, i, 0.55),
      mark: mix(paper, i, 0.4),
    };
  }
  if (name === "beige") {
    return { ground: "#FDF6E4", body: "#E9DCC1", flap: "#F4EAD6", rim: "#CDBB98", ink: "#2B2119", label: "#8B7A61", mark: "#B6A17B" };
  }
  return { ground: "#FFFFFF", body: shade(p.red, -0.18), flap: p.red, rim: shade(p.red, -0.32), ink: PAPER, label: p.cream, mark: shade(p.red, -0.38) };
}

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
  /** The paper the envelope is cut from. The suite's is red, the lineup's beige, and the strip's
   *  is mixed from `ink` below. */
  stock?: StockName;
  /** Which ink, for the stock that is mixed rather than picked. */
  ink?: string | null;
  /** Which set of doodles, for the design that stands those in the corner instead of a cast. */
  set?: string | null;
  /** Falls back to the set the theme implies, the same as the invite does. */
  themeId?: string | null;
  /** The square photograph of one character, for the designs that clip a polaroid to the card.
   *  Absolute, like `artwork`, because Satori fetches it. */
  portrait?: string | null;
  variant?: CardVariant;
};

const W = 1200;
const H = 630;
const PAPER = "#FDF6E4";
const DISPLAY = "Lilita One";
const HAND = "Patrick Hand SC";
// The Monsters cards' words, read once so the card is one expression rather than six lookups.
const { to: copyTo, floor: copyFloor, wasName: copyWas, wasFloor: copyWasFloor, wasName2: copyWas2, wasFloor2: copyWasFloor2 } = copy.monsters;
const copyScarer = copy.sections.scarerWanted;

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
function back({ palette: p, addressee, title, artwork, stock, ink, set, themeId }: CardInput) {
  const st = stockFor(p, stock, ink);
  const PAD = 26;
  const EW = W - PAD * 2, EH = H - PAD * 2;
  const APEX = 300;
  return (
    <div style={{ width: W, height: H, display: "flex", background: st.ground, padding: PAD, fontFamily: "Nunito" }}>
      <div style={{ position: "relative", width: EW, height: EH, display: "flex", background: st.body, borderRadius: 22 }}>
        {/* The flap, folded down, lighter than the body it lies on, exactly as in the app. */}
        <svg width={EW} height={APEX + 14} viewBox={`0 0 ${EW} ${APEX + 14}`} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={`M0 0 L${EW / 2} ${APEX} L${EW} 0 Z`} fill={st.flap} />
          <path d={`M0 0 L${EW / 2} ${APEX} L${EW} 0`} fill="none" stroke={st.rim} strokeWidth="5" strokeLinejoin="round" />
        </svg>
        {/* The wax seal, at the point of the flap, holding it shut. */}
        {/* The wax. On a one-ink card it is the paper with an ink rim, the same as the page's,
            rather than a yellow disc a strip event has no yellow for. */}
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", left: EW / 2 - 60, top: APEX - 60 }}>
          <circle cx="60" cy="60" r="52" fill={stock === "ink" ? st.ground : p.yellow} stroke={stock === "ink" ? st.ink : p.navy} strokeWidth="7" />
          <path d="M66 24L34 66h24l-10 30 42-46H66l13-26z" fill={stock === "ink" ? st.ink : p.navy} />
        </svg>
        {nameBlock(st, addressee, title, false)}
        {stock === "ink" ? trio(st, set, themeId) : characters(artwork)}
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

function nameBlock(st: Stock, addressee: string | null | undefined, title: string, fallback: boolean) {
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
      <div style={{ display: "flex", fontFamily: HAND, fontSize: 30, letterSpacing: 9, color: st.label }}>
        {addressee ? "INVITE FOR" : "YOU'RE INVITED"}
      </div>
      {big ? (
        <div style={{ display: "flex", fontSize: size, letterSpacing: track, color: st.ink, lineHeight: 1.1, marginTop: 10 }}>{name}</div>
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

// And for the design that has no cast: its own three doodles, in the same corner, at the size the
// characters stand there. Without them the envelope was a name in the bottom left and six hundred
// empty pixels, which reads as a card that failed to load rather than as a plain envelope.
//
// Drawn as raw SVG with an explicit stroke: Satori renders SVG faithfully but this is not a
// browser, and currentColor has nothing to inherit from out here.
function trio(st: Stock, set: string | null | undefined, themeId: string | null | undefined) {
  const names = stripSet(set, themeId).trio;
  return (
    <div style={{ position: "absolute", right: 56, bottom: 54, display: "flex", alignItems: "flex-end", gap: 22 }}>
      {names.map((n, i) => (
        <svg key={i} width="104" height="104" viewBox="0 0 64 64" fill="none" stroke={st.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {monoShapes(n)}
        </svg>
      ))}
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
function front({ palette: p, addressee, title, age, artwork, stock, ink, set, themeId }: CardInput) {
  const st = stockFor(p, stock, ink);
  const PAD = 26;
  const EW = W - PAD * 2, EH = H - PAD * 2;
  return (
    <div style={{ width: W, height: H, display: "flex", background: st.ground, padding: PAD, fontFamily: "Nunito" }}>
      <div style={{ position: "relative", width: EW, height: EH, display: "flex", background: st.body, borderRadius: 22 }}>
        {/* The seam along the top, where the flap folds over from behind. The only sign from this
            side that there is a flap at all. */}
        <svg width={EW} height="10" viewBox={`0 0 ${EW} 10`} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={`M22 6 L${EW - 22} 6`} stroke={st.rim} strokeWidth="4" strokeLinecap="round" />
        </svg>
        {/* The stamp, with the age where a denomination goes. On a one-ink card every part of it
            is the ink or the paper, the same rule the page itself follows: a stamp with a blue
            panel and a yellow emblem on it is four colours on an envelope that has two. */}
        {(() => {
          const one = stock === "ink";
          const panel = one ? st.ground : p.sky;
          const line = one ? st.ink : p.navy;
          const mark = one ? st.ground : p.yellow;
          const digits = one ? st.ink : "#FFFFFF";
          return (
            <div style={{ position: "absolute", right: 44, top: 34, width: 132, height: 156, display: "flex", padding: 9, background: one ? st.flap : "#FFFFFF", borderRadius: 3, transform: "rotate(2deg)" }}>
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, background: panel, border: `3px solid ${line}` }}>
                <svg width="40" height="46" viewBox="0 0 26 30">
                  <path d="M14 1L2 17h9l-4 12 17-18h-9l5-10z" fill={mark} stroke={line} strokeWidth="2.4" strokeLinejoin="round" />
                </svg>
                {age ? <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: 44, color: digits, lineHeight: 1 }}>{age}</div> : null}
              </div>
            </div>
          );
        })()}
        {/* The postmark, struck across the stamp the way a real one cancels it. Drawn after the
            stamp so it prints over it: it sat clear of the stamp before, which read as two marks
            side by side rather than one franking the other. The waves run 24 px onto the stamp's
            left edge, which is enough to be over it and not enough to hide the age. */}
        <svg width="300" height="150" viewBox="0 0 300 150" style={{ position: "absolute", right: 110, top: 44 }}>
          <g fill="none" stroke={st.mark} strokeWidth="4" strokeLinecap="round">
            <circle cx="70" cy="72" r="56" />
            <circle cx="70" cy="72" r="42" />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M138 ${46 + i * 18} q30 -11 60 0 t60 0`} />
            ))}
          </g>
        </svg>
        {nameBlock(st, addressee, title, true)}
        {stock === "ink" ? trio(st, set, themeId) : characters(artwork)}
      </div>
    </div>
  );
}

export function envelopeCard(input: CardInput) {
  // The front is what a message shows: a letter coming towards you, addressed, stamped, franked.
  // The back is what the invite page itself opens, flap and seal, so between the chat and the
  // page a guest sees the envelope turned over and then opened. The two older drawings, the
  // cream letter and the half-open one, stay reachable with ?style= for comparing.
  // The two Monsters designs do not draw an envelope at all, so they answer before the variants:
  // there is no back and no half-open for a card that is a spotted panel or an internal memo.
  if (input.stock === "fur") return furCard(input);
  if (input.stock === "manila") return manilaCard(input);
  const variant: CardVariant = input.variant ?? "front";
  if (variant === "front") return front(input);
  if (variant === "opening") return opening(input);
  if (variant === "posted") return posted(input);
  return back(input);
}


// ---------------------------------------------------------------------------------------------
// The two Monsters cards. Every value is lifted from
// design_handoff_monster_layouts/reference/*-share-card.html.
//
// Satori draws these, so three of its limits shape the markup: no clip-path, no color-mix, and no
// CSS grid. Spots are an SVG pattern rather than repeated radial gradients, the routing grid is
// flex rows, and every colour is written out.
// ---------------------------------------------------------------------------------------------

const TITLE_FONT = "Luckiest Guy";

/** The spotted paper, as one SVG the panel sits under. Two sizes of spot on two grids, the same
 *  as the invite's, because a guest sees this in the chat a second before they see the page. */
function spots(w: number, h: number, ground: string, spot: string) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <pattern id="s1" width="92" height="92" patternUnits="userSpaceOnUse">
          <circle cx="27.6" cy="36.8" r="14" fill={spot} />
        </pattern>
        <pattern id="s2" width="68" height="68" patternUnits="userSpaceOnUse">
          <circle cx="47.6" cy="49" r="9" fill={spot} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={ground} />
      <rect width={w} height={h} fill="url(#s1)" />
      <rect width={w} height={h} fill="url(#s2)" />
    </svg>
  );
}

function furCard({ addressee, title, artwork, age }: CardInput) {
  const name = addressee?.trim() || title;
  return (
    <div style={{ width: W, height: H, display: "flex", position: "relative", background: "#F1DDBA", fontFamily: "Nunito", color: "#1F2530" }}>
      {/* The spotted panel, with the seam of the envelope's flap across its top. */}
      <div style={{ position: "absolute", left: 80, top: 55, width: 1040, height: 520, borderRadius: 20, overflow: "hidden", display: "flex", boxShadow: "0 30px 40px -24px rgba(31,37,48,0.5)" }}>
        {spots(1040, 520, "#35A9B8", "#6A3FA0")}
        <div style={{ position: "absolute", left: 0, top: 70, width: 1040, height: 4, background: "#237580" }} />
      </div>

      {/* The stamp: the eye, and the age under it. */}
      <div style={{ position: "absolute", right: 120, top: 85, width: 132, height: 156, background: "#fff", padding: 9, display: "flex", transform: "rotate(2deg)", boxShadow: "0 6px 10px -4px rgba(31,37,48,0.4)" }}>
        <div style={{ width: 114, height: 138, background: "#97C93D", border: "3px solid #1F2530", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ width: 50, height: 50, borderRadius: 25, background: "#fff", border: "3px solid #1F2530", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: "#3F9E5A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#1F2530" }} />
            </div>
          </div>
          {age && <div style={{ fontFamily: TITLE_FONT, fontSize: 44, lineHeight: 1 }}>{age}</div>}
        </div>
      </div>

      {/* The postmark, struck across the stamp: two rings and four waves. */}
      <div style={{ position: "absolute", right: 250, top: 96, display: "flex" }}>
        <div style={{ width: 150, height: 150, border: "4px solid rgba(31,37,48,0.38)", borderRadius: 75, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 110, height: 110, border: "3px solid rgba(31,37,48,0.38)", borderRadius: 55 }} />
        </div>
        <div style={{ position: "absolute", left: 120, top: 34, display: "flex", flexDirection: "column", gap: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <svg key={i} viewBox="0 0 200 16" width="200" height="16">
              <path d="M0 8 q 12.5 -8 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0" fill="none" stroke="rgba(31,37,48,.38)" strokeWidth="3" />
            </svg>
          ))}
        </div>
      </div>

      {/* Who it is for, on a label stuck to the panel. */}
      <div style={{ position: "absolute", left: 140, bottom: 110, display: "flex", background: "#FFF9EE", border: "4px solid #1F2530", borderRadius: 14, padding: "26px 48px 18px", transform: "rotate(-1.5deg)", boxShadow: "0 8px 0 #1F2530" }}>
        <div style={{ fontFamily: TITLE_FONT, fontSize: 120, lineHeight: 1 }}>{name}</div>
      </div>

      {/* The pair, as a sticker. */}
      {artwork && (
        <div style={{ position: "absolute", right: 150, bottom: 90, width: 300, height: 290, background: "#fff", borderRadius: 30, padding: 12, display: "flex", transform: "rotate(-4deg)", boxShadow: "0 16px 22px -12px rgba(31,37,48,0.5)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork} alt="" width={276} height={266} style={{ width: 276, height: 266, borderRadius: 20, objectFit: "cover", objectPosition: "50% 60%" }} />
        </div>
      )}
    </div>
  );
}

/** One row of the routing grid. Flex, not grid: Satori has no grid.
 *
 *  The heights carry their own rule with them. In the design the rows are content-box, so a 58px
 *  row with a 3px rule above it stands 61px tall, and five of them are fifteen pixels of memo. */
type Cell = { text: string; size: number; colour: string; struck?: boolean; head?: boolean };
function memoRow(a: Cell, b: Cell, h: number, top?: boolean) {
  const cell = (c: Cell, border: boolean) => (
    <div style={{
      display: "flex", width: 280, height: h, boxSizing: "border-box",
      padding: c.head ? "10px 18px" : c.size > 40 ? "4px 18px" : "8px 18px",
      borderRight: border ? "3px solid rgba(106,78,30,0.55)" : "0px solid rgba(0,0,0,0)",
      fontFamily: c.head ? "Nunito" : HAND, fontSize: c.size, fontWeight: c.head ? 700 : 400,
      letterSpacing: c.head ? "0.16em" : "normal", textTransform: c.head ? "uppercase" : "none",
      color: c.colour, textDecoration: c.struck ? "line-through" : "none",
    }}>{c.text}</div>
  );
  return (
    <div style={{
      display: "flex", width: 560, height: top ? h : h + 3,
      borderTop: top ? "0px solid rgba(0,0,0,0)" : "3px solid rgba(106,78,30,0.55)",
      background: top ? "rgba(106,78,30,0.14)" : "rgba(0,0,0,0)",
    }}>
      {cell(a, true)}{cell(b, false)}
    </div>
  );
}

const INK = "#1F2530";
const GONE = "rgba(31,37,48,0.55)";

function manilaCard({ addressee, title, portrait }: CardInput) {
  const name = addressee?.trim() || title;
  return (
    <div style={{ width: W, height: H, display: "flex", position: "relative", background: "#35A9B8", fontFamily: "Nunito", color: "#1F2530" }}>
      <div style={{ position: "absolute", left: 80, top: 45, width: 1040, height: 540, borderRadius: 12, background: "#E8D3A6", overflow: "hidden", display: "flex", boxShadow: "0 30px 40px -24px rgba(31,37,48,0.5)" }}>
        <div style={{ position: "absolute", left: 0, top: 54, width: 1040, height: 4, background: "#BFA06A" }} />
        {[160, 300, 440].map((t) => (
          <div key={t} style={{ position: "absolute", left: 70, top: t, width: 30, height: 30, borderRadius: 15, background: "#35A9B8" }} />
        ))}
        {/* The routing grid: a memo that has been round the building, with the last two holders
            crossed out and this guest written under them. */}
        <div style={{ position: "absolute", left: 140, top: 96, width: 560, display: "flex", flexDirection: "column", borderLeft: "0px solid rgba(0,0,0,0)", borderRight: "3px solid rgba(106,78,30,0.55)", borderBottom: "3px solid rgba(106,78,30,0.55)" }}>
          {memoRow({ text: copyTo, size: 20, colour: "#5E4418", head: true }, { text: copyFloor, size: 20, colour: "#5E4418", head: true }, 44, true)}
          {memoRow({ text: copyWas, size: 34, colour: GONE, struck: true }, { text: copyWasFloor, size: 34, colour: GONE, struck: true }, 58)}
          {memoRow({ text: copyWas2, size: 34, colour: GONE, struck: true }, { text: copyWasFloor2, size: 34, colour: GONE, struck: true }, 58)}
          {/* The guest, written in under the two that were crossed out, and what the job is. */}
          {memoRow({ text: name, size: 44, colour: "#4A2878" }, { text: partyOf(title), size: 34, colour: INK }, 58)}
          {memoRow({ text: "", size: 34, colour: INK }, { text: "", size: 34, colour: INK }, 58)}
          {memoRow({ text: "", size: 34, colour: INK }, { text: "", size: 34, colour: INK }, 58)}
        </div>
      </div>

      {/* Two rules rather than one double rule: Satori has no double border, and a stamp is two
          rings of ink whichever way it is drawn. 2px, a 1px gap and 2px again is the 5px the
          design asks for. */}
      <div style={{ position: "absolute", left: 740, top: 88, display: "flex", transform: "rotate(-8deg)", border: "2px solid #6A3FA0", borderRadius: 10, padding: 1 }}>
        <div style={{ display: "flex", border: "2px solid #6A3FA0", borderRadius: 7, padding: "6px 20px", color: "#6A3FA0", fontFamily: HAND, fontSize: 40, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {copyScarer}
        </div>
      </div>

      {portrait && (
        <div style={{ position: "absolute", right: 150, bottom: 60, display: "flex", transform: "rotate(5deg)" }}>
          <div style={{ width: 250, height: 282, background: "#fff", padding: "14px 14px 46px", display: "flex", boxShadow: "0 16px 24px -12px rgba(31,37,48,0.55)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt="" width={222} height={222} style={{ width: 222, height: 222, objectFit: "cover", objectPosition: "50% 94%" }} />
          </div>
          <div style={{ position: "absolute", left: 90, top: -34, width: 34, height: 92, border: "6px solid #8A929C", borderRadius: 17 }} />
          <div style={{ position: "absolute", left: 98, top: -20, width: 18, height: 66, border: "5px solid #8A929C", borderRadius: 9 }} />
        </div>
      )}
    </div>
  );
}

/** "Gabriel's party", from the event's own title. The grid's right-hand column is where the memo
 *  says what the job is, and on an invitation the job is the party. */
function partyOf(title: string): string {
  const who = title.match(/^(.+?) is turning/i)?.[1]?.trim();
  return who ? `${who}'s party` : title;
}

export const CARD_SIZE = { width: W, height: H };
