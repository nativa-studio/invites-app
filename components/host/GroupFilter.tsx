"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { copy } from "@/lib/copy";
import type { GuestRow } from "@/lib/db/types";
import { UNGROUPED } from "@/lib/groups";

// Which group you are looking at, at the top of Guests, above everything it changes.
//
// A host with fifty households does not work through them as one list. They work through the
// neighbours on Tuesday and the school lot on Wednesday, and the question they arrive with is
// "how are the neighbours going", not "how is everybody going". So the choice sits before the
// numbers rather than inside the list, and the numbers, the food line and the list all answer for
// the group that is picked.
//
// Links rather than buttons, with the group in the address, so it survives a reload, a tap on
// Back from a guest's sheet, and being sent to a co-host. Nothing to hold in state and nothing to
// lose when the page refreshes itself after a save.
export function GroupFilter({ guests, chosen, base }: { guests: GuestRow[]; chosen: string; base: string }) {
  const bar = useRef<HTMLElement>(null);
  // Tapping a chip is a navigation, and the new page starts the row scrolled back to the left. A
  // host with eight groups picked the seventh and then could not see which one was on. Client
  // side only for this: nothing else here needs the browser.
  useEffect(() => {
    bar.current?.querySelector<HTMLElement>("a.on")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [chosen]);

  const names = [...new Set(guests.flatMap((g) => g.groups ?? []))].sort((a, b) => a.localeCompare(b));
  const ungrouped = guests.some((g) => !g.groups?.length);
  // One group and nothing else is not a choice, it is a label. Nothing to filter by until a host
  // has actually sorted people.
  if (names.length === 0) return null;

  const count = (name: string) =>
    name === "" ? guests.length
      : name === UNGROUPED ? guests.filter((g) => !g.groups?.length).length
      : guests.filter((g) => g.groups?.includes(name)).length;

  const chip = (value: string, label: string) => (
    <Link
      key={value || "all"}
      href={value ? `${base}?group=${encodeURIComponent(value)}` : base}
      className={`gchip ${chosen === value ? "on" : ""}`}
      aria-current={chosen === value ? "true" : undefined}
      scroll={false}
    >
      {label} <span className="n">{count(value)}</span>
    </Link>
  );

  const label = chosen === UNGROUPED ? copy.host.filterNoGroup : chosen;

  return (
    <>
      <nav className="gfilter" aria-label={copy.host.filterHeading} ref={bar}>
        {chip("", copy.host.filterEveryone)}
        {names.map((n) => chip(n, n))}
        {ungrouped && chip(UNGROUPED, copy.host.filterNoGroup)}
      </nav>
      {/* Said in words as well as shown, because the list is a long way below the chips and a
          guest who is simply filtered out looks exactly like a guest who has gone missing. */}
      {chosen && <p className="hint">{copy.host.filterShowing(label)}</p>}
    </>
  );
}
