"use client";
import { useRef, useState } from "react";

// Drag to reorder, on a phone.
//
// Pointer events rather than HTML5 drag and drop, which does nothing at all on touch: there is no
// dragstart from a finger. So the handle captures the pointer and the list does the arithmetic.
//
// The rows are measured once, when the drag starts, rather than on every move. Measuring during a
// drag reads back positions this component has itself just shifted, which feeds its own output
// into its input and makes the list flicker between two orders.
//
// Dragging is not something a keyboard can do, so the handle is a button and the arrow keys move
// the row it belongs to. One control, two ways to work it, rather than a row of little arrows
// sitting next to a handle doing the same job.
export function Reorder<T extends string>({
  items, label, onReorder, disabled, children,
}: {
  items: readonly T[];
  /** The accessible name of the handle. The row's own content is the caller's, through children. */
  label: (item: T) => string;
  onReorder: (next: T[]) => void;
  disabled?: boolean;
  children: (item: T) => React.ReactNode;
}) {
  // `h` rides along in the state rather than being read back off the measurements during render:
  // the row heights are a ref, and a ref read while rendering is a value React cannot see change.
  const [drag, setDrag] = useState<{ from: number; to: number; dy: number; h: number } | null>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const geom = useRef<{ top: number; h: number }[]>([]);
  const startY = useRef(0);
  const lastY = useRef(0);
  const from = useRef(0);
  // The thing the list sits inside, when that thing scrolls. In a sheet it is the sheet's body,
  // which is usually shorter than the list, so without this a row could only ever be dropped
  // somewhere already on screen.
  const scroller = useRef<HTMLElement | null>(null);
  const startScroll = useRef(0);
  const raf = useRef<number | null>(null);

  function commit(a: number, b: number) {
    if (b === a || b < 0 || b >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(a, 1);
    next.splice(b, 0, moved);
    onReorder(next);
  }

  function scrollableAncestor(el: HTMLElement | null): HTMLElement | null {
    for (let n = el?.parentElement ?? null; n; n = n.parentElement) {
      const o = getComputedStyle(n).overflowY;
      if ((o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight) return n;
    }
    return null;
  }

  // Where the row has got to, and which slot that puts it in.
  //
  // The scroll delta is in here because the rows were measured against the window, and scrolling
  // moves every one of them, the dragged one included. Without it the row slides out from under
  // the finger the moment the list scrolls.
  function recompute() {
    const g = geom.current;
    const i = from.current;
    if (!g[i]) return;
    const scrolled = (scroller.current?.scrollTop ?? 0) - startScroll.current;
    const dy = lastY.current - startY.current + scrolled;
    const centre = g[i].top + g[i].h / 2 + dy;
    let to = i;
    for (let j = 0; j < g.length; j++) {
      const mid = g[j].top + g[j].h / 2;
      if (j > i && centre > mid) to = j;
      if (j < i && centre < mid) { to = j; break; }
    }
    setDrag({ from: i, to, dy, h: g[i].h });
  }

  // Held near the top or bottom of the scrolling box, the list creeps that way, faster the closer
  // to the edge. This is what makes a long list draggable at all on a short screen.
  function step() {
    const el = scroller.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const EDGE = 60;
      const MAX = 16;
      let v = 0;
      if (lastY.current < r.top + EDGE) v = -MAX * Math.min(1, (r.top + EDGE - lastY.current) / EDGE);
      else if (lastY.current > r.bottom - EDGE) v = MAX * Math.min(1, (lastY.current - (r.bottom - EDGE)) / EDGE);
      if (v) el.scrollTop += v;
    }
    recompute();
    raf.current = requestAnimationFrame(step);
  }

  function down(ev: React.PointerEvent<HTMLButtonElement>, i: number) {
    if (disabled) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    geom.current = rows.current.map((el) => {
      const r = el!.getBoundingClientRect();
      return { top: r.top, h: r.height };
    });
    scroller.current = scrollableAncestor(rows.current[i]);
    startScroll.current = scroller.current?.scrollTop ?? 0;
    startY.current = ev.clientY;
    lastY.current = ev.clientY;
    from.current = i;
    setDrag({ from: i, to: i, dy: 0, h: geom.current[i].h });
    raf.current = requestAnimationFrame(step);
  }

  function move(ev: React.PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    lastY.current = ev.clientY;
    recompute();
  }

  function up() {
    if (raf.current !== null) { cancelAnimationFrame(raf.current); raf.current = null; }
    if (!drag) return;
    commit(drag.from, drag.to);
    setDrag(null);
  }

  // Everything between where the row came from and where it is now slides one place to make room.
  function shift(i: number): number {
    if (!drag) return 0;
    const h = drag.h;
    if (i === drag.from) return drag.dy;
    if (drag.from < drag.to && i > drag.from && i <= drag.to) return -h;
    if (drag.from > drag.to && i < drag.from && i >= drag.to) return h;
    return 0;
  }

  return (
    <ol className="reorder">
      {items.map((item, i) => {
        const held = drag?.from === i;
        return (
          <li
            key={item}
            ref={(el) => { rows.current[i] = el; }}
            className={`row${held ? " held" : ""}`}
            style={{ transform: `translateY(${shift(i)}px)`, transition: drag && !held ? "transform 160ms ease" : undefined }}
          >
            <button
              type="button"
              className="grip"
              aria-label={`Reorder ${label(item)}. Use the arrow keys to move it.`}
              disabled={disabled}
              onPointerDown={(ev) => down(ev, i)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onKeyDown={(ev) => {
                if (ev.key !== "ArrowUp" && ev.key !== "ArrowDown") return;
                ev.preventDefault();
                commit(i, i + (ev.key === "ArrowUp" ? -1 : 1));
              }}
            >
              <span aria-hidden="true">⠿</span>
            </button>
            {children(item)}
          </li>
        );
      })}
    </ol>
  );
}
