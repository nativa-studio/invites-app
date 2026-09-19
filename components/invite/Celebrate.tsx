"use client";
import { useEffect } from "react";

// The moment somebody says yes.
//
// Bunting rather than confetti, because the product is called Bunting and the flags are already
// its own shape. There was a "Yay!" over the top of it for a while and it is gone: on the card it
// landed across the heading and read "See Yay!here!", and above the card it fell off the top of
// the screen. The card already shouts, in the same red display face, and the heading does the
// cheering now. They fly up from behind the card, turn over once and flutter down, and they are
// finished inside a second and a half. It is a reward, not a screen: it never takes a tap, it
// plays once per yes, and it ends invisible.
//
// The whole thing is CSS, and the animation ends where it should rather than being unmounted on a
// timer. So there is no state here at all, which is also why it does not fight the lint rule about
// setting state from an effect: the only thing JavaScript does is the buzz.
//
// Off entirely for anyone who has asked their phone to stop moving things, which covers motion
// sickness and vestibular conditions. That turns off the buzz too: somebody who does not want the
// screen to move does not want the phone to shake either.
const FLAGS = 14;

export function Celebrate() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A soft double tap, the shape of a nod rather than an alarm: a short buzz, a gap, a shorter
    // one. navigator.vibrate is Android's. iOS Safari has never carried it, so on an iPhone this
    // is silently nothing and the flags do the work on their own.
    navigator.vibrate?.([14, 45, 20]);
  }, []);

  return (
    <div className="cheer" aria-hidden="true">
      {Array.from({ length: FLAGS }, (_, i) => (
        <span
          key={i}
          className={`flag c${i % 5}`}
          // Spread across the card, each one thrown a little differently, so it reads as a handful
          // let go rather than a row of clones.
          style={{
            left: `${6 + (i * 88) / FLAGS + (i % 3) * 3}%`,
            "--lift": `${120 + (i % 4) * 26}px`,
            "--drift": `${(i % 2 ? 1 : -1) * (18 + (i % 5) * 9)}px`,
            "--spin": `${(i % 2 ? 1 : -1) * (180 + (i % 3) * 120)}deg`,
            "--wait": `${(i % 6) * 45}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
