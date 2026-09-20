"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The parts of an event. The first is the event's own address, so it is the one you land on and
// the one Back from anywhere else returns to.
//
// "Invite" rather than "Preview": it is where the invite is made, not just where it is looked at.
// It is first, and it is the address, because it is the thing a host opens their event to work
// on. Tracking used to hold that spot on the argument that you check an event more often than you
// change it, which turned out to be true only in the week before the party and false in all the
// weeks of making it.
//
// Five, because there were six and three of them were the same two questions asked in different
// rooms. Tracking counted the replies and RSVP counted them again; Details held wording that the
// invite itself now opens when you tap it; RSVP held the questions a guest is asked, which are
// part of the invite and now sit in it.
//
// So: the invite, the people it goes to, the message that reaches them, the food they are
// bringing, and what it all looks like. Message earns its own place rather than folding into
// Guests, because it is the one part of the product whose result a host cannot see anywhere else:
// the card a chat app draws is built from the event and does not exist until a message has been
// sent. Potluck earns one because it is the only thing here that guests write to.
const TABS = [
  { seg: "", label: "Invite" },
  { seg: "/guests", label: "Guests" },
  // Tracking is back, next to Guests, and it is not what it was. The old one counted the replies,
  // which Guests already did, and that is why it went. This one answers the questions the guest
  // list cannot without scrolling it: how many people, what has to be cooked around, and what has
  // happened since you last looked.
  { seg: "/tracking", label: "Tracking" },
  { seg: "/message", label: "Message" },
  { seg: "/potluck", label: "Potluck" },
  { seg: "/gift", label: "Gift" },
  { seg: "/look", label: "Design" },
] as const;

export function EventNav({ id }: { id: string }) {
  const path = usePathname();
  const base = `/app/events/${id}`;
  const bar = useRef<HTMLElement>(null);

  // Six no longer fit across a phone, which is what this is for: tapping Design used to leave it
  // off the right edge with no sign it was the one you were on.
  useEffect(() => {
    const on = bar.current?.querySelector<HTMLElement>("a.on");
    on?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [path]);

  // The fade at the right edge means "there is more this way", so it is only there when there is.
  // On a laptop, where all six fit, a permanently dimmed last tab would just look broken.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const mark = () => {
      const more = el.scrollWidth - el.clientWidth - el.scrollLeft > 1;
      el.classList.toggle("more", more);
    };
    mark();
    el.addEventListener("scroll", mark, { passive: true });
    const watch = new ResizeObserver(mark);
    watch.observe(el);
    return () => { el.removeEventListener("scroll", mark); watch.disconnect(); };
  }, [path]);

  return (
    <nav className="evt-nav" aria-label="This event" ref={bar}>
      {TABS.map((t) => {
        const href = `${base}${t.seg}`;
        const on = t.seg === "" ? path === base : path.startsWith(href);
        return (
          <Link key={t.seg} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
