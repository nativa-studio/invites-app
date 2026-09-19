"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { setEventStatus } from "@/app/app/events/[id]/actions";
import { DeleteEvent } from "./DeleteEvent";
import { Sheet } from "./Sheet";

// The badge in the header, and what is behind it.
//
// It said Draft or Live and did nothing, while the control that changed it sat at the bottom of
// the Invite screen under everything else, and deleting an event had nowhere at all since the
// settings tab went. Both belong to the event as a whole rather than to any one screen, which is
// what the header is, so both are here: the thing that tells you the state is the thing that
// changes it.
//
// Deleting is last, behind its own shut door, and still asks for the event's name.
export function EventStatus({ id, title, status, counts }: {
  id: string;
  title: string;
  status: string;
  counts: { guests: number; replies: number };
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const name = copy.host.statusNames[status] ?? status;

  return (
    <>
      <button type="button" className="tag as-button" onClick={() => setOpen(true)} aria-label={copy.host.statusOpen(name)}>
        {name}
      </button>
      {open && (
        <Sheet title={copy.host.statusHeading} blurb={copy.host.statusBlurb} onClose={() => setOpen(false)}>
          <div className="sheet-body">
            <div className="tiles">
              {Object.entries(copy.host.statusNames).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`tile ${status === value ? "on" : ""}`}
                  aria-pressed={status === value}
                  disabled={pending}
                  onClick={() => start(() => { void setEventStatus(id, value); })}
                >
                  <span className="tile-name">{label}</span>
                </button>
              ))}
            </div>
            <DeleteEvent id={id} title={title} counts={counts} />
          </div>
        </Sheet>
      )}
    </>
  );
}
