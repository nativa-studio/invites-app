"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { firstName } from "@/lib/format";
import type { HostPlateItem } from "@/lib/db/plate";
import { addPlateItem, assignPlateItem, removePlateItem, renamePlateItem } from "@/app/app/events/[id]/actions";
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
export function PlateBoard({ eventId, items, enabled, mode, hostNote, allergies, guests }: {
  eventId: string;
  items: HostPlateItem[];
  /** Everyone who said yes, for putting a dish against a name. */
  guests: { id: string; name: string }[];
  enabled: boolean;
  mode: string;
  hostNote: string | null;
  /** The same counts the guests' board shows, so a host can see what they are seeing. */
  allergies: [string, number][];
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  // The item being renamed, and what it is being renamed to.
  const [editing, setEditing] = useState<HostPlateItem | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const needed = items.filter((i) => !i.bringing);
  const claimed = items.filter((i) => i.bringing);
  const unclaimed = needed.length;

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
        <h2 className="h2">{copy.host.potluckList}</h2>
        <button type="button" className="btn small" onClick={() => setOpen(true)}>{copy.host.plateAsk}</button>
      </div>
      <p className="hint">{copy.host.plateBlurb(mode, items.length, unclaimed)}</p>
      {hostNote && <p className="hint">{copy.host.plateNote(hostNote)}</p>}
      {allergies.length > 0 && (
        <p className="notice">{copy.plate.allergies(allergies.map(([chip, n]) => copy.plate.allergy(n, chip)).join(", "))}</p>
      )}

      {items.length === 0 && <p className="hint">{copy.host.plateEmpty}</p>}

      {/* Two groups, and the dishes run on rather than stacking.
          Every item used to be its own row three lines deep: the dish, who was bringing it, and
          two buttons. Twenty dishes was a page of scrolling to answer one question, which is what
          is still missing. Who is bringing what is gone from the board entirely: a host reads it
          once, when something goes wrong, and it is in the sheet behind each dish.
          The dish name was already the way to rename it, so it stays a button and the two actions
          that used to sit beside it moved in behind it. */}
      {items.length > 0 && (
        <>
          <div className="dishrun">
            <span className="ql">{copy.host.plateNeeded}</span>
            {needed.length === 0 ? (
              <p className="hint">{copy.host.plateAllClaimed}</p>
            ) : (
              <p className="run">
                {needed.map((i, n) => (
                  <span key={i.id}>
                    {n > 0 && " \u00b7 "}
                    <button type="button" className="as-link" onClick={() => { setEditing(i); setNewLabel(i.label); }}>{i.label}</button>
                  </span>
                ))}
              </p>
            )}
          </div>

          <div className="dishrun">
            <span className="ql">{copy.host.plateClaimed}</span>
            {claimed.length === 0 ? (
              <p className="hint">{copy.host.plateNoneClaimed}</p>
            ) : (
              <p className="run">
                {claimed.map((i, n) => (
                  <span key={i.id}>
                    {n > 0 && " \u00b7 "}
                    {/* The dish and whoever has it wrap as one. Loose, "Cheese and crackers"
                        ended a line and "(Ali)" started the next, which reads as a dish called
                        Ali. See .pair. */}
                    <span className="pair">
                      <button type="button" className="as-link" onClick={() => { setEditing(i); setNewLabel(i.label); }}>{i.label}</button>
                      {/* First names here, whole name in the sheet behind the dish. Whole names
                          put every dish on a line of its own, which is the list this was meant to
                          replace; the one time a host needs to know which Sam, they are one tap
                          from it. Bracketed rather than run on, so a dish whose own name has a
                          comma in it cannot be mistaken for the person carrying it. */}
                      {i.bringing && <span className="by"> ({firstName(i.bringing)})</span>}
                    </span>
                  </span>
                ))}
              </p>
            )}
          </div>
          <p className="hint">{copy.host.plateTapHint}</p>
        </>
      )}

      {editing && (
        <Sheet
          title={copy.host.plateRename}
          blurb={copy.host.plateRenameBlurb}
          dirty={newLabel.trim() !== editing.label}
          onClose={() => setEditing(null)}
        >
          <div className="sheet-body">
            {editing.tags.length > 0 && <p className="hint">{editing.tags.join(", ")}</p>}
            {/* Who has it, and the way to change it. A host can put a dish against a name because
                half a potluck is answered in the group chat rather than on anybody's invite, and
                the alternative was asking that person to go and tap it themselves. */}
            <div className="field">
              <label htmlFor="plate_who">{copy.host.plateWho}</label>
              <select
                id="plate_who"
                value={editing.claimedBy ?? ""}
                disabled={pending}
                onChange={(ev) => {
                  const who = ev.target.value || null;
                  const id = editing.id;
                  setEditing({ ...editing, claimedBy: who, bringing: guests.find((g) => g.id === who)?.name ?? null });
                  start(async () => { await assignPlateItem(eventId, id, who); });
                }}
              >
                <option value="">{copy.host.plateWhoNobody}</option>
                {guests.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <span className="hint">{copy.host.plateWhoHint}</span>
            </div>
            <div className="field">
              <label htmlFor="plate_rename">{copy.plate.addLabel}</label>
              <input id="plate_rename" type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} autoComplete="off" />
            </div>
            <div className="actions">
              <button
                type="button"
                className="btn primary"
                disabled={pending || !newLabel.trim()}
                onClick={() => { const id = editing.id; start(async () => { await renamePlateItem(eventId, id, newLabel); setEditing(null); }); }}
              >
                {copy.host.plateRenameSave}
              </button>
              <button type="button" className="btn small" disabled={pending}
                onClick={() => { const id = editing.id; start(async () => { await removePlateItem(eventId, id); setEditing(null); }); }}>
                {copy.host.plateRemove}
              </button>
            </div>
          </div>
        </Sheet>
      )}

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
