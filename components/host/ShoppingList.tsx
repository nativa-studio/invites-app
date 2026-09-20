"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { shoppingCount, type ShoppingItem } from "@/lib/shopping";
import { Reorder } from "./Reorder";
import { Sheet } from "./Sheet";
import {
  addShoppingItem, clearGotShopping, editShoppingItem, removeShoppingItem,
  setShoppingGot, setShoppingOrder,
} from "@/app/app/events/[id]/actions";

// The shopping list, for a host standing in a shop.
//
// Which is the whole brief for this screen. Every other host screen is used sitting down, with
// two hands and time to read; this one is used one handed, in a queue, with a trolley. So the
// thing you do ninety times out of a hundred, ticking a line off, is the whole row rather than a
// small box at one end of it, and everything else is behind a tap.
//
// The list is not split into two. A bought line stays where it is, struck through, and falls to
// the bottom on the next load: taking it off the screen the instant it is ticked makes an
// accidental tap impossible to undo by eye, and a host who ticks the wrong thing needs to see
// what they just did far more than they need a tidy list.
export function ShoppingList({ eventId, items }: { eventId: string; items: ShoppingItem[] }) {
  const [pending, start] = useTransition();
  const [order, setOrder] = useState<string[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ShoppingItem | null>(null);
  const [label, setLabel] = useState("");
  const [quantity, setQuantity] = useState("");

  const byId = new Map(items.map((i) => [i.id, i]));
  // The dragged order while a drag is settling, so a row does not jump back before the write
  // lands. Anything the server has since removed is dropped rather than drawn as a hole.
  const ids = (order ?? items.map((i) => i.id)).filter((id) => byId.has(id));
  const { got, total } = shoppingCount(items);

  function openAdd() {
    setLabel("");
    setQuantity("");
    setAdding(true);
  }

  function openEdit(item: ShoppingItem) {
    setLabel(item.label);
    setQuantity(item.quantity ?? "");
    setEditing(item);
  }

  function save() {
    const what = label.trim();
    if (!what) return;
    const item = editing;
    setAdding(false);
    setEditing(null);
    start(() => {
      void (item
        ? editShoppingItem(eventId, item.id, what, quantity)
        : addShoppingItem(eventId, what, quantity));
    });
  }

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2 className="h2">{copy.host.shopHeading}</h2>
          <button type="button" className="btn small" onClick={openAdd}>{copy.host.shopAdd}</button>
        </div>
        <p className="hint">{copy.host.shopBlurb}</p>

        {total === 0 ? (
          <p className="hint">{copy.host.shopNone}</p>
        ) : (
          <>
            <p className="muted">{got === total ? copy.host.shopAllGot : copy.host.shopGot(got, total)}</p>
            <Reorder<string>
              items={ids}
              label={(id) => byId.get(id)?.label ?? ""}
              disabled={pending}
              onReorder={(next) => { setOrder(next); start(() => { void setShoppingOrder(eventId, next); }); }}
            >
              {(id) => {
                const item = byId.get(id)!;
                return (
                  <div className={`shop-row${item.got ? " got" : ""}`}>
                    {/* The tick is the row. A host with a trolley in one hand gets the whole line
                        as a target rather than a 20px box at the end of it. */}
                    <button
                      type="button"
                      className="shop-tick"
                      aria-pressed={item.got}
                      onClick={() => start(() => { void setShoppingGot(eventId, item.id, !item.got); })}
                    >
                      <span className="box" aria-hidden="true">{item.got ? "✓" : ""}</span>
                      <span className="what">
                        <span className="l">{item.label}</span>
                        {item.quantity && <span className="q">{item.quantity}</span>}
                        {item.got && item.gotBy && <span className="by">{copy.host.shopGotBy(item.gotBy)}</span>}
                      </span>
                      <span className="host-sr">{copy.host.shopTick}</span>
                    </button>
                    <button type="button" className="as-link small" onClick={() => openEdit(item)}>
                      {copy.host.shopEdit}
                    </button>
                  </div>
                );
              }}
            </Reorder>
            {got > 0 && (
              <button
                type="button"
                className="btn small"
                disabled={pending}
                onClick={() => start(() => { void clearGotShopping(eventId); setOrder(null); })}
              >
                {copy.host.shopClear}
              </button>
            )}
            {got > 0 && <p className="hint">{copy.host.shopClearHint}</p>}
          </>
        )}
      </section>

      {(adding || editing) && (
        <Sheet
          title={editing ? copy.host.shopEdit : copy.host.shopAdd}
          dirty={Boolean(label.trim())}
          onClose={() => { setAdding(false); setEditing(null); }}
        >
          <div className="sheet-body">
            <div className="field">
              <label htmlFor="shop_label">{copy.host.shopWhat}</label>
              <input
                id="shop_label"
                type="text"
                value={label}
                autoFocus
                autoComplete="off"
                placeholder={copy.host.shopWhatPlaceholder}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              />
            </div>
            <div className="field">
              <label htmlFor="shop_qty">{copy.host.shopHowMuch}</label>
              <input
                id="shop_qty"
                type="text"
                value={quantity}
                autoComplete="off"
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              />
              <span className="hint">{copy.host.shopHowMuchHint}</span>
            </div>
            <div className="actions">
              <button type="button" className="btn primary" onClick={save} disabled={pending || !label.trim()}>
                {editing ? copy.host.shopEdit : copy.host.shopAdd}
              </button>
              {editing && (
                <button
                  type="button"
                  className="as-link small"
                  onClick={() => {
                    const item = editing;
                    setEditing(null);
                    start(() => { void removeShoppingItem(eventId, item.id); });
                  }}
                >
                  {copy.host.shopRemove}
                </button>
              )}
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
