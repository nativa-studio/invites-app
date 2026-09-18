"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The parts of an event. The first is the event's own address, so it is the one you land on and
// the one Back from anywhere else returns to.
//
// "Invite" rather than "Preview": it is where the invite is made, not just where it is looked at.
//
// The order follows the job: how it is going, then the four things you set up, then the invite
// itself. RSVP sits next to Guests because they are the two halves of the same question, who is
// asked and what they said.
const TABS = [
  { seg: "", label: "Tracking" },
  { seg: "/look", label: "Layout" },
  { seg: "/details", label: "Details" },
  { seg: "/guests", label: "Guests" },
  { seg: "/rsvp", label: "RSVP" },
  { seg: "/invite", label: "Invite" },
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
