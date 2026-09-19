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
// Guests comes next, then RSVP beside it: the two halves of one question, who is asked and what
// they said. Then the two set-up screens.
const TABS = [
  { seg: "", label: "Invite" },
  { seg: "/guests", label: "Guests" },
  { seg: "/rsvp", label: "RSVP" },
  { seg: "/tracking", label: "Tracking" },
  { seg: "/look", label: "Design" },
  { seg: "/details", label: "Details" },
] as const;

export function EventNav({ id }: { id: string }) {
  const path = usePathname();
  const base = `/app/events/${id}`;
  const bar = useRef<HTMLElement>(null);

  // Six of these do not fit across a phone, so the bar scrolls. Landing on one of the last tabs
  // with it scrolled to the start would put the tab you are on off the side of the screen, which
  // reads as the tab having no highlight at all.
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
