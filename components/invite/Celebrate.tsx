"use client";

// The moment somebody says yes.
//
// Bunting rather than confetti, because the product is called Bunting and the flags are already
// its own shape. There was a "Yay!" over the top of it for a while and it is gone: on the card it
// landed across the heading and read "See Yay!here!", and above the card it fell off the top of
// the screen. The card already shouts, in the same red display face, and the heading does the
// cheering now.
//
// It is two waves, because one was never going to fill the screen. A single handful dropped from
// the middle leaves the bottom third empty while it falls and the top third empty once it has.
// So: a burst fired up from below the bottom edge, which crosses the whole screen on the way up
// and fills it from the bottom, and a fall from above the top edge that keeps arriving behind it
// for another second and a half. Between them there is bunting everywhere, top to bottom, for the
// whole of it.
//
// The whole thing is CSS, and the animation ends where it should rather than being unmounted on a
// timer, so there is no state and no JavaScript here at all. The buzz used to live in this file
// and has moved to the tap, in lib/haptic.ts, where a browser is far more willing to give one.
//
// Off entirely for anyone who has asked their phone to stop moving things, which covers motion
// sickness and vestibular conditions.
//
// It renders beside the card rather than inside it. The card is tilted, and a transformed element
// is a containing block for anything fixed inside it, so in there the flags could never have
// escaped the card to reach either edge of the screen.
const POP = 44;
const RAIN = 46;

// A scatter that is different for every flag and the same on every render.
//
// Math.random would draw one set on the server and a different set in the browser, and React
// throws away the whole tree when the two disagree. This is the usual sine hash: no state, no
// effect, no mismatch, and spread enough that nothing lines up into rows.
function rnd(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const vars = (i: number, wave: "pop" | "rain"): React.CSSProperties => {
  const spin = (rnd(i, 4) > 0.5 ? 1 : -1) * (420 + rnd(i, 5) * 760);
  return {
    left: `${rnd(i, 1) * 104 - 2}%`,
    "--x": `${(rnd(i, 2) - 0.5) * (wave === "pop" ? 110 : 44)}vw`,
    // How high a pop flag is thrown, from barely over the bottom edge to clean off the top. The
    // narrow range this started with threw them all to the top of the screen at the same moment
    // and left the bottom forty per cent empty for a second: measured, 0 flags in bands 6 to 9 at
    // 800ms. Short throws are what keeps the bottom of the screen busy while the fall arrives.
    "--up": `${16 + rnd(i, 3) * 112}vh`,
    "--spin": `${spin}deg`,
    "--dur": `${(wave === "pop" ? 2.3 : 2.5) + rnd(i, 6) * 1.6}s`,
    // Squared, so the waits bunch up near zero with a thinning tail rather than spreading evenly.
    // An even spread made the first half second look like a drizzle: measured, 20 flags on screen
    // at 400ms against 62 at the peak. Most of the burst should already be in the air by then,
    // and the stragglers are what keeps it going afterwards. The fall keeps arriving for most of
    // two seconds, so the top does not empty out behind the burst.
    "--wait": `${(wave === "pop" ? rnd(i, 7) ** 2 * 780 : rnd(i, 7) ** 1.5 * 1900)}ms`,
    "--size": `${9 + rnd(i, 8) * 12}px`,
  } as React.CSSProperties;
};

export function Celebrate() {
  return (
    <div className="cheer" aria-hidden="true">
      {/* Fired up from under the bottom edge. This is the one that fills the screen. */}
      {Array.from({ length: POP }, (_, i) => (
        <span key={`p${i}`} className={`flag pop c${i % 5}${rnd(i, 9) > 0.66 ? " strip" : ""}`} style={vars(i, "pop")} />
      ))}
      {/* Falling in from above it, still arriving while the burst is on its way down. */}
      {Array.from({ length: RAIN }, (_, i) => (
        <span key={`r${i}`} className={`flag rain c${(i + 2) % 5}${rnd(i, 11) > 0.7 ? " strip" : ""}`} style={vars(i + 97, "rain")} />
      ))}
    </div>
  );
}
