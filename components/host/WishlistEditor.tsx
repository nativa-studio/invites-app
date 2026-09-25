"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import type { HostWishlistItem } from "@/lib/db/wishlist";
import { Reorder } from "./Reorder";
import { Sheet } from "./Sheet";
import {
  addWishlistItem, editWishlistItem, removeWishlistItem, setWishClaimed, setWishlistOrder,
} from "@/app/app/events/[id]/actions";

// The wish list, as the host writes it.
//
// A list of rows with an add button, the same shape as the shopping list, because it is the same
// kind of thing: a list the host owns, in an order they choose, that nobody else writes to. The
// drag handle is there because the order is the host's point of view on it. First is the one they
// would most like.
//
// Each row is a label and, if the host wants one, a link. There was a note field under each item
// as well, showing under the name on the invite. It went: the block draws the list as a sentence
// now, the way the plate card draws what is covered, and a sentence has nowhere to put a note.
// A field whose result cannot be seen anywhere is the fault CLAUDE.md opens with.
export function WishlistEditor({ eventId, items }: { eventId: string; items: HostWishlistItem[] }) {
  const [pending, start] = useTransition();
  const [order, setOrder] = useState<string[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<HostWishlistItem | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const byId = new Map(items.map((i) => [i.id, i]));
  // The dragged order while a write settles, with anything the server has since removed dropped
  // rather than drawn as a hole.
  const ids = (order ?? items.map((i) => i.id)).filter((id) => byId.has(id));

  function open(item: HostWishlistItem | null) {
    setLabel(item?.label ?? "");
    setUrl(item?.url ?? "");
    if (item) setEditing(item); else setAdding(true);
  }

  function save() {
    const what = label.trim();
    if (!what) return;
    const item = editing;
    setAdding(false);
    setEditing(null);
    start(() => {
      void (item
        ? editWishlistItem(eventId, item.id, what, url)
        : addWishlistItem(eventId, what, url));
    });
  }

  return (
    <>
      <div className="card-head">
        <span className="ql">{copy.host.wishHeading}</span>
        <button type="button" className="btn small" onClick={() => open(null)}>{copy.host.wishAdd}</button>
      </div>
      <p className="hint">{copy.host.wishBlurb}</p>

      {items.length === 0 ? (
        <p className="muted">{copy.host.wishNone}</p>
      ) : (
        <Reorder<string>
          items={ids}
          label={(id) => byId.get(id)?.label ?? ""}
          disabled={pending}
          onReorder={(next) => { setOrder(next); start(() => { void setWishlistOrder(eventId, next); }); }}
        >
          {(id) => {
            const item = byId.get(id)!;
            // Position in the list as it is drawn, which is the order the server stores and the
            // guest reads. Taken from ids rather than from the row's sort so that a drag still
            // settling shows the host what they have just done.
            const i = ids.indexOf(id);
            // The first idea is the general one, the sentence about the kind of thing he likes
            // rather than a thing anybody can buy, so nobody crosses it off: not a guest, whose
            // tap the database refuses, and not the host, who has no button for it here. A link
            // rules it out too, for the reason in Ideas.tsx: the word can open a shop or cross
            // itself out, not both.
            //
            // Put back stays on a first idea that is already crossed off, which happens when a
            // host drags a crossed one to the top. Without it the only way to undo would be to
            // drag it back down.
            const crossable = !item.url && (i > 0 || item.claimed);
            return (
              <div className="wish-row">
                <span className="what">
                  <b className={item.claimed ? "gone" : undefined}>{item.label}</b>
                  {item.url && <span className="sub link">{item.url}</span>}
                </span>
                {crossable && (
                  <button
                    type="button" className="as-link small" disabled={pending}
                    onClick={() => start(() => { void setWishClaimed(eventId, item.id, !item.claimed); })}
                  >
                    {item.claimed ? copy.host.wishBack : copy.host.wishCross}
                  </button>
                )}
                <button type="button" className="as-link small" onClick={() => open(item)}>{copy.host.wishEdit}</button>
              </div>
            );
          }}
        </Reorder>
      )}

      {(adding || editing) && (
        <Sheet
          title={editing ? copy.host.wishEdit : copy.host.wishAdd}
          dirty={Boolean(label.trim())}
          onClose={() => { setAdding(false); setEditing(null); }}
        >
          {/* This sheet is drawn inside the gifts drawer's form, because that is where the wish
              list lives on the screen. So it has to keep its keystrokes to itself, twice over.
              Both were measured by pressing the keys, not reasoned about:

              Enter in either box submitted the gifts form. In this session that only showed up as
              a POST, since the action rejects without a signed-in host, but with a real host it
              saves the drawer, closes it, and takes the half-typed idea with it.

              And any keystroke marked the drawer dirty, so closing it afterwards asked whether to
              discard work that had already saved itself. The list writes its own rows the moment
              you press the button, and none of its boxes is a field of the event. */}
          <div
            className="sheet-body"
            onKeyDown={(ev) => {
              if (ev.key !== "Enter") return;
              if ((ev.target as HTMLElement).tagName !== "INPUT") return;
              ev.preventDefault();
              save();
            }}
            onInput={(ev) => ev.stopPropagation()}
            onChange={(ev) => ev.stopPropagation()}
          >
            <div className="field">
              <label htmlFor="wish_label">{copy.host.wishWhat}</label>
              <input
                id="wish_label" type="text" value={label} autoFocus autoComplete="off"
                placeholder={copy.host.wishWhatPlaceholder}
                onChange={(ev) => setLabel(ev.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="wish_url">{copy.host.wishLink}</label>
              <input
                id="wish_url" type="url" inputMode="url" value={url} autoComplete="off"
                placeholder="https://"
                onChange={(ev) => setUrl(ev.target.value)}
              />
              <span className="hint">{copy.host.wishLinkHint}</span>
            </div>
            <div className="actions">
              <button type="button" className="btn primary" onClick={save} disabled={pending || !label.trim()}>
                {editing ? copy.host.wishSave : copy.host.wishAdd}
              </button>
              {editing && (
                <button
                  type="button" className="as-link small"
                  onClick={() => {
                    const item = editing;
                    setEditing(null);
                    start(() => { void removeWishlistItem(eventId, item.id); });
                  }}
                >
                  {copy.host.wishRemove}
                </button>
              )}
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
