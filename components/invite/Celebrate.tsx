"use client";

// The moment somebody says yes.
//
// Bunting rather than confetti, because the product is called Bunting and the flags are already
// its own shape. There was a "Yay!" over the top of it for a while and it is gone: on the card it
// landed across the heading and read "See Yay!here!", and above the card it fell off the top of
// the screen. The card already shouts, in the same red display face, and the heading does the
// cheering now. The flags fly up from behind the card, turn over, and fall the whole height of
// the screen before they go off the bottom of it. It is a reward, not a screen: it never takes a
// tap and it plays once per yes.
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
// escaped the card to reach the bottom of the screen.
const FLAGS = 22;

export function Celebrate() {
  return (
    <div className="cheer" aria-hidden="true">
      {Array.from({ length: FLAGS }, (_, i) => (
        <span
          key={i}
          className={`flag c${i % 5}`}
          // Spread across the screen, each one thrown and dropped a little differently, so it
          // reads as a handful let go rather than a row of clones falling in step. The fall is
          // in vh so it clears the bottom of any phone.
          style={{
            left: `${4 + (i * 92) / FLAGS + (i % 4) * 2}%`,
            "--lift": `${90 + (i % 5) * 34}px`,
            "--drift": `${(i % 2 ? 1 : -1) * (20 + (i % 6) * 14)}px`,
            "--spin": `${(i % 2 ? 1 : -1) * (200 + (i % 4) * 160)}deg`,
            "--wait": `${(i % 7) * 70}ms`,
            "--fall": `${86 + (i % 5) * 9}vh`,
            "--size": `${12 + (i % 4) * 3}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
