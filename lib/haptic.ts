// A buzz on the yes tap.
//
// Two mechanisms, because the web has no single one. `navigator.vibrate` is Android's and has
// never existed in iOS Safari. What iOS does have, since 17.4, is a haptic when a switch styled
// checkbox is toggled, so this makes one, flicks it and throws it away. Whether that fires on a
// programmatic click rather than a finger is not something anybody can promise, and it cannot be
// tested anywhere except on an iPhone.
//
// Both are called from inside the tap, not from the card that appears afterwards: a browser gives
// a page far less on a timer than it does in the half second after a finger. That is also the
// better moment. The buzz belongs to pressing yes, not to the reply landing.
//
// Silent for anybody who has asked their phone to stop animating things. Somebody who does not
// want the screen to move does not want it to shake either.
export function buzz(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Short, gap, shorter: the shape of a nod rather than an alarm.
  try { navigator.vibrate?.([14, 45, 20]); } catch { /* not ours to care about */ }

  try {
    const flick = document.createElement("input");
    flick.type = "checkbox";
    flick.setAttribute("switch", "");
    flick.setAttribute("aria-hidden", "true");
    flick.tabIndex = -1;
    flick.style.cssText = "position:fixed;top:0;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(flick);
    flick.click();
    setTimeout(() => flick.remove(), 0);
  } catch { /* nothing to fall back to, and nothing worth breaking a reply over */ }
}
