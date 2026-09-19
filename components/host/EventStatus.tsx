"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { setEventStatus, setGroupLink } from "@/app/app/events/[id]/actions";
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
export function EventStatus({ id, title, status, counts, groupLinkOpen }: {
  id: string;
  title: string;
  status: string;
  counts: { guests: number; replies: number };
  /** Whether the link anyone can reply through is working. Same kind of fact as the status: it is
   *  about the event rather than about any one guest, and it had a card on Guests repeating the
   *  link the Groups card already carries. */
  groupLinkOpen: boolean;
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
            <div className="field">
              <label className="switch" htmlFor="group_link_open">
                <input
                  id="group_link_open"
                  type="checkbox"
                  checked={groupLinkOpen}
                  disabled={pending}
                  onChange={(ev) => { const on = ev.target.checked; start(() => { void setGroupLink(id, on); }); }}
                />
                <span>{copy.host.groupLinkSwitch}</span>
              </label>
              <span className="hint">{copy.host.groupLinkBlurb}</span>
            </div>
            <DeleteEvent id={id} title={title} counts={counts} />
          </div>
        </Sheet>
      )}
    </>
  );
}
