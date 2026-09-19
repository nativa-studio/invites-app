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

  function commit(from: number, to: number) {
    if (to === from || to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  }

  function down(ev: React.PointerEvent<HTMLButtonElement>, i: number) {
    if (disabled) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    geom.current = rows.current.map((el) => {
      const r = el!.getBoundingClientRect();
      return { top: r.top, h: r.height };
    });
    startY.current = ev.clientY;
    setDrag({ from: i, to: i, dy: 0, h: geom.current[i].h });
  }

  function move(ev: React.PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    const g = geom.current;
    const dy = ev.clientY - startY.current;
    // Where the middle of the row being dragged has got to, against where the others started.
    const centre = g[drag.from].top + g[drag.from].h / 2 + dy;
    let to = drag.from;
    for (let i = 0; i < g.length; i++) {
      const mid = g[i].top + g[i].h / 2;
      if (i > drag.from && centre > mid) to = i;
      if (i < drag.from && centre < mid) { to = i; break; }
    }
    setDrag({ from: drag.from, to, dy, h: drag.h });
  }

  function up() {
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
