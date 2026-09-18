"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The five parts of an event. The first is the event's own address, so it is the one you land on
// and the one Back from anywhere else returns to.
const TABS = [
  { seg: "", label: "Tracking" },
  { seg: "/look", label: "Layout" },
  { seg: "/details", label: "Details" },
  { seg: "/guests", label: "Guests" },
  { seg: "/invite", label: "Preview" },
] as const;

export function EventNav({ id }: { id: string }) {
  const path = usePathname();
  const base = `/app/events/${id}`;
  return (
    <nav className="evt-nav" aria-label="This event">
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
