"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { EditSheet } from "./EditCard";

// One setting, as a block you can read across the room.
//
// Settings was a single card holding four rows and one Change button, which is a form wearing a
// summary: a host who came to switch the group link off read three settings they did not want in
// order to reach it. Marcia, with a picture of the party-type tiles: "add blocks like this in
// settings for each item so it's a bit more fun to look at, add a little symbol for each item,
// allow toggle on or off, and add a pen on the top right to click and edit that setting via the
// drawer window, the same that already exists being used in the invite."
//
// So: a picture, a name, the word it is set to, the switch itself, and a pencil. The switch does
// the thing most visits come for and does it in one tap, where it is. The pencil opens the same
// sheet the invite's own pencils open, carrying the same field manifest, so everything else about
// the setting is one tap further in and nothing can write over a field it does not show.
export function SettingBox({
  eventId, icon, title, value, on, blurb, fields, onToggle, children,
}: {
  eventId: string;
  icon: React.ReactNode;
  title: string;
  /** What it is set to now, in the host's words rather than true and false. */
  value: string;
  on: boolean;
  blurb?: string;
  fields: readonly string[];
  /** Flicking it here. Left out for a setting with nothing to flick, which draws the pencil only. */
  onToggle?: (next: boolean) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <div className={`sbox${on ? " on" : ""}`}>
        <span className="sbox-art" aria-hidden="true">{icon}</span>
        <span className="sbox-name">{title}</span>
        <span className="sbox-foot">
          <span className="sbox-val">{value}</span>
        {/* Top right, where the invite keeps its pencils, so the gesture is already learned. */}
        <button type="button" className="sbox-pen" onClick={() => setOpen(true)} aria-label={copy.host.editThing(title)}>
          <Pen />
        </button>
        {onToggle && (
          <button
            type="button"
            className="sw"
            role="switch"
            aria-checked={on}
            aria-label={copy.host.switchThing(title)}
            disabled={pending}
            onClick={() => start(() => onToggle(!on))}
          >
            <span className="track"><span className="knob" /></span>
          </button>
        )}
        </span>
      </div>
      {open && (
        <EditSheet key={String(open)} eventId={eventId} title={title} blurb={blurb} fields={fields} onClose={() => setOpen(false)}>
          {children}
        </EditSheet>
      )}
    </>
  );
}

/** The same pencil the invite draws on each part. */
function Pen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}
