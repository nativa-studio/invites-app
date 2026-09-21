"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The parts of an event, in the order a host works.
//
// Five, and they were eight. The eight were not eight jobs: Look picked the template, the editor
// changed the words on it and Message wrote the text that delivers it, which is one job called
// the invite. Tracking counted the replies and listed what has to be cooked around, which is
// part of knowing who is coming. Shopping, Potluck and Gift are three lists of what still has to
// happen before the day.
//
// Overview is first and it is the event's own address, so it is what you land on and what Back
// returns to. The index used to be the invite editor, which answers "what does this look like":
// the right question in the week an invite is made and the wrong one in every week after it goes
// out, when the question is how many are coming and who has not answered.
//
// One badge: the replies still out, on Guests. Nothing else gets one, because a badge on
// everything is a badge on nothing, and it goes when the number reaches zero rather than sitting
// there as a 0, which reads as a warning about nothing.
const TABS = [
  { seg: "", label: "Overview" },
  { seg: "/invite", label: "Invite" },
  { seg: "/guests", label: "Guests" },
  { seg: "/plan", label: "Plan" },
  { seg: "/settings", label: "Settings" },
] as const;

export function EventNav({ id, waiting }: { id: string; waiting: number }) {
  const path = usePathname();
  const base = `/app/events/${id}`;
  const bar = useRef<HTMLElement>(null);

  // Five fit on a phone at normal text size and do not at 200%, which is what this is for: a tab
  // off the right edge with no sign it is the one you are on is how the eighth one behaved.
  useEffect(() => {
    const on = bar.current?.querySelector<HTMLElement>("a.on");
    on?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [path]);

  // The fade at the right edge means "there is more this way", so it is only there when there is.
  // Where all five fit, a permanently dimmed last tab would just look broken.
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
        const badge = t.seg === "/guests" && waiting > 0 ? waiting : 0;
        return (
          <Link key={t.seg} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            {t.label}
            {badge > 0 && <span className="nav-badge" aria-label={`${badge} still to reply`}>{badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
