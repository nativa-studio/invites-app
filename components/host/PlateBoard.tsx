"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import type { HostPlateItem } from "@/lib/db/plate";
import { addPlateItem, releasePlateItem, removePlateItem } from "@/app/app/events/[id]/actions";
import { Sheet } from "./Sheet";

// The bring a plate board, from the host's side.
//
// It is on Guests rather than on a tab of its own, because it is a report on who is bringing
// what, which is the same question as who is coming, asked about the table instead of the door.
//
// A host adds an item to ask for it, so it goes on unclaimed and reads as a job on the list. A
// guest adds one they are already carrying. The two are told apart on the row, because "nobody
// yet" on something the host asked for is a thing to chase and "nobody yet" is impossible on
// something a guest added, since putting it up is how they say they are bringing it.
export function PlateBoard({ eventId, items, enabled, mode, hostNote, allergies }: {
  eventId: string;
  items: HostPlateItem[];
  enabled: boolean;
  mode: string;
  hostNote: string | null;
  /** The same counts the guests' board shows, so a host can see what they are seeing. */
  allergies: [string, number][];
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const unclaimed = items.filter((i) => !i.bringing).length;

  if (!enabled) return null;

  const toggle = (t: string) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);

  function add() {
    if (!label.trim()) return;
    start(async () => {
      await addPlateItem(eventId, label, tags);
      setLabel("");
      setTags([]);
      setOpen(false);
    });
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="h2">{copy.plate.heading}</h2>
        <button type="button" className="btn small" onClick={() => setOpen(true)}>{copy.host.plateAsk}</button>
      </div>
      <p className="hint">{copy.host.plateBlurb(mode, items.length, unclaimed)}</p>
      {hostNote && <p className="hint">{copy.host.plateNote(hostNote)}</p>}
      {allergies.length > 0 && (
        <p className="notice">{copy.plate.allergies(allergies.map(([chip, n]) => copy.plate.allergy(n, chip)).join(", "))}</p>
      )}

      {items.length === 0 && <p className="hint">{copy.host.plateEmpty}</p>}

      {items.map((i) => (
        <div className="grouprow" key={i.id}>
          <div className="n">{i.label}</div>
          <div className="b">
            {i.bringing ?? (i.fromGuest ? copy.host.plateNobody : copy.host.plateAsked)}
            {i.tags.length > 0 && ` · ${i.tags.join(", ")}`}
          </div>
          <div className="actions">
            {i.bringing && (
              <button type="button" className="btn small" disabled={pending} onClick={() => start(() => { void releasePlateItem(eventId, i.id); })}>
                {copy.host.plateRelease}
              </button>
            )}
            <button type="button" className="btn small" disabled={pending} onClick={() => start(() => { void removePlateItem(eventId, i.id); })}>
              {copy.host.plateRemove}
            </button>
          </div>
        </div>
      ))}

      {open && (
        <Sheet title={copy.host.plateAsk} blurb={copy.host.plateAskBlurb} dirty={Boolean(label.trim())} onClose={() => setOpen(false)}>
          <div className="sheet-body">
            <div className="field">
              <label htmlFor="plate_label">{copy.plate.addLabel}</label>
              <input id="plate_label" type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={copy.plate.addPlaceholder} autoComplete="off" />
            </div>
            <div className="field">
              <span className="label-ish">{copy.plate.addTags}</span>
              <div className="chips">
                {["nut free", "gluten free", "dairy free", "vegan"].map((t) => (
                  <label className="chip" key={t}>
                    <input type="checkbox" checked={tags.includes(t)} onChange={() => toggle(t)} />{t}
                  </label>
                ))}
              </div>
            </div>
            <div className="actions">
              <button type="button" className="btn primary" disabled={pending || !label.trim()} onClick={add}>{copy.host.plateAddIt}</button>
            </div>
          </div>
        </Sheet>
      )}
    </section>
  );
}
